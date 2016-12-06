const chai = require('chai');
const chaiHttp = require('chai-http');
const sinon = require('sinon');
const server = require('../server');
const should = chai.should();
const assert = chai.assert;

const mbti = require('../model/mbti').calculate;

chai.use(chaiHttp);

describe('Mbti test', () => {
  const values = [
    { VALUE1: 'N', VALUE2: 'S' },
    { VALUE1: 'S', VALUE2: 'N' },
    { VALUE1: 'N', VALUE2: 'S' },
    { VALUE1: 'N', VALUE2: 'S' },
    { VALUE1: 'S', VALUE2: 'N' },
    { VALUE1: 'S', VALUE2: 'N' },
    { VALUE1: 'N', VALUE2: 'S' },
    { VALUE1: 'N', VALUE2: 'S' },
    { VALUE1: 'S', VALUE2: 'N' },
    { VALUE1: 'N', VALUE2: 'S' },
    { VALUE1: 'A', VALUE2: 'C' },
    { VALUE1: 'B', VALUE2: 'D' },
    { VALUE1: 'A', VALUE2: 'E' },
    { VALUE1: 'C', VALUE2: 'D' },
    { VALUE1: 'E', VALUE2: 'B' },
    { VALUE1: 'A', VALUE2: 'B' },
    { VALUE1: 'E', VALUE2: 'D' },
    { VALUE1: 'C', VALUE2: 'D' },
    { VALUE1: 'E', VALUE2: 'C' },
    { VALUE1: 'B', VALUE2: 'A' },
    { VALUE1: 'D', VALUE2: 'B' },
    { VALUE1: 'A', VALUE2: 'B' },
    { VALUE1: 'A', VALUE2: 'C' },
    { VALUE1: 'C', VALUE2: 'E' },
    { VALUE1: 'D', VALUE2: 'E' }
  ];

  describe('calculate mbti test', () => {
    it('N타입이 S타입보다 많으면 N를 리턴해야 한다', () => {
      const answers = [
        { answer: '1' },  // S
        { answer: '1' },  // N
        { answer: '0' },  // N
        { answer: '1' },  // S
        { answer: '0' },  // S
        { answer: '1' },  // N
        { answer: '0' },  // N
        { answer: '0' },  // N
        { answer: '1' },  // N
        { answer: '1' },  // S
        { answer: '1' },
        { answer: '0' },
        { answer: '1' },
        { answer: '0' },
        { answer: '0' },
        { answer: '0' },
        { answer: '1' },
        { answer: '0' },
        { answer: '1' },
        { answer: '0' },
        { answer: '0' },
        { answer: '1' }];

      const type = mbti.calculateMbti(answers, values);
      type.should.equal('N');
    });

    it('S타입이 N보다 많거나 같으면 S를 리턴해야 한다', () => {
      const answers = [
        { answer: '1' },  // S
        { answer: '1' },  // N
        { answer: '0' },  // N
        { answer: '1' },  // S
        { answer: '0' },  // S
        { answer: '1' },  // N
        { answer: '0' },  // N
        { answer: '0' },  // N
        { answer: '0' },  // S
        { answer: '1' },  // S
        { answer: '1' },
        { answer: '0' },
        { answer: '1' },
        { answer: '0' },
        { answer: '0' },
        { answer: '0' },
        { answer: '1' },
        { answer: '0' },
        { answer: '1' },
        { answer: '0' },
        { answer: '0' },
        { answer: '1' }];

      const type = mbti.calculateMbti(answers, values);
      type.should.equal('S');
    });

    it('A타입이 가장 많으면 A타입을 리턴해야 한다.', () => {
      const answers = [
        { answer: '1' },  // S
        { answer: '1' },  // N
        { answer: '0' },  // N
        { answer: '1' },  // S
        { answer: '0' },  // S
        { answer: '1' },  // N
        { answer: '0' },  // N
        { answer: '0' },  // N
        { answer: '0' },  // S
        { answer: '1' },  // S

        { answer: '0' },  // A
        { answer: '0' },  // B
        { answer: '0' },  // A
        { answer: '0' },  // C
        { answer: '0' },  // B              15
        { answer: '0' },  // A
        { answer: '0' },  // E
        { answer: '0' },  // C
        { answer: '0' },  // E
        { answer: '1' },  // A              20 
        { answer: '0' },  // D
        { answer: '0' },  // A
        { answer: '0' },  // A
        { answer: '0' },  // C
        { answer: '0' },  // D
      ];
      // A:6

      const type = mbti.calculateLoveLanguage(answers, values);
      type.should.equal('A');
    });

    it('가장 많은 타입이 2개가 나오면 이전 문항을 비교해서 선택한 값을 리턴한다.', () => {
      const answers = [
        { answer: '1' },  // S
        { answer: '1' },  // N
        { answer: '0' },  // N
        { answer: '1' },  // S
        { answer: '0' },  // S
        { answer: '1' },  // N
        { answer: '0' },  // N
        { answer: '0' },  // N
        { answer: '0' },  // S
        { answer: '1' },  // S

        { answer: '1' },  // C
        { answer: '0' },  // B
        { answer: '0' },  // A
        { answer: '0' },  // C
        { answer: '0' },  // B              15
        { answer: '1' },  // B
        { answer: '0' },  // E
        { answer: '0' },  // C
        { answer: '0' },  // E
        { answer: '1' },  // A              20 
        { answer: '0' },  // D
        { answer: '0' },  // A
        { answer: '0' },  // A
        { answer: '0' },  // C
        { answer: '0' },  // D
      ];
      // A:4, c:4, b:3, d:2, e:2

      const type = mbti.calculateLoveLanguage(answers, values);
      type.should.equal('C');
    });
  });

  describe('mbti requset test', () => {
    it('/mbti GET 요청에 대해 25개 문항을 리턴해야 한다.', (done) => {
      chai.request(server)
        .get('/mbti')
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          res.should.have.status(200);
          res.should.be.json;
          res.body.should.be.a('object');
          res.body.should.have.property('msg');
          res.body.msg.should.equal('Success');
          res.body.should.have.property('data');
          res.body.data.should.be.a('array');
          res.body.data.length.should.equal(25);
          done();
        });
    });

    it('/mbti/u_id PUT 요청에 대해 form-data가 제대로 입력되지 않으면 실패 메시지를 리턴해야 한다.', (done) => {
      chai.request(server)
        .put('/mbti/0')
        .field('answer1', 0)
        .field('answer2', 1)
        .field('answer3', 0)
        .field('answer4', 1)
        .field('answer5', 1)
        .field('answer6', 0)
        .field('answer7', 1)
        .field('answer8', 0)
        .field('answer9', 1)
        .field('answer10', 1)
        .field('answer11', 0)
        .field('answer12', 0)
        .field('answer13', 1)
        .field('answer14', 1)
        .field('answer15', 1)
        .field('answer16', 0)
        .field('answer17', 1)
        .field('answer18', 0)
        .field('answer19', 0)
        .field('answer20', 0)
        .field('answer21', 1)
        .field('answer22', 0)
        .field('answer23', 1)
        .field('answer24', 0)
        //.field('answer25', 1)
        .end((err, res) => {
          res.should.have.status(500);
          res.should.be.json;
          res.body.should.have.property('msg');
          res.body.msg.should.equal('Not correct body message');
          done();
        });
    });

    it('/mbti/1 PUT 요청에 대해 성공 메시지를 보내야 한다.', (done) => {
      chai.request(server)
        .put('/mbti/0')
        .field('answer1', 0)
        .field('answer2', 1)
        .field('answer3', 0)
        .field('answer4', 1)
        .field('answer5', 1)
        .field('answer6', 0)
        .field('answer7', 1)
        .field('answer8', 0)
        .field('answer9', 1)
        .field('answer10', 1)
        .field('answer11', 0)
        .field('answer12', 0)
        .field('answer13', 1)
        .field('answer14', 1)
        .field('answer15', 1)
        .field('answer16', 0)
        .field('answer17', 1)
        .field('answer18', 0)
        .field('answer19', 0)
        .field('answer20', 0)
        .field('answer21', 1)
        .field('answer22', 0)
        .field('answer23', 1)
        .field('answer24', 0)
        .field('answer25', 1)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.have.property('msg');
          res.body.msg.should.equal('Success');
          done();
        });
    });

    it('/mbti/1 PUT 요청에 대해 답변이 0 또는 1이 아닌 경우 실패 메시지를 보내야 한다.', (done) => {
      chai.request(server)
        .put('/mbti/0')
        .field('answer1', 2)
        .field('answer2', 1)
        .field('answer3', 0)
        .field('answer4', 1)
        .field('answer5', 1)
        .field('answer6', 0)
        .field('answer7', 1)
        .field('answer8', 0)
        .field('answer9', 1)
        .field('answer10', 1)
        .field('answer11', 0)
        .field('answer12', 0)
        .field('answer13', 1)
        .field('answer14', 1)
        .field('answer15', 1)
        .field('answer16', 0)
        .field('answer17', 1)
        .field('answer18', 0)
        .field('answer19', 0)
        .field('answer20', 0)
        .field('answer21', 1)
        .field('answer22', 0)
        .field('answer23', 1)
        .field('answer24', 0)
        .field('answer25', 1)
        .end((err, res) => {
          res.should.have.status(500);
          res.body.should.have.property('msg');
          res.body.msg.should.equal('Not correct body message');
          done();
        });
    });

  });

  describe('mbti request detail test', () => {
    it('/mbti/0/detail GET 요청에 대해 성공 메시지를 리턴해야 한다.', (done) => {
      chai.request(server)
        .get('/mbti/0/detail')
        .end((err, res) => {
          res.should.have.status(200);
          res.should.be.json;
          res.body.should.have.property('msg');
          res.body.msg.should.equal('Success');
          res.body.should.have.property('type');
          res.body.should.have.property('image');
          res.body.should.have.property('explain');
          res.body.should.have.property('feature');
          done();
        });
    });

    it('/mbti/0/other GET 요청에 대해 성공 메시지를 리턴해야 한다.', (done) => {
      chai.request(server)
        .get('/mbti/0/other')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.have.property('msg');
          res.body.msg.should.equal('Success');
          res.body.should.have.property('data');
          res.body.data.should.be.a('array');
          res.body.data.length.should.equal(10);
          done();
        });
    });

  });
});