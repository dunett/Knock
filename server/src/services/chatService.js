// TODO: Validation socket.io

const socketio = require('socket.io');
const redis = require('socket.io-redis');

const Chat = require('../model/chat');
const Relation = require('../model/relation');
const User = require('../model/user');

const fcm = require('../utils/fcm');

// Constant variables
const Send_Message = 'sendMessage';
const Receive_Message = 'receiveMessage';
const Join_Room = 'joinRoom';
const Leave_Room = 'leaveRoom';

const redisInfo = {
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
};

// set the ping time out of socket.io to 30sec 
const PingTimeOut = 1000 * 30;

let rooms = [];

let test_index = 1;

const client = require('redis').createClient();

/**
 * Chat.saveChatMessage is wrapped in the promise
 * Params:
 *  - arg: r_id, from, to, message
 */
const saveChatMessage = (arg) => {
  return new Promise((resolve, reject) => {
    Chat.saveChatMessage(arg, (err, result) => {
      if (err) {
        return reject(err);
      }

      resolve(result);
    });
  });
};

/**
 * Send push message
 * Params:
 *  - to: Alias of other party
 *  - from: my alias 
 *  - message: message
 */
const pushMessage = (arg) => {
  User.getFCMTokenByAlias(arg.to, (err, token) => {
    if (err) {
      console.error(err);
      return;
    }

    const message = {
      to: token.fcm_token,
      //collapse_key: param.r_id,
      notification: {
        title: arg.from,
        text: arg.message,
      },
    };

    fcm.send(message, (err, response) => {
      if (err) {
        console.error("Something has gone wrong!");
      } else {
        console.log("Successfully sent with response: ", response);
      }
    });
  });
};

module.exports = function (http) {
  //var io = socketio(http);
  var io = socketio(http, { pingTimeout: PingTimeOut });

  // set socket.io-redis
  io.adapter(redis({
    host: redisInfo.host,
    port: redisInfo.port,
  }));

  // // initialize all key in redis
  client.flushdb((err, succeeded) => {
    console.log('Redis flush: ', succeeded);
  });

  io.on('connection', socket => {
    // room id
    let room = '';

    console.log('======== Connection ========');

    /**
     * Join the room
     * Params:
     *  - data: { room: 1 }
     */
    socket.on(Join_Room, data => {
      console.log('======= Join room =========');
      console.log('joined user to room: ', data.room);

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
     * Leave the room
     * Params:
     *  - data: { room: 1 }
     */
    socket.on(Leave_Room, data => {
      console.log('======== Leaved room ========');
      console.log('Leaved room: ', data.room);

      // Delete chat document and relation table    
      Chat.deleteChatByRid(data.room, err => {
        if (err) {
          console.error(err);
          return;
        }

        Relation.deleteRelationByRid(data.room, err => {
          if (err) {
            console.error(err);
            return;
          }

          const msg = JSON.stringify({ msg: 'Success' });
          //io.in(data.room).emit(Leave_Room, msg);         // include sender
          socket.to(data.room).emit(Leave_Room, msg);       // except  sender

          socket.leave(data.room);
        });
      });
    });

    /**
     * Send message
     *  Params:
     *   - data: {from: 'FromAlias', to: 'ToAlias', message: 'messages'}  
     */
    socket.on(Send_Message, data => {
      console.log('======== send message ========');
      console.log(data, room);

      client.get(room, (err, count) => {
        if (err) {
          console.error(err);
          return;
        }

        if (!count) {
          console.error('Redis count is 0');
          return;
        }

        const param = {
          r_id: room,
          from: data.from,
          to: data.to,
          message: data.message,
        };

        if (count == 1) {
          saveChatMessage(param).then(result => {
            // Send push notification when there is only one person in chat room
            console.log('======== PUSH NOTIFICATION ========');
            pushMessage(param);
          }).catch(err => {
            if (err) {
              console.error('saveChatMessage error:', err.stack);
              //socket.emit('foo', 'Server error');
              return;
            }
          });

        } else {
          saveChatMessage(param).then(result => {
            //console.log(test_index++);

            // Live chat
            data.message_id = result.message_id;

            const msg = JSON.stringify(data);
            //io.in(room).emit(Send_Message, msg);          // include sender
            socket.to(room).emit(Send_Message, msg);        // except  sender
          }).catch(err => {
            if (err) {
              console.error('saveChatMessage error:', err.stack);
              //socket.emit('foo', 'Server error');
              return;
            }
          });
        }
      });
    });

    /**
     * When user receive message, change the message to read
     */
    socket.on(Receive_Message, data => {
      console.log('======== receive message ========');
      console.log(data, room);

      Chat.changeMessageCheckToRead(data.room, data.message_id, (err, result) => {
        if (err) {
          console.error(err);
          return;
        }
      });
    });

    socket.on('disconnect', () => {
      console.log('======== disconnect =======');
      console.log('Before delete rooms:', rooms);
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
      console.log('After delete rooms: ', rooms);
      console.log('======= disconnected ========', room);
    });

  });
};
