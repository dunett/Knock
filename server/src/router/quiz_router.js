const express = require('express');
const Quiz = require('../model/quiz.js');

// 라우터 얻기
const router=express.Router();

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
        res.send(result);
    });
}

function addQuiz(req, res, next) {
    const q1 = req.body.question1;
    const q2 = req.body.question2;
    const a1 = req.body.answer1;
    const a2 = req.body.answer2;
    const date = req.body.date;

    const info = {
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
        res.send(result);
    });
}

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

