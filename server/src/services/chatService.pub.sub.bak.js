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


  io.on('connection', socket => {
    // room id
    let room = '';
    let alias = '';

    console.log('a user connnted');

    /**
     * Join the room
     * Params:
     *  - data: { room: r_id }
     */
    socket.on(Join_Room, (data) => {
      alias = data.from;
      room = data.room;
      socket.join(data.room);

      if (rooms[room] == undefined) {
        rooms[room] = [];
        console.log('register subscribe');
        sub.subscribe('publishData');
      }

      // save alias
      rooms[room].push(data.from);

      console.log('socket id: ', socket.id);
      console.log('join the room: ', rooms[room]);
    });

    /**
     * Send message
     *  Params:
     *   - data: {from: 'FromAlias', to: 'ToAlias', message: 'messages'}  
     */
    socket.on(Send_Message, (data) => {
      // if (rooms[room]) {
      //   console.log('room count: ', rooms[room].length);
      // }

      // 상대방 아이디를 rooms[room]에서 찾는다.
      console.log('to: ', data.to);
      console.log('rooms filter: ', rooms[room]);
      console.log(pub.publish('publishData', 'none'));

      if (rooms[room]) {             
        const to = rooms[room].filter(alias => {
          return alias == data.to;
        })[0];

        console.log('fined to: ', to);

        if (!to) {
          // 보내려고 하는 사람이 현재 프로세스에 없을 때는 publish 한다.
          console.log('Do publish');
          data.r_id = room;
          const json = JSON.stringify(data);
          pub.publish('publishData', json);
        } else {
          // 보내려고 하는 사람이 있으면 그냥 send.
          console.log('saveChatMessage: ', room);
          console.log('saveChatMessage: ', data);
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

            //socket.broadcast.to(room).emit(Send_Message, data.message);
            io.in(room).emit(Send_Message, data.message);
          });
        }
      }
    });

    socket.on('disconnect', () => {
      console.log(alias + ' 님이 나가셨습니다');
      if (room != undefined && rooms[room] != undefined && rooms[room].length > 0) {
        for (let i = rooms[room].length - 1; i >= 0; i--) {
          if (rooms[room][i] == alias) {
            rooms[room].splice(i, 1);
            // sub.unsubscribe('publishData');
            // pub.unsubscribe('publishData');
            break;
          }
        }
      }
      console.log('disconnected');
    });

  });

  sub.on('message', (channel, data) => {
    if (channel == 'publishData') {
      console.log('=========== subscribe ============');
      const msg = JSON.parse(data);
      console.log(msg);

      if(!rooms[msg.r_id]) {        
        console.error('rooms[msg.r_id]');
        console.error('rooms', rooms);
        console.error('msg.r_id', msg.r_id);
        return;
      }

      const to = rooms[msg.r_id].filter(alias => {
        return alias == msg.to;
      })[0];

      if (to) {
        console.log('============to============');
        Chat.saveChatMessage({
          r_id: msg.r_id,
          from: msg.from,
          to: msg.to,
          message: msg.message
        }, (err, result) => {
          if (err) {
            console.error('saveChatMessage error:', err.stack);
            //socket.emit('foo', 'Server error');
            return;
          }
          //socket.broadcast.to(msg.r_id).emit(Send_Message, msg.message);
          io.in(msg.r_id).emit(Send_Message, msg.message);
        });
      }

      // if (rooms[room] != undefined) {
      //   Chat.saveChatMessage({
      //     r_id: room,
      //     from: data.from,
      //     to: data.to,
      //     message: data.message
      //   }, (err, result) => {
      //     if (err) {
      //       console.error('saveChatMessage error:', err.stack);
      //       socket.emit('foo', 'Server error');
      //       return;
      //     }

      //     socket.broadcast.to(room).emit(Send_Message, data.message);
      //   });
      // }
    }
  });
};