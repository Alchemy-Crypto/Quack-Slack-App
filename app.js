const { App } = require('@slack/bolt');
require('dotenv').config();
const request = require('superagent');






const app = new App({
  token: process.env.SLACK_API_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET
});


app.action('check-balance', async({ ack, say, body }) => {
  await ack();
  const totalSupply = await request.get(`${process.env.BACKEND_URL}/quack/total-supply`);
  await say(totalSupply.res.text);
})


app.action('send-quacks', async({ ack, say, body }) => {
  await ack();

  
  await say('Request approved 👍');
})


app.action('mint-quacks', async({ ack, say, body }) => {
  await ack();

 
  await say('Request approved 👍');
})


app.command('/quack', async({ command, ack, say }) => {
  await ack();
  const totalSupply = await request.get(`${process.env.BACKEND_URL}/quack/total-supply`);
  const total = totalSupply.res.text;
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
          "text": `Welcome to our App. Currently there are *${total}* Quacks in the pond. :duck:`
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


(async() => {
  await app.start(process.env.PORT || 8080);
  console.log('the app is running');
})();

module.exports = { app };