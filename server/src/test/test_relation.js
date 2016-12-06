const chai = require('chai');
const chaiHttp = require('chai-http');
const sinon = require('sinon');
const server = require('../server');
const should = chai.should();
const assert = chai.assert;

const mbti = require('../model/mbti').calculate;

chai.use(chaiHttp);

describe('relation test', () => {
  it('/relation/favor/1 요청에 대해 성공 메시지를 보낸다', (done) => {
    chai.request(server)
      .put('/relation/favor/1')
      .field('u_id', 1)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.have.property('msg');
        done();
      });
  });

  it('/relation/favor/1 요청에 u_id를 보내지 않으면 실패 메시지를 보낸다.', (done) => {
    chai.request(server)
      .put('/relation/favor/1')
      .end((err, res) => {
        res.should.have.status(500);
        res.body.should.have.property('msg');
        done();
      });
  });

  it('/relation/favor/1 요청에 relation에 속하지 않는 u_id를 보내면 실패 메시지를 보낸다.', (done) => {
    chai.request(server)
      .put('/relation/favor/1')
      .field('u_id', 222)
      .end((err, res) => {
        res.should.have.status(500);
        res.body.should.have.property('msg');
        done();
      });
  });

});