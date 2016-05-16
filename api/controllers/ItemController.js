var Q = require('q');
module.exports = {
  multiUpload: function(req, res) {
    var fileInfo = {};

    Q.fcall(function() {
      return uploadFilesAll(req, fileInfo);
    })
  }
};


function uploadFilesAll(req, fileInfo) {
  var deferred = Q.defer();


  var promises = [];
  for (var i = 0; i < 1000; i++) {
    var promise = doUpload(req, fileInfo, ('file' + (i+1)));
    promises.push(promise);
  }

  Q.allSettled(promises).then(function(results) {
    sails.log.debug('local uploading done...' + ' ::: localDir---');

    deferred.resolve();
  });
  return deferred.promise;
}
