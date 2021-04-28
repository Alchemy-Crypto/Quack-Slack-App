const { App } = require('@slack/bolt');
require('dotenv').config();



const app = new App({
  token: process.env.SLACK_API_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET
});


app.event('app_home_opened', ({ event, say }) => {
  console.log('triggered');
  say(`Welcome, <@${event.user}>`);
});


app.action('check-balance', async({ ack, say, body }) => {
  await ack();

  console.log('action event?!?!', body)
  await say('Request approved 👍');
})


app.action('send-quacks', async({ ack, say, body }) => {
  await ack();

  console.log('action event?!?!', body)
  await say('Request approved 👍');
})


app.action('mint-quacks', async({ ack, say, body }) => {
  await ack();

  console.log('action event?!?!', body)
  await say('Request approved 👍');
})


app.command('/quack', async({ command, ack, say }) => {
  await ack();

  await say(
    {
    "blocks": [
      {
        "type": "header",
        "text": {
          "type": "plain_text",
          "text": "Quack",
          "emoji": true
        }
      },
      {
        "type": "section",
        "text": {
          "type": "mrkdwn",
          "text": "Welcome to our App :ghost:"
        }
      },
      {
        "type": "actions",
        "elements": [
          {
            "type": "button",
            "text": {
              "type": "plain_text",
              "text": "Check Balance",
              "emoji": true
            },
            "value": "check your balance",
            "action_id": "check-balance"
          },
          {
            "type": "button",
            "text": {
              "type": "plain_text",
              "text": "Send Quacks",
              "emoji": true
            },
            "value": "click_me_123",
            "action_id": "send-quacks"
          },
          {
            "type": "button",
            "text": {
              "type": "plain_text",
              "text": "Mint Quacks",
              "emoji": true
            },
            "value": "click_me_123",
            "action_id": "mint-quacks"
          }
        ]
      }
    ]
  })
});


app.message('hello', async ({ message, say }) => {
  await say(`hi,<@${message.user}>, how ya doin!` );
});

// app.post('/actions', (req, res) => {
//   const payload = JSON.parse(req.body.payload);
//   const { type, user, view } = payload; 
//   console.log(req.body);
  
//   if (!signature.isVerified(req)) {
//     res.sendStatus(404);
//     return;
//   }

//   if(type === 'message_action') {
//   } else if (type === 'view_submission') {
//   }
// });


(async() => {
  await app.start(process.env.PORT || 8080);
  console.log('the app is running');
})();

module.exports = { app };