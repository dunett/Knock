var chai = require('chai');
var chaiHttp = require('chai-http');
var server = require('../server');
var should = chai.should();

chai.use(chaiHttp);

describe('mbti', () => {
  it('should list mbti test on /mbti GET', (done) => {
    chai.request(server)
      .get('/mbti')
      .end((err, res) => {
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

  // it('should update c_id on /mbti/:u_id POST', (done) => {
  //   chai.request(server)
  //     .post('/mbti/1')
  //     .send({""})
  // });
});