const { App } = require('@slack/bolt');
require('dotenv').config();
const request = require('superagent');


const app = new App({
  token: process.env.SLACK_API_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET
});


app.action('check-balance', async({ ack, body, client }) => {
  await ack();
  const checkBalance = await request.get(`${process.env.BACKEND_URL}/quack/check-balance/${body.user.id}`);
  await client.chat.postEphemeral({
    channel: body.channel.id,
    user: body.user.id,
    text: `Your current balance is ${checkBalance.text} Quacks. :duck:`
  });
});


app.action('send-quacks', async({ ack, body, client }) => {
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
              "text": "Welcome to the QuackChain! ",
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
              "action_id": "notes-action"
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
  }
  catch (error) {
    console.error(error);
  };
});



app.view('send-quacks', async({ ack, body, view, client }) => {
  await ack();
  const senderId = body.user.id;
  const receiverId = view.state.values['receiver-id']['receiver-action'].selected_users[0];
  const amount = view.state.values['amount-input']['amount-action'].value;
  const balance = await request.get(`${process.env.BACKEND_URL}/quack/check-balance/${body.user.id}`);
  console.log('balance line 151', balance.text);
  if(balance.text < amount) {
    await client.chat.postEphemeral({
      channel: senderId,
      user: senderId, 
      text: `Not enough quacks for this transaction.`
    });
  } else {
    await request.post(`${process.env.BACKEND_URL}/quack/send-quacks`).send({
    senderId,
    receiverId,
    amount
    });
    const notes = view.state.values['notes-input']['notes-action'].value;
    await client.chat.postMessage({
    channel: receiverId,
    text: `<@${senderId}> just sent you ${amount} Quacks! 
    This transaction is being recorded onto the blockchain and should be available in your account in about a minute! 
    from <@${senderId}>: ${notes} :duck:`
  });
  await client.chat.postEphemeral({
    channel: senderId,
    user: senderId, 
    text: `Transaction has been initiated`
  });
}
});


app.action('mint-quacks', async({ ack, body, client }) => {
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
          "text": "Mint Quacks",
          "emoji": true
        },
        "close": {
          "type": "plain_text",
          "text": "Cancel",
          "emoji": true
        },
        "callback_id": "mint-quacks",
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
              "text": "Here you can create Quacks! In order to mint Quacks you must first burn some as a processing fee.",
              "emoji": true
            }
          },
          {
            "type": "divider"
          },
          {
            "block_id": "mint-input",
            "type": "input",
            "element": {
              "type": "plain_text_input",
              "action_id": "mint-action"
            },
            "label": {
              "type": "plain_text",
              "text": "How many Quacks would you like to mint?",
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
          }
        ]
      }
    });
  }
  catch (error) {
    console.error(error);
  }
});


app.view('mint-quacks', async({ ack, body, view, client }) => {
  await ack();
  const slackId = body.user.id;
  const amount = view.state.values['mint-input']['mint-action'].value;
  await request.post(`${process.env.BACKEND_URL}/quack/mint-quacks`).send({
    slackId,
    amount
  });
  const accountList = await request.get(`${process.env.BACKEND_URL}/admin/account-list`);
  const perCapita = Math.floor((amount/accountList.body.length));
  for(const account of accountList.body) {
    await client.chat.postMessage({
      channel: account,
      text: `<@${slackId}> has minted ${amount} new Quacks. Each holder has received ${perCapita} Quacks.`
    });
  }
});



app.command('/quack', async({ command, ack, client }) => {
  await ack();
  const totalSupply = await request.get(`${process.env.BACKEND_URL}/admin/total-supply`);
  const total = totalSupply.res.text;
  await client.chat.postEphemeral(
    {
    "channel": command.channel_id,
    "user": command.user_id,
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

app.event('app_home_opened', async ({ event, client, context }) => {
  try {
      const result = await client.views.publish({
          user_id: event.user,
          view: {
            "type": "home",
            "blocks": [
              {
                "type": "header",
                "text": {
                  "type": "plain_text",
                  "text": "Welcome to QuackChain!"
                }
              },
              {
                "type": "divider"
              },
              {
                "type": "section",
                "text": {
                  "type": "mrkdwn",
                  "text": "*What is Quack?*"
                }
              },
              {
                "type": "section",
                "text": {
                  "type": "mrkdwn",
                  "text": "Quack is a digital currency built on the the Ethereum ERC-20 standard. It is deployed to an Ethereum testnet and used as a workspace specific currency in Slack. This provides a permanent, distributed record of all transactions."
                }
              },
              {
                "type": "divider"
              },
              {
                "type": "section",
                "text": {
                  "type": "mrkdwn",
                  "text": "*QuackChain's Mission*"
                }
              },
              {
                "type": "section",
                "text": {
                  "type": "plain_text",
                  "text": "QuackChain will allow members of the workspace to show appreciation for one another by sending tips, use Quacks to show support for proposals and participate in a digital marketplace. This will incentivize acts of appreciation, encourage camaraderie and make Slack more fun and interactive.",
                  "emoji": true
                }
              },
              {
                "type": "divider"
              },
              {
                "type": "section",
                "text": {
                  "type": "mrkdwn",
                  "text": "*How to use it!*"
                }
              },
              {
                "type": "section",
                "text": {
                  "type": "mrkdwn",
                  "text": "It's quite simple! To interact with the app, simply type */quack* in any channel you are a member of. You will be presented with an interface that let's you send quacks to team members, check your Quack wallet balance and mint new quacks to the blockchain."
                }
              },
              {
                "type": "divider"
              },
              {
                "type": "section",
                "text": {
                  "type": "mrkdwn",
                  "text": "*What is minting?*"
                }
              },
              {
                "type": "section",
                "text": {
                  "type": "plain_text",
                  "text": "Every cryptocurrency has a total supply, this is what gives it its value. Users can mint new Quacks to the blockchain, which adds more currency to the total supply. Upon minting new Quacks the minted amount is distributed evenly amongst all current Quack holders. As a fee, half of the minters portion of the distribution will be burned and removed from the total supply to avoid runaway inflation. Mint with care!! :duck:",
                  "emoji": true
                }
              },
              {
                "type": "section",
                "text": {
                  "type": "mrkdwn",
                  "text": "*Here is an example of the minting process*:"
                }
              },
              {
                "type": "section",
                "text": {
                  "type": "mrkdwn",
                  "text": "_Alice would like to mint *1000 new Quacks*. There are currently *10* Quack holders, including Alice. Upon minting Alice will receive *50 Quacks* and Bob, another holder, will receive *100 Quacks*. The total supply will increase by *1000 Quacks*._"
                }
              },
              {
                "type": "divider"
              },
              {
                "type": "section",
                "text": {
                  "type": "mrkdwn",
                  "text": "*Learn more about the QuackChain project!*"
                }
              },
              {
                "type": "section",
                "text": {
                  "type": "mrkdwn",
                  "text": "<https://github.com/Alchemy-Crypto| Github Project Page>"
                }
              },
              {
                "type": "section",
                "text": {
                  "type": "mrkdwn",
                  "text": "<https://github.com/Alchemy-Crypto/docs/blob/main/README.md| QuackChain Creators>"
                }
              }
            ]
          }
      });
  } catch (err) {
      console.log(err);
  }
});



(async() => {
  await app.start(process.env.PORT || 8080);
  console.log('the app is running');
})();

module.exports = { app };
