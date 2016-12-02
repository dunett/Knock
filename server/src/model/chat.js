const mongoose = require('mongoose');
const async = require('async');

const Timezon_Kor = 60 * 1000 * 60 * 9;

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
}, { versionKey: false });

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
    if (err) {
      return callback(err);
    }

    if (!chat) {
      return callback(new Error('Chat not found'));
    }

    const now = new Date();

    //chat.messages.unshift({
    const lastIndex = chat.messages.push({
      from: arg.from,
      to: arg.to,
      message: arg.message,
      date: new Date(now.getTime() + Timezon_Kor),
      check: false
    });

    chat.save(err => {
      if (err) {
        return callback(err);
      }

      return callback(null, { message_id: chat.messages[lastIndex - 1]._id });
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
 *  - alias: own alias
 * Return:
 *  - { msg: 'Success', data: [{from: 'Me', to: 'You', message: 'Hello', date: '2016-11-23T01:34:46.636Z', check: false}, ...] }
 */
Chat.statics.getMessagesByRid = function getMessagesByRid(r_id, alias, callback) {
  const projection = {
    'messages._id': false,
  };

  this.findOne({ r_id: r_id }, projection)
    .exec((err, chat) => {
      if (err) {
        return callback(err);
      }

      if (!chat) {
        return callback(null, { msg: 'Not found chat' });
      }

      // If you did not check the message from the other party, change it to read.
      for (let message of chat.messages) {
        if (message.to == alias) {
          message.check = true;
        }
      }

      chat.save(err => {
        if (err) {
          return callback(null, chat);
        }

        let result = {};
        result.msg = 'Success';
        result.data = (chat === undefined) ? [] : chat.messages;

        return callback(null, result);
      });
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

let test_index = 1;
let test_index2 = 1;

/**
 * 메시지를 읽은 상태로 변경한다
 * Params:
 *  - r_id: room id
 *  - message_id: message object id
 */
Chat.statics.changeMessageCheckToRead = function changeMessageCheckToRead(r_id, message_id, callback) {
  this.findOne({ messages: { '$elemMatch': { _id: mongoose.Types.ObjectId(message_id) } } })
    .exec((err, chat) => {
      if (err) {
        return callback(err);
      }

      if (!chat) {
        return callback(new Error('Not found chat'));
      }

      const index = chat.messages.findIndex(m => m._id == message_id);

      if (index < 0) {
        return callback(new Error('Not found message'));
      }

      console.log(test_index++);

      chat.messages[index].check = true;
      chat.save(err => {
        if (err) {
          return callback(err);
        }

        return callback(null);
      });
    });

  // this.findOne({ r_id: r_id })
  //   .exec((err, chat) => {
  //     if (err) {
  //       return callback(err);
  //     }

  //     if (!chat) {
  //       return callback(null, { msg: 'Not found chat' });
  //     }

  //     console.log(test_index++);

  //     // If you did not check the message from the other party, change it to read.
  //     for (let message of chat.messages) {
  //       if (message._id == message_id) {
  //         message.check = true;
  //         console.log(test_index2++);
  //         break;
  //       }
  //     }

  //     chat.save(err => {
  //       if (err) {
  //         //return callback(null, chat);
  //         return callback(err);
  //       }

  //       let result = {};
  //       result.msg = 'Success';

  //       return callback(null, result);
  //     });
  //   });
};

module.exports = mongoose.model('Chat', Chat);