const chai = require('chai');
const chaiHttp = require('chai-http');
const sinon = require('sinon');
const server = require('../server');
const should = chai.should();
const assert = chai.assert;
const fs = require('fs');

const User = require('../model/user');

chai.use(chaiHttp);

describe('user router test success ', () => {
  it('프로필 보기가 성공 했을 때 성공 메시지를 보낸다.', (done) => {
    chai.request(server)
      .get('/user/0')
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.have.property('msg');
        res.body.should.have.property('name');
        res.body.should.have.property('alias');
        res.body.should.have.property('age');
        res.body.should.have.property('area');
        res.body.should.have.property('thumbnail');
        res.body.should.have.property('profile');
        res.body.should.have.property('job');
        res.body.should.have.property('height');
        res.body.should.have.property('fit');
        res.body.should.have.property('faith');
        res.body.should.have.property('hobby');
        res.body.should.have.property('status');
        res.body.should.have.property('type');
        res.body.should.have.property('quiz');
        done();
      });
  });

  it('프로필 수정이 성공 했을 때 성공 메시지를 보낸다.', (done) => {
    chai.request(server)
      .put('/user/0')
      .field('area', 1)
      .field('job', '프로그래머')
      .field('school', '서울대학교')
      .field('faith', 1)
      .field('fit', 1)
      .field('height', 178)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.have.property('msg');
        done();
      });
  });

  it('계정 휴면이 성공 했을 때 성공 메시지를 보낸다.', (done) => {
    chai.request(server)
      .put('/user/0/sleep')
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.have.property('msg');
        done();
      });
  });

  it('계정 탈퇴가 성공 했을 때 성공 메시지를 보낸다.', (done) => {
    chai.request(server)
      .put('/user/0/black')
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.have.property('msg');
        done();
      });
  });

  it('토큰 변경이 성공 했을 때 성공 메시지를 보낸다.', (done) => {
    chai.request(server)
      .put('/user/0/token')
      .field('fcm_token', 'fcmaksdjflkjqwkejq')
      .field('sns_token', 'snsqkejqwklcnzxklc')
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.have.property('msg');
        res.body.msg.should.equal('Success');
        done();
      });
  });

  after(() => {
    // 계정 상태를 1로 돌린다.
    User.initialStatus();
  });

});

describe('user router test fail', () => {
  it('프로필 보기 존재 하지 않는 사람이면 실패 메시지를 보낸다. ', (done) => {
    chai.request(server)
      .get('/user/11111111111')
      .end((err, res) => {
        res.should.have.status(500);
        res.body.should.have.property('msg');
        done();
      });
  });

  it('토큰 변경 요청에 바디 메시지가 없으면 실패 메시지를 보낸다.', (done) => {
    chai.request(server)
      .put('/user/0/token')
      .end((err, res) => {
        res.should.have.status(500);
        res.body.should.have.property('msg');
        res.body.msg.should.equal('Not correct body message');
        done();
      });
  });

});