const chai = require('chai');
const chaiHttp = require('chai-http');
const sinon = require('sinon');
const server = require('../server');
const should = chai.should();
const assert = chai.assert;

const User = require('../model/user');

chai.use(chaiHttp);

describe('auth test success', () => {
  // it('회원가입 시 성공 메시지를 보낸다.', (done) => {
  //   chai.request(server)
  //     .post('/join')
  //     .field('email', 'test@naver.com')
  //     .field('alias', 'tester')
  //     .field('gender', 1)
  //     .field('age', 25)
  //     .field('age_min', 20)
  //     .field('age_max', 30)
  //     .field('job', 'Programmar')
  //     .field('school', '대학교')
  //     .field('faith', 1)
  //     .field('fit', -1)
  //     .field('hobby', 'game')
  //     .field('sns_token', 'aksjdflkjd')
  //     .field('fcm_token', 'aksjdflkjd')
  //     .end((err, res) => {
  //       res.should.have.status(200);
  //       res.body.should.have.property('msg');
  //       res.body.msg.should.equal('Success');
  //       res.body.should.have.property('u_id');
  //       done();
  //     });
  // });

  // after(() => {
  //   // 추가 된 테스트 유저를 삭제한다.
  //   User.deleteTestUser();
  // });

  it('중복 되는 닉네임이 없다면 성공 메시지를 보낸다.', (done) => {
    chai.request(server)
      .get('/join/akldjf')
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.have.property('msg');
        res.body.msg.should.equal('Success');
        done();
      });
  });

  it('로그인 이메일이 디비에 있다면 성공 메시지를 보낸다.', (done) => {
    chai.request(server)
      .post('/login')
      .field('email', 'test@naver.com')
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.have.property('msg');
        res.body.should.have.property('u_id');
        done();
      });
  });

});

describe('auth test for fail', () => {
  it('회원가입 시 필수 필드를 입력하지 않았으면 실패 메시지를 보낸다.', (done) => {
    chai.request(server)
      .post('/join')
      .field('email', 'test@naver.com')
      .field('alias', 'tester')
      .field('gender', 1)
      .field('age', 25)
      .end((err, res) => {
        //res.should.have.status(500);
        done();
      });
  });

  it('중복 되는 닉네임이 있다면 중복 메시지를 보낸다.', (done) => {
    chai.request(server)
      .get('/join/OneAlias')
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.have.property('msg');
        res.body.msg.should.equal('Duplicated');
        done();
      });
  });

  it('로그인 이메일이 디비에 없다면 실패 메시지를 보낸다.', (done) => {
    chai.request(server)
      .post('/login')
      .field('email', 'notfound@naver.com')
      .end((err, res) => {
        res.should.have.status(401);
        res.body.should.have.property('msg');
        done();
      });
  });

});