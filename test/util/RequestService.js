var Q = require('q'),
    http = require('http'),

    querystring = require('querystring');

var API_URL_INFO = {
      BASE_URL: sails.config.urlinfo.domain,
      PORT: sails.config.urlinfo.port
    },
    API_URL = {
      MULTI_UPLOAD: '/item/multiUpload'
    };

module.exports = {
  API_URL_INFO: API_URL_INFO,
  API_URL: API_URL,
  getUrl: getUrl,
  getVerifiCode: getVerifiCode,
  checkUrl: checkUrl, /* 사용확인 */
  req: req,
  reduceUrl: reduceURL /* 사용확인 */
};

function getUrl(url) {
  var key = "";
  for (var i in API_URL) {
    if (API_URL[i] === url) {
      key = i;
    }
  }
  return API_URL[key];
}

function getVerifiCode(opt) {

  return req({
    url: API_URL_INFO.BASE_URL,
    path: API_URL.GET_VERIFI_CODE,
    port: API_URL_INFO.PORT,
    method: 'post',
    data: opt.data
  });
}

function checkUrl(url) {
  var chk_url = getUrl(url);
  return (!(typeof chk_url === "undefined" || chk_url === ""));
}
function req(opt) {

  var deferred = Q.defer(),
    post_req,
    options = {
      host: opt.url,
      port: opt.port,
      path: opt.path,
      method: opt.method||'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Pragma': 'no-cache',
        'Cache-control': 'no-cache'
      }
    },
    json_output = "",
    json_data = "";

  if(options.method.toLowerCase()=='get'){
    if( options.path.indexOf('?')===-1 ){
      options.path += '?_='+new Date().getTime();
    }else{
      options.path += '&_='+new Date().getTime();
    }

  }else{
    options.headers['Content-Length'] = Buffer.byteLength(querystring.stringify(opt.data));
  }

  // sails.log.debug('options: ' , options);

  post_req = http.request(options, function (post_res) {
    post_res.on('data', function (chunk) {
      json_output += chunk;
    });

    post_res.on('end', function () {
      try {
        // sails.log.debug('_postReq resolve');
        // sails.log.debug('json_output: ', (json_output));
        // sails.log.debug('json_output: ', JSON.parse(json_output));
        var rel = JSON.parse(json_output);
        if(rel.debug){
          if(rel.debug.status=='200' || rel.debug.status==200){
            deferred.resolve(rel);
          }else{
            sails.log.debug('_postReq status !==200 __opt: ', opt);
            sails.log.debug('_postReq status !==200: ', rel);
            deferred.reject(rel);
          }
        }else{
          sails.log.debug('_postReq NONE_DEBUG: ', rel);
          sails.log.debug('_postReq NONE_DEBUG __opt: ', opt);
          deferred.resolve(rel);
        }
      } catch (e) {
        sails.log.debug('_postReq reject: ' , opt);
        deferred.reject({code: "SERVER_PARSE_ERROR", debug:{status:'500'}});
        sails.log.debug('--- server return : ---');
        sails.log.debug(json_output);
        sails.log.debug('--- error message : ---');
        sails.log.debug(e);
      }
    });
  });

  if(options.method.toLowerCase()=='get'){
  }else{
    post_req.write(querystring.stringify(opt.data));
  }
  post_req.end();

  return deferred.promise;
}

function reduceURL(urlObj){
  var str='';
  for(var i in urlObj){
    str += i+'='+urlObj[i];
  }
  return str;
}
