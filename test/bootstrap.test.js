/*
 - cli example
 sudo NODE_ENV=localtest USER_ID=id USER_PW=pw MODE=debug LOG_LEVEL=error npm run test
 */
var Sails = require('sails'),
  sails,
  request = require('supertest'),
  should = require('should');

before(function(done) {

  // Increase the Mocha timeout so that Sails has enough time to lift.
  this.timeout(5000);

  Sails.lift({
    // configuration for testing purposes
    log: {
      level: ( (process.env['LOG_LEVEL']) || 'debug')
    },
    hook:{
      grunt:false
    }

  }, function(err, server) {
    sails = server;
    if (err) return done(err);
    // here you can load fixtures, etc.
    console.log('==========================>sails lift start');
    done(err, sails);
  });
});

after(function(done) {
  // here you can clear fixtures, etc.
  this.timeout(5000);
  request(sails.hooks.http.app)
    .get( require("./util/RequestService.js").API_URL.SIGN_OUT )
    .send()
    .end(function(err, res){
      if (err){
        sails.log.debug('Logout Error' , err);
        throw err;
      }

      setTimeout(function(){
        Sails.lower(done);
        console.log('==========================>sails lift end');
      },1500);
    });

});
