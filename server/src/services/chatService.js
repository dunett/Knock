// TODO: Validation socket.io

const socketio = require('socket.io');
const redis = require('socket.io-redis');

const Chat = require('../model/chat');

// Constant variables
const Send_Message = 'sendMessage';
const Join_Room = 'joinRoom';

const redisInfo = {
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
};

let rooms = [];

const client = require('redis').createClient();

module.exports = function (http) {
  var io = socketio(http);
  io.adapter(redis({
    host: redisInfo.host,
    port: redisInfo.port,
  }));

  // // initialize all key in redis
  client.flushdb((err, succeeded) => {
    console.log(succeeded);
  });

  io.on('connection', socket => {
    // room id
    let room = '';
    // console.log('a user connnted');

    /**
     * Join the room
     * Params:
     *  - data: { room: r_id }
     */
    socket.on(Join_Room, (data) => {
      // join the room
      room = data.room;
      socket.join(data.room);

      // increment client count in redis
      client.incr(data.room);

      // add socket.id in rooms
      if (rooms[room] == undefined) {
        rooms[room] = [];
      }

      rooms[room].push(socket.id);
    });

    /**
     * Send message
     *  Params:
     *   - data: {from: 'FromAlias', to: 'ToAlias', message: 'messages'}  
     */
    socket.on(Send_Message, (data) => {
      client.get(room, (err, count) => {
        if (err) {
          console.error(err);
          return;
        }

        if (!count) {
          console.error('Redis count is 0');
          return;
        }

        if (count == 1) {
          Chat.saveChatMessage({
            r_id: room,
            from: data.from,
            to: data.to,
            message: data.message
          }, (err, result) => {
            if (err) {
              console.error('saveChatMessage error:', err.stack);
              //socket.emit('foo', 'Server error');
              return;
            }

            // TODO: push notification
            // Send push notification when there is only one person in chat room
            console.log('======== PUSH NOTIFICATION ========');
          });
        } else {
          Chat.saveChatMessage({
            r_id: room,
            from: data.from,
            to: data.to,
            message: data.message
          }, (err, result) => {
            if (err) {
              console.error('saveChatMessage error:', err.stack);
              //socket.emit('foo', 'Server error');
              return;
            }

            // Live chat
            io.in(room).emit(Send_Message, data.message);
          });
        }
      });
    });

    socket.on('disconnect', () => {
      if (room != undefined && rooms[room] != undefined && rooms[room].length > 0) {
        for (let i = rooms[room].length - 1; i >= 0; i--) {
          if (rooms[room][i] == socket.id) {
            // delete socket.id
            rooms[room].splice(i, 1);

            // decrement cliet count in redis
            client.decr(room);
            break;
          }
        }
      }
      //console.log('disconnected');
    });

  });
};