var Q = require('q');
module.exports = {
  multiUpload: function(req, res) {
    var localDir = require("./libs/uuid.js").setUUID();
    var fileInfo = {
      localDir: localDir,
      fileInfo: {}
    };
    var params = req.params.all();

    var start_second, end_second;
    var start_second1, end_second1;
    var start_second2, end_second2;

    fileInfo.filesLength = params.filesLength;

    start_second = new Date().getTime() / 1000;
    start_second1 = new Date().getTime() / 1000;

    Q.fcall(function() {
      return uploadFilesAll(req, fileInfo);
    })
      .then(function() {

        end_second1 = new Date().getTime() / 1000;
        start_second2 = new Date().getTime() / 1000;

        end_second = new Date().getTime() / 1000;
        sails.log.debug('::::::: SUMMARY ::::::');
        sails.log.debug("total : " + (end_second - start_second));
        sails.log.debug("1.uploadLocal : " + (end_second1 - start_second1));
        //sails.log.debug("2.initVideo : " + (end_second2 - start_second2));

        return res.send(200, {"success": true});
      })
      .catch(function(err) {
        return res.send(500, err);
      });
  }
};


function uploadFilesAll(req, fileInfo) {
  var deferred = Q.defer();

  var promises = [];

  for (var i = 0; i < fileInfo.filesLength; i++) {

    var promise = doUpload(req, fileInfo, ('file' + i));
    promises.push(promise);

  }


  Q.allSettled(promises).then(function(results) {
    sails.log.debug('local uploading done...' + ' ::: localDir---' + fileInfo.localDir);

    deferred.resolve();
  });
  return deferred.promise;
}


function doUpload(req, fileInfo, file) {
  var deferred = Q.defer();

  fileInfo.currentFile = file;

  FileService.uploadTemp(req, fileInfo, file)
    .then(function() {
      deferred.resolve();
    })
    .catch(function(err) {
      deferred.reject(err);
    });

  return deferred.promise;
}
