const upload = require('../utils/multerWrapper')
const express = require('express');
const Key = require('../model/key.js');

// 라우터 얻기
const router=express.Router();

router.route('/key/:u_id')
	.get(showKey)
    .post(upload.single(), chgKey);

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
    const nick = req.body.nick
    const type = req.body.type;

    if(type == 1){
        const des = "오늘의 열쇠가 적립되었습니다.";
    }
    if(type == 2){
        const des = "상대방 새로받기를 신청했습니다.";
    }
    if(type == 3){
        const des = nick + "님에게 수락하기를 했습니다.";
    }
    if(type == 4){
        const des = nick + "님에게 노크하기를 했습니다.";
    }
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
