// TODO: Validation socket.io

const socketio = require('socket.io');
const redis = require('socket.io-redis');

const Chat = require('../model/chat');

// Constant variables
const Send_Message = 'sendMessage';
const Join_Room = 'joinRoom';

const redisInfo = {
  host: '127.0.0.1',
  port: 6379,
};

let rooms = [];

const pub = require('redis').createClient();
const sub = require('redis').createClient();
const client = require('redis').createClient();

module.exports = function (http) {
  var io = socketio(http);
  io.adapter(redis({
    host: redisInfo.host,
    port: redisInfo.port,
  }));

  // initialize all key in redis
  client.flushdb((err, succeeded) => {
    console.log(succeeded);
  });

  io.on('connection', socket => {
    // room id
    let room = '';
    console.log('a user connnted');

    /**
     * Join the room
     * Params:
     *  - data: { room: r_id }
     */
    socket.on(Join_Room, (data) => {
      room = data.room;
      socket.join(data.room);

      if (rooms[room] == undefined) {
        rooms[room] = [];
      }

      rooms[room].push(socket.id);

      // write in redis
      client.get(room, (err, reply) => {
        if (err) {
          return;
        }

        // if key does not exist, reply is null
        if (reply && reply == 1) {
          client.set(room, 2);
        } else {
          client.set(room, 1);
        }
      });

      console.log('socket id: ', socket.id);
      console.log('join the room: ', rooms[room]);
    });

    /**
     * Send message
     *  Params:
     *   - data: {from: 'FromAlias', to: 'ToAlias', message: 'messages'}  
     */
    socket.on(Send_Message, (data) => {
      client.get(room, (err, reply) => {
        if (reply && reply == 1) {
          // TODO: push message

        } else if (reply && reply == 2) {
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

            socket.broadcast.to(room).emit(Send_Message, data.message);
          });
        }
      });
    });

    socket.on('disconnect', () => {
      if (room != undefined && rooms[room] != undefined && rooms[room].length > 0) {
        for (let i = rooms[room].length - 1; i >= 0; i--) {
          if (rooms[room][i] == socket.id) {
            rooms[room].splice(i, 1);
            client.get(room, (err, reply) => {
              client.set(room, reply - 1);
            });
            break;
          }
        }
      }
    });

  });
};