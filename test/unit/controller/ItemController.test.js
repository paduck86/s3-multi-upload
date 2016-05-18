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

function testA1() {
  describe('=== A.1 Png 등록 테스트 === \n', function () {
    /*it('A.1.1 Png 등록 1개', function(done) {
      this.timeout(30000);

      testSetReqModel.fileInfo = {};
      testSetReqModel.files = [];
      testSetReqModel.fileInfo['file0'] = '/Users/jeongjinseok/Downloads/Photo.png';
      testSetReqModel.files.push('file0');

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
    });*/

    it('A.1.2 Png 등록 1000개', function (done) {
      this.timeout(3000000);

      testSetReqModel.fileInfo = {};
      testSetReqModel.files = [];
      for (var i = 0; i < 10; i++) {
        if(i === 0 || i === 5 || i === 8) {
          testSetReqModel.fileInfo['file' + i] = '/Users/jeongjinseok/Downloads/genymotion-2.6.0.dmg';
          testSetReqModel.files.push('file' + i);
        }else{
          testSetReqModel.fileInfo['file' + i] = '/Users/jeongjinseok/Downloads/Photo.png';
          testSetReqModel.files.push('file' + i);
        }
      }

      reqSetPng(
        testSetReqModel,
        200,
        'A.1.2 Png 등록 ERROR: ',
        function (body) {
          assertSetVideoCallback(body);
        }
      ).then(
        function (data) {
          testSetResModel = data;
          sails.log.debug('A.1.2 body:', testSetResModel);
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




