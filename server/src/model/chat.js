const mongoose = require('mongoose');

const Chat = mongoose.Schema({
  r_id: Number,
  sender: Number,
  receiver: Number,
  messages: [
    {
      from: String,
      to: String,
      message: String,
      date: Date,
      check: Boolean
    }
  ]
});

/**
 * Save chat message to mongodb
 * Params:
 *  - arg:
 *    - r_id: relation id
 *    - from: sender nickname
 *    - to: receiver nickname
 *    - message: text
 */
Chat.statics.saveChatMessage = function saveChatMessage(arg, callback) {
  this.findOne({ r_id: arg.r_id }, (err, chat) => {
    if(err) return callback(err);
    if(!chat) return callback(new Error('Chat not found'));

    chat.messages.push({
      from: arg.from,
      to: arg.to,
      message: arg.message,
      date: new Date(),
      check: false
    });

    chat.save(err => {
      if(err) return callback(err);

      return callback(null, {msg: 'Success'});
    });
  });
};

module.exports = mongoose.model('Chat', Chat);