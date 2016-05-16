'use strict';

var request = require('supertest'),
    should = require('should'),
    _ = require('underscore'),
    Q = require('q');

var tmpVersions,
    ItemController,
    RequestService,
    CommonService,
    testSetReqModel = {
      fileInfo: {},
      files: []
    },
    testSetResModel = {
      success: ''
    };

if( process.env['MODE']=='ALL_DEBUG' ){
  //Operation Test
  // startTest();
}
startTest();

function startTest() {
  describe('=== A. fitting 테스트 케이스 ===\n', function() {
    testA0();
    testA1();
  });
}

function testA0() {
  describe('=== A.0 모듈 설정 === \n', function() {
    it('A.0.1 assignModule', function(done) {
      assignBasicModule();
      assignFittingCtrlModule();
      done();
    });
  });
}

function testB1() {
  describe('=== A.1 Png 등록 테스트 === \n', function () {
    it('A.1.1 Png 등록 1000개', function(done) {
      this.timeout(300000);

      for(var i = 0; i < 1000; i++) {
        testSetReqModel.fileInfo['file' + i] = '/Users/jeongjinseok/Downloads/Photo.png';
        testSetReqModel.files.push('file' + i);
      }

      reqSetPng(
        testSetReqModel,
        200,
        'A.1.1 Png 등록 ERROR: ',
        function (body) {
          assertSetVideoCallback(body);
        }
      ).then(
        function(data) {
          testSetResModel = data;
          sails.log.debug('A.1.1 body:', testSetResModel);
          done();
        }
      );
    });
  });
}

function assignBasicModule() {
  tmpVersions = require('../../../package.json');
  RequestService = require('../../util/RequestService.js');
  CommonService = require('../../util/CommonService.js');
}

function assignFittingCtrlModule() {
  ItemController = require('../../../api/controllers/ItemController.js');

}

function reqSetPng(sendData, expectStatus, errLogTitle, assertCallback){
  var deferred = Q.defer();

  return CommonService.reqTestAPI({
    r: request,
    url: RequestService.API_URL.MULTI_UPLOAD,
    method: 'post/multipart',
    sendData: sendData,
    expectStatus: expectStatus,
    sailsSid: CommonService.getTestSid(),
    errLogTitle: errLogTitle,
    assertCallback: assertCallback,
    done: null
  });

  return deferred.promise;
}

function assertSetVideoCallback(body){
  body.should.have.property('success');
}




