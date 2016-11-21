const express = require('express');
const fs = require('fs');
const Key = require('../model/key.js');

// 라우터 얻기
var router=express.Router();

router.route('/key/:u_id')
	.get(showKey)
    .post(chgKey);

module.exports = router;

function showKey(req, res, next) {
    var id = req.params.u_id;
    Key.showKey(id, (err,result) => {
        if(err) {
            return next(err);
        }
        res.send(result);
    });
}

function chgKey(req, res, next) {
    var id = req.params.u_id;
    var key = req.body.key;
    var des = req.body.description;

    var info = {
        u_id : id,
        cost : key,
        description : des
    };
    Key.chgKey(id, info, (err, result) => {
        if(err){
            return next(err);
        }
        res.send(result);
    });
}
