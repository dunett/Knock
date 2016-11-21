const express = require('express');
const fs = require('fs');
const Knock = require('../model/knock.js');

// 라우터 얻기
var router=express.Router();

router.route('/knock/send')
    .post(addRel);

router.route('/knock/accept/:r_id')
    .put(chgRel);

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
