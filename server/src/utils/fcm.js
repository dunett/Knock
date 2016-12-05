const FCM = require('fcm-push');
const fcm = new FCM(process.env.FCM_KEY);

// const message = {
//    registration_ids : [device1],
//    notification : {
//       title : '메세지 제목',
//       text : 'FCM 메세지 내용',
//       icon : 'ic_football'
//    }
//};

module.exports = fcm;