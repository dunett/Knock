// TODO: Validation socket.io

const socketio = require('socket.io');
const redis = require('socket.io-redis');

const Chat = require('../model/chat');

// Constant variables
const Send_Message = 'sendMessage';
const Join_Room = 'joinRoom';

const redisInfo = {
  host: 'localhost',
  port: 6379,
};

const pub = require('redis').createClient(redisInfo.port, redisInfo.host, { return_buffers: true, auth_pass: '' });
const sub = require('redis').createClient(redisInfo.port, redisInfo.host, { return_buffers: true, auth_pass: '' });

module.exports = function (http) {
  var io = socketio(http);
  io.adapter(redis({
    host: redisInfo.host,
    port: redisInfo.port,
    pubClient: pub,
    subClient: sub,
  }));

  io.on('connection', socket => {
    // room id
    let room = '';
    console.log('a user connnted');

    /**
     * Send message
     *  Params:
     *   - data: {from: 'FromAlias', to: 'ToAlias', message: 'messages'}  
     */
    socket.on(Send_Message, (data) => {
      // Get client count of current room
      let clients = io.sockets.adapter.rooms[room];
      if (!clients || room == '') {
        // if room does not exist, return
        return;
      }
      console.log('room client count: ', clients);

      // 1. Save chat message into mongodb
      Chat.saveChatMessage({
        r_id: room,
        from: data.from,
        to: data.to,
        message: data.message
      }, (err, result) => {
        if (err) {
          console.error('saveChatMessage error:', err.stack);
          socket.emit('foo', 'Server error');
          return;
        }

        // if (clients && clients.length == 1) {
        //   // TODO: 2. push message
        // } else {
          // 2. Sending to all clients in room(channel) except sender
          socket.broadcast.to(room).emit(Send_Message, data.message);
        // }
      });
    });

    /**
     * Join the room
     * Params:
     *  - data: { room: r_id }
     */
    socket.on(Join_Room, (data) => {
      room = data.room;

      socket.join(data.room);

      console.log('join the room: ', room);
    });

    socket.on('disconnect', () => {
      // TODO: disconnect 시 어떻게???
      console.log('user disconnected');
    });

  });
};