const chai = require('chai');
const chaiHttp = require('chai-http');
const sinon = require('sinon');
const server = require('../server');
const should = chai.should();
const assert = chai.assert;

const Report = require('../model/report');

chai.use(chaiHttp);

describe('report test', () => {

  // describe('report test success', () => {
  //   it('/report 요청에 대해 성공 메시지를 보낸다.', (done) => {
  //     chai.request(server)
  //       .post('/report')
  //       .field('sender', 10000)
  //       .field('message', 'test message')
  //       .end((err, res) => {
  //         res.should.have.status(200);
  //         res.body.should.have.property('msg');
  //         res.body.msg.should.equal('Success');
  //         done();
  //       });
  //   });

  //   after(() => {
  //     // 추가 된 테스트 신고를 삭제한다.
  //     Report.deleteTestReport();
  //   });
  // });

  describe('report test fail', () => {
    it('/report 요청에 대해 sender가 u_id가 아닌 경우 실패 메시지를 보낸다.', (done) => {
      chai.request(server)
        .post('/report')
        .field('sender', 'who')
        .field('message', 'What')
        .end((err, res) => {
          res.should.have.status(500);
          done();
        });
    });

    it('/report 요청에 대해 sender가 빠진 경우 실패 메시지를 보낸다.', (done) => {
      chai.request(server)
        .post('/report')
        .field('message', 'What')
        .end((err, res) => {
          res.should.have.status(500);
          done();
        });
    });

    it('/report 요청에 대해 message가 빠진 경우 실패 메시지를 보낸다.', (done) => {
      chai.request(server)
        .post('/report')
        .field('sender', 'who')
        .end((err, res) => {
          res.should.have.status(500);
          done();
        });
    });
  });

});