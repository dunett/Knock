const express = require('express');
const fs = require('fs');
const Quiz = require('../model/quiz.js');

// 라우터 얻기
var router=express.Router();

router.route('/quiz')
	.get(showQuiz)
    .post(addQuiz);

router.route('/quiz/:u_id')
    .post(addAnswer);

module.exports = router;

function showQuiz(req, res, next) {
    Quiz.getQuiz((err,result) => {
        if(err) {
            return next(err);
        }
        res.send({msg : "success" ,result});
    });
}

function addQuiz(req, res, next) {
    var q1 = req.body.question1;
    var q2 = req.body.question2;
    var a1 = req.body.answer1;
    var a2 = req.body.answer2;
    var date = req.body.date;

    var info = {
        question1 : q1,
        question2 : q2,
        answer1 : a1,
        answer2 : a2,
        date : date
    };
    Quiz.addQuiz(info, (err, result) => {
        if(err){
            return next(err);
        }
        res.send({meg : "success"});
    });
}

function addAnswer(req, res) {
    var u_id = req.params.u_id;
    var q_id = req.body.q_id;
    var quest1 = req.body.question1;
    var quest2 = req.body.question2;
    var answer = req.body.answer;

    console.log(q_id);
    console.log(quest1);
    console.log(quest2);
    console.log(answer);

    var info = {
        u_id : u_id,
        q_id : q_id,
        answer : quest1+ " " + answer + " " + quest2
    };
    Quiz.addAnswer(info, (err, result) => {
        if(err){
            return;
        }
        res.send({meg : "success"});
    });
}

