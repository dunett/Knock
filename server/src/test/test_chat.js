const chai = require('chai');
const chaiHttp = require('chai-http');
const sinon = require('sinon');
const server = require('../server');
const should = chai.should();
const assert = chai.assert;

chai.use(chaiHttp);

describe('chat router test success', () => {
  it('채팅 목록 가져오기 시 릴레이션이 있을 때 성공 메시지를 보낸다.', (done) => {
    chai.request(server)
      .get('/chat/list/0')
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.have.property('msg');
        res.body.should.have.property('list');
        done();
      });
  });

  it('채팅 목록 가져오기 시 채팅 메시지가 없을 경우 성공 메시지를 보낸다.', (done) => {
    chai.request(server)
      .get('/chat/list/25')
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.have.property('msg');
        res.body.msg.should.equal('Not found message');
        done();
      });
  });

  it('대화 내용 가져오기 성공 했을 때 성공 메시지를 보낸다.', (done) => {
    chai.request(server)
      .get('/chat/0/1')
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.have.property('msg');
        done();
      });
  });
});

describe('chat router test fail', () => {
  it('채팅 목록 가져오기 시 릴레이션이 없을 때 실패 메시지를 보낸다.', (done) => {
    chai.request(server)
      .get('/chat/list/111111111111')
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.have.property('msg');
        res.body.msg.should.equal('Not found relation');
        done();
      });
  });

  it('대화 내용 가져오기 실패 했을 때 실패 메시지를 보낸다.', (done) => {
    chai.request(server)
      .get('/chat/11111111/1')
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.have.property('msg');
        res.body.msg.should.equal('Not found chat');
        done();
      });
  });

});