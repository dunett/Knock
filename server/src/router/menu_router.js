const upload = require('../utils/multerWrapper')
const express = require('express');
const fs = require('fs');
const pathUtil = require('path');
//const AWS = require('../utils/aws')
const config = require('../utils/config.js');
const Menu = require('../model/menu.js');

const aws = require('aws-sdk');
aws.config.region = config.region;
aws.config.accessKeyId = config.accessKeyId;
aws.config.secretAccessKey = config.secretAccessKey;

const router = express.Router();

router.route('/notice')
    .get(showNotice)
    .post(upload.single("image"), addNotice);

router.route('/board/:u_id')
    .get(showBoard)
    .post(upload.single(), addQuestion);

router.route('/board/:b_id', upload.single())
    .put(upload.single(), addAnswer);

module.exports = router;

// 공지보기
function showNotice(req, res, next){
    Menu.showNotice((err,results) =>{
        if(err){
            return next(err);
        }
        res.send(results);
    })
}

// 공지등록
function addNotice(req, res, next){
    const title = req.body.title;
    const description = req.body.description;
    const file = req.file;
    var readStream = fs.createReadStream(file.path);

    
    var bucketName = 'projectknock';

    var extname = pathUtil.extname(file.uploadedFile.ext);
    var now = new Date();
    var itemKey = 'poster/' + now.getHours() + now.getMinutes() + now.getSeconds() + Math.floor(Math.random()*1000) + extname;
    var contentType = file.mimetype;

    var params = {
        Bucket: bucketName,
        Key: itemKey,
        ACL: 'public-read',
        Body: readStream,
        ContentType: contentType
    }

    var s3 = new aws.S3();

    s3.putObject(params, function(err, data){
        if(err){
            console.log('S3 putObject Error', err);
            throw err;
        }

        var imageUrl = s3.endpoint.href + bucketName + '/' + itemKey;
        //console.log(imageUrl);

        var info = {
            title: title,
            description: description,
            contents : imageUrl
        }
        
        Menu.addNotice(info, (err, result) =>{
            res.redirect('./addNotice.html')
        })
    })


}

// 문의보기
function showBoard(req, res, next){
    const id = req.params.u_id;
    Menu.showBoard(id, (err, results) =>{
        if(err){
            return next(err);
        }
        res.send(results);
    })
}

// 질문등록
function addQuestion(req, res, next){
    const id = req.params.u_id;
    const question = req.body.question;
    const info = {
        writer : id,
        question : question
    }
    Menu.addQuestion(info, (err, result) =>{
        if(err){
            return next(err);
        }
        res.send(result);
    })
}

// 답변등록
function addAnswer(req, res, next){
    const id = req.params.b_id;
    const answer = req.body.answer;
    Menu.addAnswer(answer, id, (err, result) =>{
        if(err){
            return next(err);
        }
        res.send(result);
    })
}