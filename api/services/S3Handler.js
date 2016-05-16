module.exports = function( region ){
  var AWS = require('aws-sdk');
  var bucket_config;
  switch( region ){
    case "image":
      AWS.config.update(sails.config.aws.s3.img.config);
      bucket_config = sails.config.aws.s3.img;
      break;
    case "data":
      AWS.config.update(sails.config.aws.s3.data.config);
      bucket_config = sails.config.aws.s3.data;
      break;
    default:
      return false;
  }

  var S3 = new AWS.S3();
  var fs = null;
  var remove = null;
  var self = this;

  // 로컬 저장소에 파일이 있는지 확인
  var checkLocal = function( source ){
    if( !fs ) fs = require('fs');
    var stats = fs.statSync( source );
    return stats.isFile();
  };

  // 로컬 저장소에 위치한 파일스트림 반환
  var readLocal = function( source ){
    if( !checkLocal( source ) ) return false;
    return fs.createReadStream( source );
  };

  // 로컬 저장소에 위치한 파일 삭제
  var deleteLocal = function( source ){
    if( !checkLocal( source ) ) return false;
    return fs.unlinkSync( source );
  };

  // S3에 위치한 파일 삭제
  this.delete = function( target, callback ){
    var param = {
      Bucket: bucket_config.bucket,
      Key: target
    };

    S3.deleteObject( param, function( err, data ){
      return callback( err, data );
    });
  };

  // S3에 위치한 폴더 및 하위 구조 모두 삭제
  this.deleteFolder = function( target, callback ){
    var params = {
      Bucket: bucket_config.bucket,
      Prefix: target+'/'
    };

    S3.listObjects(params, function(err, data) {
      if (err) return console.log(err);

      params = {Bucket: bucket_config.bucket};
      params.Delete = {};
      params.Delete.Objects = [];

      data.Contents.forEach(function(content) {
        params.Delete.Objects.push({Key: content.Key});
      });

      S3.deleteObjects(params, function(err, data) {
        if (err) return console.log(err);

        return callback(err, data);
      });
    });
  };

  // S3에 파일 업로드
  this.upload = function( source, target, callback ){
    var fd = readLocal( source );
    if( !fd ) return callback( err, data );

    var param = {
      Bucket: bucket_config.bucket,
      Key: target,
      Body: fd
    };

    S3.putObject( param, function( err, data ){
      return callback( err, data );
    });
  };

  // S3에 파일 업로드 후, 원본 파일 삭제
  this.uploadNDrop = function( source, target, callback ){
    self.upload( source, target, function( err, data ){
      deleteLocal( source );
      return callback( err, data );
    });
  };

  this.computeFileHash = function( source, callback ){
    var crypto = require('crypto');
    var hash = crypto.createHash('sha256');
    var fs = require('fs');

    hash.setEncoding('hex');

    var fd = fs.createReadStream(source);
    fd.on('error', function(err) {
      return callback( err, null );
    });

    fd.on('end', function() {
      hash.end();
      var checksum = hash.read();
      return callback( null, checksum );
    });
    fd.pipe(hash);
  };

  // 파일 해시추출 및 S3에 파일 업로드 후, 원본 파일 삭제
  this.uploadNDropNFileHash = function( source, target, callback ){
    self.computeFileHash( source, function( err, hash ){
      self.upload( source, target, function( err, data ){
        deleteLocal( source );
        return callback( err, data, hash );
      });
    });
  };



  // S3에 위치한 버킷 구조 반환
  this.scan = function( prefix, callback ){
    var param = {
      Bucket: bucket_config.bucket,
      Prefix: prefix
    };

    S3.listObjects( param, function( err, data ){
      return callback( err, data );
    });
  };

  // S3에 위치한 버킷 구조를 JSON 형태로 정리하여 반환
  this.scan2JSON = function( prefix, callback ){
    this.scan( prefix, function( err, data ){
      if( err ) return callback( err, data );
      var result = {};

      var convertURL2JSON = function( element ){
        var URL = require('url-parse');
        var url = new URL( element.Key );
        var tocken = url.pathname.split('/');
        tocken.reverse();
        tocken.pop();
        cleanupJSON( tocken, result, element );
      };

      var cleanupJSON = function( arr, target, element ){
        var key = arr.pop();
        if( typeof target[key] == "undefined" ) target[key] = {};
        if( arr.length > 0 ){
          cleanupJSON( arr, target[key], element );
        }else{
          target[key] = element;
        }
      };

      data.Contents.forEach( function( element ){
        convertURL2JSON( element );
      });

      return callback( err, result );
    });
  };
};
