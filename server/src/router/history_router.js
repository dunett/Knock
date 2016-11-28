const express = require('express');
const fs = require('fs');
const History = require('../model/history.js');

const router = express.Router();

router.route('/history/:u_id')
    .get(totalHistory);

router.route('/history/:u_id/each')
    .get(eachHistory);

//나에게 노크한 사람
router.route('/history/:u_id/me')
    .get(meHistory);

router.route('/history/:u_id/you')
    .get(youHistory);

router.route('/history/:u_id/past')
    .get(pastHistory);

module.exports = router;

 function totalHistory(req, res, next){
     const id = req.params.u_id;
     History.totalHistory(id, (err, results) =>{
         if(err){
             return next(err);
         }
         res.send(results);
     })
 }

function eachHistory(req, res, next){
    const id = req.params.u_id;
    History.eachHistory(id, (err, result) =>{
        if(err){
            return next(err);
        }
        res.send(result);
    })
}

function meHistory(req, res, next){
    const id = req.params.u_id;
    History.meHistory(id, (err, result) =>{
        if(err){
            return next(err);
        }
        res.send(result);
    })
}

function youHistory(req, res, next){
    const id = req.params.u_id;
    History.youHistory(id, (err, result) =>{
        if(err){
            return next(err);
        }
        res.send(result);
    })
}

function pastHistory(req, res, next){
    const id = req.params.u_id;
    History.pastHistory(id, (err, result) =>{
        if(err){
            return next(err);
        }
        res.send(result);
    })
}