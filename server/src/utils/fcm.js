const FCM = require('fcm-push');
const fcm = new FCM(process.env.FCM_KEY);

// const message = {
//   to: token.fcm_token,
//   //collapse_key: param.r_id,
//   notification: {
//     title: arg.from,
//     text: arg.message,
//   },
// };

// fcm.send(message, (err, response) => {
//   if (err) {
//     console.error("Something has gone wrong!");
//   } else {
//     console.log("Successfully sent with response: ", response);
//   }
// });

module.exports = fcm;