var mongoose = require('mongoose');

const Chat = require('../model/chat');

const db = mongoose.connection;
db.on('error', console.error);
db.once('open', () => {
    console.log('Connected to mongod server');
});
mongoose.connect('mongodb://localhost/knock');

let chat = new Chat();
chat.r_id = 1;
chat.sender = 1;
chat.receiver = 3;
chat.messages = [];

chat.save();