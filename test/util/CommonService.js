var should = require('should'),
  Q = require('q');


module.exports = {
  reqTestAPI: reqTestAPI,
  getQueryPath: getQueryPath,
  getTestSid: function(){return 's%3A4VuWkHZ4rtLqt0QRBiw0iYnWdO_9cm_A.NTP0sWzd7Fsjl5i4gpam0Gsgg0qBh%2BwewfD%2B7SxCWqw';}
};

function reqTestAPI(opt) {
  switch (opt.method) {
    case "get":
      return getTestAPI(opt);
    case "post":
      return postTestAPI(opt);
    case "post/multipart":
      return postMultipartTestAPI(opt);
  }
}

function getTestAPI(opt) {
  sails.log.debug('reqTestAPI opt: ', opt);

  var deferred = Q.defer();

  opt.r(sails.hooks.http.app)
    .get(opt.url+'&_='+(new Date().getTime()))
    .set('Accept', 'application/json, text/plain, */*')
    .set('Content-Type', 'application/json;charset=UTF-8')
    .set('Cookie', 'sails.sid='+opt.sailsSid)
    .end(function(err, res) {
      if(err) {
        sails.log.debug(opt.errLogTitle, err);
        deferred.reject({debug:{status:500}, data: err});
        throw err;
      }
      checkDebug(res.body, opt.expectStatus);
      if(opt.assertCallback && opt.expectStatus === 200) {
        opt.assertCallback(res.body);
      }
      deferred.resolve(res.body);

      if(opt.done) opt.done();
    });

  return deferred.promise;
}

function postTestAPI(opt) {
  sails.log.debug('reqTestAPI opt: ', opt);
  var deferred = Q.defer();

  opt.r(sails.hooks.http.app)
    .post(opt.url)
    .set('Accept', 'application/json, text/plain, */*')
    .set('Content-Type', 'application/json;charset=UTF-8')
    .set('Cookie', 'sails.sid='+opt.sailsSid)
    .send(opt.sendData)
    .end(function(err, res) {
      if(err) {
        sails.log.debug(opt.errLogTitle, err);
        deferred.reject({debug:{status:500}, data:err});
        throw err;
      }

      checkDebug(res.body, opt.expectStatus);
      if(opt.assertCallback && opt.expectStatus===200) {
        opt.assertCallback(res.body);
      }

      deferred.resolve(res.body);

      if(opt.done) opt.done();
    });

  return deferred.promise;
}

function postMultipartTestAPI(opt) {
  sails.log.debug('reqTestAPI opt: ', opt);
  var deferred = Q.defer();

  var app = opt.r(sails.hooks.http.app).post(opt.url);
  app = setFieldsNFiles(app, opt);
  app.end(function(err, res) {
      if(err) {
        sails.log.debug(opt.errLogTitle, err);
        deferred.reject({debug:{status:500}, data:err});
        throw err;
      }

      checkDebug(res.body, opt.expectStatus);
      if(opt.assertCallback && opt.expectStatus===200) {
        opt.assertCallback(res.body);
      }

      deferred.resolve(res.body);

      if(opt.done) opt.done();
    });

  return deferred.promise;
}

function checkDebug(result, status) {
  result.should.have.property('debug');
  result.debug.should.have.property('status');
  parseInt(result.debug.status).should.equal(status);
}

function getQueryPath(obj, prefix, postfix) {
  var str='';
  if(obj){}else{
    return '';
  }

  for(var i in obj){
    str += i+'='+obj[i]+'&';
  }
  str = str.substr(0, str.length-1);
  if(prefix)str = prefix + str;
  if(postfix)str = str + postfix;
  return str;
}

function setFieldsNFiles(app, opt) {

  var fields = opt.sendData.fields;
  var data = opt.sendData;
  var files = opt.sendData.files;
  var fileInfo = opt.sendData.fileInfo;

  if(fields && fields.length > 0) {
    for (var i = 0; i < fields.length ; i++) {
      if(data[fields[i]]) {
        app.field(fields[i], data[fields[i]]);
      }
    }
  }

  if(files && files.length > 0 && fileInfo) {
    for (var i = 0; i < files.length ; i++) {
      if(fileInfo[files[i]]) {
        app.attach(files[i], fileInfo[files[i]]);
      }
    }
  }

  return app;
}
