var Q = require('q');
var fs = require('fs');
module.exports = {
  uploadTemp: uploadTemp
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

      fileInfo.fileInfo[file] = {
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
