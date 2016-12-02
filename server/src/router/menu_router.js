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

router.route('/QNA')
    .get(showQuestion)
    .post(upload.single(), addAnswer);

router.route('/analysis')
    .get(showAnalysis);

router.route('/alarm/:u_id')
    .get(showAlarm)
    .put(upload.single(), chgAlarm);

router.route('/block')
    .get(showReport)
    .post(upload.single(), blockUser);

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

// 질문보기
function showQuestion(req, res, next){
    Menu.showQuestion((err, results) =>{
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
    const id = req.body.id;
    const answer = req.body.answer;
    Menu.addAnswer(answer, id, (err, result) =>{
        if(err){
            return next(err);
        }
        res.redirect('./addAnswer.html');
    })
}

// 유저통계
function showAnalysis(req, res, next){
    Menu.showAnalysis((err, results) =>{
        if(err){
            return next(err);
        }
        res.send(results);
    })
}

// 알림설정보기
function showAlarm(req, res, next){
    const id = req.params.u_id;
    Menu.showAlarm(id, (err, results) =>{
        if(err){
            return next(err);
        }
        res.send(results);
    })
}

// 알림설정수정
function chgAlarm(req, res, next){
    const id = req.params.u_id;
    const alarm1 = req.body.alarm1;
    const alarm2 = req.body.alarm2;
    const alarm3 = req.body.alarm3;
    if(alarm1 != undefined){
        var info = {
            alarm1 : alarm1
        };
    }
    if(alarm2 != undefined){
        var info = {
            alarm2 : alarm2
        };
    }
    if(alarm3 != undefined){
        var info = {
            alarm3 : alarm3
        };
    }
    Menu.chgAlarm(info, id, (err, results) =>{
        if(err){
            return next(err);
        }
        res.send(results);
    })
}

// 신고내용보기
function showReport(req, res, next){
    Menu.showReport((err, results) =>{
        if(err){
            return next(err);
        }
        res.send(results);
    })
}

// 유저블럭
function blockUser(req, res, next){
    const rid = req.body.rid;
    const uid = req.body.uid;
    const block = req.body.block;
    
    Menu.blockUser(rid, uid, block, (err, results) =>{
        if(err){
            return next(err);
        }
        res.redirect('./blockUser.html');
    })
}