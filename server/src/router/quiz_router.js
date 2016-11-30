const upload = require('../utils/multerWrapper')
const fs = require('fs');
const express = require('express');
const pathUtil = require('path');
const async = require('async');
const config = require('../utils/config.js');
const Quiz = require('../model/quiz.js');

const aws = require('aws-sdk');
aws.config.region = config.region;
aws.config.accessKeyId = config.accessKeyId;
aws.config.secretAccessKey = config.secretAccessKey;

// 라우터 얻기
const router=express.Router();

router.route('/quiz')
	.get(showQuiz)
    .post(upload.array('image',3), addQuiz);

router.route('/quiz/:u_id')
    .post(upload.single(), addAnswer);

module.exports = router;

// 퀴즈보기
function showQuiz(req, res, next) {
    Quiz.getQuiz((err,result) => {
        if(err) {
            return next(err);
        }
        res.send(result);
    });
}


// 퀴즈입력
function addQuiz(req, res, next) {
    const q1 = req.body.question1;
    const q2 = req.body.question2;
    const a1 = req.body.answer1;
    const a2 = req.body.answer2;
    const date = req.body.date;
    const files = req.files;

    var info = {
        question1 : q1,
        question2 : q2,
        answer1 : a1,
        answer2 : a2,
        date : date
    };

    //console.log(files);

    var s3 = new aws.S3();
    var bucketName = 'projectknock';
    var now = new Date();

    async.series(
        [
            function task1(done){
                var extname = pathUtil.extname(files[0].uploadedFile.ext);
                var itemKey ='poster/' + now.getHours() + now.getMinutes() + now.getSeconds() + Math.floor(Math.random()*1000) + extname;
                var readStream = fs.createReadStream(files[0].path);
                var contentType = files[0].mimetype;

                var params = {
                    Bucket: bucketName,
                    Key: itemKey,
                    ACL: 'public-read',
                    Body: readStream,
                    ContentType: contentType
                }
                s3.putObject(params, function(err, data){
                    if(err){
                        done(err);
                    }

                    var imageUrl = s3.endpoint.href + bucketName + '/' + itemKey;
                    //console.log(imageUrl);
                    info.question_img = imageUrl
                    done(null);
                })
            },
            function task2(done){
                var itemKey ='poster/' + now.getHours() + now.getMinutes() + now.getSeconds() + Math.floor(Math.random()*1000) + extname;
                var readStream = fs.createReadStream(files[1].path);
                var extname = pathUtil.extname(files[1].uploadedFile.ext);
                var contentType = files[1].mimetype;

                var params = {
                    Bucket: bucketName,
                    Key: itemKey,
                    ACL: 'public-read',
                    Body: readStream,
                    ContentType: contentType
                }
                s3.putObject(params, function(err, data){
                    if(err){
                        done(err);
                    }

                    var imageUrl = s3.endpoint.href + bucketName + '/' + itemKey;
                    //console.log(imageUrl);
                    info.answer1_img = imageUrl
                    done(null);
                })
            },
            function task3(done){
                var itemKey ='poster/' + now.getHours() + now.getMinutes() + now.getSeconds() + Math.floor(Math.random()*1000) + extname;
                var readStream = fs.createReadStream(files[2].path);
                var extname = pathUtil.extname(files[2].uploadedFile.ext);
                var contentType = files[2].mimetype;

                var params = {
                    Bucket: bucketName,
                    Key: itemKey,
                    ACL: 'public-read',
                    Body: readStream,
                    ContentType: contentType
                }
                s3.putObject(params, function(err, data){
                    if(err){
                        done(err);
                    }

                    var imageUrl = s3.endpoint.href + bucketName + '/' + itemKey;
                    //console.log(imageUrl);
                    info.answer2_img = imageUrl
                    done(null);
                })
            }
        ],
        function(err){
            if(err){
                return next(err);
            }
            //console.log(info);
            Quiz.addQuiz(info, (err, result) => {
                if(err){
                    return next(err);
                }
                res.send(result);
            });
        }
    )
}

// 답변입력
function addAnswer(req, res) {
    const u_id = req.params.u_id;
    const q_id = req.body.q_id;
    const answer = req.body.answer;

    const info = {
        u_id : u_id,
        q_id : q_id,
        answer : answer
    };
    Quiz.addAnswer(info, (err, result) => {
        if(err){
            return;
        }
        res.send(result);
    });
}

