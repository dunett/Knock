const upload = require('../utils/multerWrapper')
const express = require('express');
const Knock = require('../model/knock.js');

// 라우터 얻기
var router=express.Router();

router.route('/knock/send')
    .post(upload.single(), addRel);

router.route('/knock/accept/:r_id')
    .put(upload.single(), chgRel);

router.route('/knock/today/:u_id')
    .get(today);

router.route('/knock/refresh/:u_id')
    .get(refresh);

module.exports = router;

function addRel(req, res, next) {
    const send = req.body.sender;
    const accept = req.body.receiver;

    var info = {
        sender : send,
        receiver : accept
    };
    Knock.addRel(info, (err, result) => {
        if(err){
            return next(err);
        }
        res.send(result);
    });
}

function chgRel(req, res, next) {
    const id = req.params.r_id;

    Knock.chgRel(id, (err, result) => {
        if(err){
            return next(err);
        }
        res.send(result);
    });
}

function today(req, res, next){
    const id = req.params.u_id;

    Knock.today(id, (err, result) =>{
        if(err){
            return next(err);
        }
        res.send(result);
    })
}

function refresh(req, res, next){
    const id = req.params.u_id;

    Knock.refresh(id, (err, result) =>{
        if(err){
            return next(err);
        }
        res.send(result);
    });
}
