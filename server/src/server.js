var express = require('express');
var bodyParser = require('body-parser');
//var morgan = require('morgan');
var quizRouter = require('./router/quiz_router');
var keyRouter = require('./router/key_router');
var knockRouter = require('./router/knock_router');
var historyRouter = require('./router/history_router');

var app = express();
//app.use(morgan('dev'));
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

app.use(quizRouter);
app.use(keyRouter);
app.use(knockRouter);
app.use(historyRouter);

// 여기까지 오면 - 에러
app.use(function(req, res, next) {
  res.sendStatus(404);  
});

app.use(function(err, req, res, next) {
   res.status(500).send({mag: err.message});
});

app.listen(3000, function() {
	console.log('server is listening 3000');
});