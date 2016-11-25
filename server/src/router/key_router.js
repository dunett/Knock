const express = require('express');
const Key = require('../model/key.js');

// 라우터 얻기
const router=express.Router();

router.route('/key/:u_id')
	.get(showKey)
    .post(chgKey);

module.exports = router;

function showKey(req, res, next) {
    const id = req.params.u_id;
    Key.showKey(id, (err,result) => {
        if(err) {
            return next(err);
        }
        res.send(result);
    });
}

function chgKey(req, res, next) {
    const id = req.params.u_id;
    const key = req.body.key;
    const des = req.body.description;

    const info = {
        u_id : id,
        cost : key,
        description : des
    };
    Key.chgKey(info, (err, result) => {
        if(err){
            return next(err);
        }
        res.send(result);
    });
}
