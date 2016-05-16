var Q = require('q');
var fs = require('fs');
module.exports = {
  uploadTemp: uploadTemp,
  s3Upload: s3Upload
};

function uploadTemp(req, fileInfo, file) {
  var deferred = Q.defer();

  req.file(file).upload({
    dirname: './' + fileInfo.localDir/* + '/' + getFittingFilename(fileInfo, file)*/,
    maxBytes: 2000000000
  }, function (err, uploadedFiles) {

    if (err || !uploadedFiles || uploadedFiles.length === 0) {
      deferred.reject(err);
    } else {
      var fileName = uploadedFiles[0].filename,
        fd = uploadedFiles[0].fd,
        ext = fileName.split('.').pop(),
        size = fs.statSync(fd).size;
      /*pow = parseInt(Math.floor(Math.log(bytes) / Math.log(1024))),
       size = (bytes / Math.pow(1024, pow)).toFixed(2);*/

      fileInfo[file] = {
        fd : fd,
        ext : ext,
        size : size
      };

      if(!fileInfo.files) {
        fileInfo.files = [];
      }

      fileInfo.files.push(file);

      deferred.resolve();

    }
  });

  return deferred.promise;
}

function s3Upload(fileInfo, file) {
  var deferred = Q.defer(),
      s3Dir = fileInfo.disk,
      s3Path = s3Dir + file,
      localPath = fileInfo[file].fd;

  fileInfo.S3.upload(localPath, s3Path, function(err, result) {
    if (err) {
      err = new Error('S3 upload failure...');
      deferred.reject(err);
    } else {
      deferred.resolve();
    }
  });

  return deferred.promise;

}
