const upload = require('../utils/multerWrapper')
const express = require('express');
const fs = require('fs');
const Menu = require('../model/menu.js');

const router = express.Router();

router.route('/notice')
    .get(showNotice)
    .post(upload.single(), addNotice);

router.route('/board/:u_id')
    .get(showBoard)
    .post(upload.single(), addQuestion);

router.route('/board/:b_id', upload.single())
    .put(upload.single(), addAnswer);

module.exports = router;

function showNotice(req, res, next){
    Menu.showNotice((err,results) =>{
        if(err){
            return next(err);
        }
        res.send(results);
    })
}

function addNotice(req, res, next){
    const title = req.body.title;
    const desciption = req.body.desciption;
    const contents = req.body.contents;
}

function showBoard(req, res, next){
    const id = req.params.u_id;
    Menu.showBoard(id, (err, results) =>{
        if(err){
            return next(err);
        }
        res.send(results);
    })
}

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