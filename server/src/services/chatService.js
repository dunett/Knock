// TODO: Validation socket.io 

const Chat = require('../model/chat');

const Send_Message = 'sendMessage';
const Join_Room = 'joinRoom';

/**
 * Handle the socket.io
 * Params:
 *  - io: socket.io object
 */
module.exports = (io) => {
  io.on('connection', socket => {
    // room id
    let room = '';
    console.log('a user connnted');

    /**
     * Send message
     *  Params:
     *   - data: {from: 'from', to: 'to', message: message}  
     */
    socket.on(Send_Message, (data) => {
      // Get client count of current room
      let clients = io.sockets.adapter.rooms[room];
      console.log('room client count: ', clients);

      // Save chat message into mongodb
      Chat.saveChatMessage({
        r_id: room,
        from: data.from,
        to: data.to,
        message: data.message
      }, (err, result) => {
        if (err) {
          console.error('saveChatMessage error:', err.stack);
          return;
        }

        // Send message to chat room
        io.to(room).emit(Send_Message, data.message);
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
      console.log('user disconnected');
    });

  });
};