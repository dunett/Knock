var chai = require('chai');
var chaiHttp = require('chai-http');
var server = require('../server');
var should = chai.should();

chai.use(chaiHttp);

// describe('GET /mbti', () => {
//   it('should list mbti test on /mbti GET', (done) => {
//     chai.request(server)
//       .get('/mbti')
//       .end((err, res) => {
//         res.should.have.status(200);
//         res.should.be.json;
//         res.body.should.be.a('object');
//         res.body.should.have.property('msg');
//         res.body.msg.should.equal('Success');
//         res.body.should.have.property('data');
//         res.body.data.should.be.a('array');
//         res.body.data.length.should.equal(25);
//         done();
//       });
//   });
// });

describe('PUT /mbti/1', () => {
  it('should update c_id on /mbti/:u_id PUT', (done) => {
    chai.request(server)
      .put('/mbti/1')
      .field('Content-Type', 'multipart/form-data')
      .field('answer1', 0)
      .field('answer2', 1)
      .field('answer3', 0)
      .field('answer4', 1)
      .field('answer5', 1)
      .field('answer6', 0)
      .field('answer7', 1)
      .field('answer8', 0)
      .field('answer9', 1)
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
        done();
      });
  });
});