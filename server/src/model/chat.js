const mongoose = require('mongoose');
const async = require('async');

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
    if (err) return callback(err);
    if (!chat) return callback(new Error('Chat not found'));

    chat.messages.unshift({
      from: arg.from,
      to: arg.to,
      message: arg.message,
      date: new Date(),
      check: false
    });

    chat.save(err => {
      if (err) return callback(err);

      return callback(null, { msg: 'Success' });
    });
  });
};

/**
 * Get last chat message
 * Params:
 *  - r_ids: room id array
 * Return:
 *  - { msg: 'Success', data: [{message: 'Text', date: '2016-11-23T01:34:46.636Z'}]}
 */
Chat.statics.getLatestMessagesByRid = function getLatestMessageByRid(r_ids, callback) {
  const projection = {
    _id: false,
    __v: false,
    sender: false,
    receiver: false,
    messages: { $slice: 1 },
  };

  this.find({ r_id: { $in: r_ids } }, projection)
    .exec((err, chats) => {
      if (err) return callback(err);

      let result = {};
      if (chats.length === 0) {
        result.msg = 'Not found message';
      } else {
        result.msg = 'Success';
        result.data = [];

        for (let lastMessage of chats) {
          if (lastMessage.messages.length > 0) {
            result.data.push({
              r_id: lastMessage['r_id'],
              message: lastMessage.messages[0].message,
              date: lastMessage.messages[0].date,
            });
          } else {
            result.data.push({
              r_id: lastMessage['r_id'],
              message: ''
            });
          }
        }
      }

      return callback(null, result);
    });
};

/**
 * Get the count of unread messages 
 * Params:
 *  - r_ids: room id array
 *  - aliases: alias of other party array
 * Return:
 *  - { msg: 'Success', data: [{r_id: 1, count: 3}, ...]}
 */
Chat.statics.getUnreadMessageCount = function getUnreadMessageCount(r_ids, aliases, callback) {
  let result = {};
  result.msg = '';
  result.data = [];

  async.each(r_ids, (r_id, next) => {
    let index = r_ids.indexOf(r_id);
    if (index < 0) {
      return next(new Error('Not found r_id'));
    }

    let alias = aliases[index];

    this.aggregate([
      { $match: { r_id: r_id } },
      { $unwind: '$messages' },
      { $match: { 'messages.from': `${alias}`, 'messages.check': false } },
      { $group: { _id: '$r_id', count: { $sum: 1 } } }
    ]).exec((err, rows) => {
      if (err) {
        return next(err);
      }

      if (rows.length > 0) {
        result.data.push({
          r_id: rows[0]['_id'],
          count: rows[0].count
        });
      } else {
        result.data.push({
          r_id: r_id,
          count: 0
        });
      }

      next(null, rows);
    });
  }, err => {
    if (err) {
      return callback(err);
    }

    result.msg = 'Success';
    return callback(null, result);
  });
};

/**
 * Get the all messages of room
 * Params:
 *  - r_id: room id
 * Return:
 *  - { msg: 'Success', data: [{from: 'Me', to: 'You', message: 'Hello', date: '2016-11-23T01:34:46.636Z', check: false}, ...] }
 */
Chat.statics.getMessagesByRid = function getMessagesByRid(r_id, callback) {
  const projection = {
    _id: false,
    r_id: false,
    sender: false,
    receiver: false,
    __v: false,
    'messages._id': false,
  };

  this.find({ r_id: r_id }, projection)
    .exec((err, rows) => {
      if (err) {
        return callback(err);
      }

      let result = {};
      result.msg = 'Success';
      result.data = (rows[0] === undefined) ? [] : rows[0].messages;

      return callback(null, result);
    });
};

/**
 * Delete the chat document
 * Params:
 *  - r_id: room id
 */
Chat.statics.deleteChatByRid = function deleteChatByRid(r_id, callback) {
  this.remove({ r_id: r_id }, err => {
    if (err) {
      return clalback(err);
    }

    return callback(null);
  });
};

module.exports = mongoose.model('Chat', Chat);