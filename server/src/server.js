var express = require('express');
var bodyParser = require('body-parser');
var morgan = require('morgan');
var mongoose = require('mongoose');

var dotenv = require('dotenv').config();

var quizRouter = require('./router/quiz_router');
var keyRouter = require('./router/key_router');
var knockRouter = require('./router/knock_router');
var menuRouter = require('./router/menu_router');
var historyRouter = require('./router/history_router');

var mbti = require('./router/mbti');
var chat = require('./router/chat');
var report = require('./router/report');
var relation = require('./router/relation');
var user = require('./router/user');

var chatService = require('./services/chatService');

// Connect mongodb
const db = mongoose.connection;
db.on('error', console.error);
db.once('open', () => {
  console.log('Connected to mongod server');
});
mongoose.connect(process.env.DB_MONGO);

var app = express();
// var http = require('http').Server(app);
// var io = require('socket.io')(http);
// chatService(io);

app.use(express.static(__dirname + '/public'));

app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(quizRouter);
app.use(keyRouter);
app.use(knockRouter);
app.use(menuRouter);
app.use(historyRouter);
app.use(mbti);
app.use(chat);
app.use(report);
app.use(relation);
app.use(user);

// 여기까지 오면 - 에러
app.use(function (req, res, next) {
  res.sendStatus(404);
});

app.use(function (err, req, res, next) {
  res.status(500).send({ mag: err.message });
});

app.listen(3000, function () {
  console.log('server is listening 3000');
});