const { App } = require('@slack/bolt');
require('dotenv').config();
const request = require('superagent');


const app = new App({
  token: process.env.SLACK_API_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET
});


app.action('check-balance', async({ ack, say, body }) => {
  await ack();
  const checkBalance = await request.get(`${process.env.BACKEND_URL}/quack/check-balance/${body.user.id}`);
  await say(`Your current balance is ${checkBalance.text} Quacks. :duck:`);
});


app.action('send-quacks', async({ ack, say, body, client }) => {
  await ack();
  try {
    const result = await client.views.open({
      trigger_id: body.trigger_id,
      view: {
        "type": "modal",
        "title": {
          "type": "plain_text",
          "text": "Quackchain",
          "emoji": true
        },
        "submit": {
          "type": "plain_text",
          "text": "Send Quacks",
          "emoji": true
        },
        "close": {
          "type": "plain_text",
          "text": "Cancel",
          "emoji": true
        },
        "callback_id": "send-quacks",
        "blocks": [
          {
            "type": "header",
            "text": {
              "type": "plain_text",
              "text": "Welcome to the Quackchain! ",
              "emoji": true
            }
          },
          {
            "type": "divider"
          },
          {
            "type": "section",
            "text": {
              "type": "plain_text",
              "text": "Enter the details below to send some quacks to your fellow ducks!",
              "emoji": true
            }
          },
          {
            "type": "divider"
          },
          {
            "block_id": "receiver-id",
            "type": "input",
            "element": {
              "type": "multi_users_select",
              "max_selected_items": 1,
              "placeholder": {
                "type": "plain_text",
                "text": "Select users",
                "emoji": true
              },
              "action_id": "receiver-action"
            },
            "label": {
              "type": "plain_text",
              "text": "Who would you like to send Quacks to?",
              "emoji": true
            }
          },
          {
            "type": "context",
            "elements": [
              {
                "type": "plain_text",
                "text": "Only allowed to select 1 recipient!",
                "emoji": true
              }
            ]
          },
          {
            "block_id": "amount-input",
            "type": "input",
            "element": {
              "type": "plain_text_input",
              "action_id": "amount-action"
            },
            "label": {
              "type": "plain_text",
              "text": "How many Quacks should we send?",
              "emoji": true
            }
          },
          {
            "type": "context",
            "elements": [
              {
                "type": "plain_text",
                "text": "Whole Quacks, only, please!",
                "emoji": true
              }
            ]
          },
          {
            "block_id": "notes-input",
            "type": "input",
            "element": {
              "type": "plain_text_input",
              "multiline": true,
              "action_id": "notes-input"
            },
            "label": {
              "type": "plain_text",
              "text": "Add a note to send with your Quacks",
              "emoji": true
            }
          }
        ]
      }
    });

    console.log(result);
  }
  catch (error) {
    console.error(error);
  }
  // await say();
});


app.view('send-quacks', async({ ack, body, view, client }) => {
  await ack();
  const senderId = body.user.id;
  const receiverId = view.state.values['receiver-id']['receiver-action'].selected_user;
  const amount = view.state.values['amount-input']['amount-action'].value;
  console.log(senderId, receiverId, amount);
  const sendQuacks = await request.post(`${process.env.BACKEND_URL}/quack/send-quacks`).send({
    senderId,
    receiverId,
    amount
  })
  await say();
})


app.action('mint-quacks', async({ ack, say, body }) => {
  await ack();
  const mintQuacks = await request
  await say();
});


app.command('/quack', async({ command, ack, say }) => {
  await ack();
  const totalSupply = await request.get(`${process.env.BACKEND_URL}/admin/total-supply`);
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