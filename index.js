
'use strict'

const express = require('express')
const bodyParser = require('body-parser')
const request = require('request')

const app = express()

app.set('port', (process.env.PORT || 5000))

// Allows us to process the data
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

// ROUTES

app.get('/', function(req, res) {
	res.send("Hi I am a chatbot")
})

let token = "EAADK80zWSdgBAPZBcBGoGYYA1o38XFy3KKRGOwC32ZCWmBEYjRw3rVJN5rBeWT2nFZAwa7m0pIBMvgFvsGCWA4rLxIBlsk3VqdYHfDJjulZB8P9XpX3FBZCD5XEQgtY2IXkuO0Do9wUDo2vCXLZBZBoVCu4qdlQXMeavMQ4u4pwtwZDZD"

app.get('/webhook', (req, res) => {

  let VERIFY_TOKEN = "swiftgift"
    
  let mode = req.query['hub.mode'];
  let token = req.query['hub.verify_token'];
  let challenge = req.query['hub.challenge'];
    
  if (mode && token) {
  
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      
      console.log('WEBHOOK_VERIFIED');
      res.status(200).send(challenge);
    
    } else {
      res.sendStatus(403);
    }
  }
});

app.post('/webhook', (req, res) => {  
 
  let body = req.body;
  if (body.object === 'page') {

    body.entry.forEach(function(entry) {

      let webhook_event = entry.messaging[0];
      let message = webhook_event.message.text;
      let sender = webhook_event.sender.id;
      console.log('MESSAGE', message);
      getGift(message).then(
        (res) => {
          if(res.collection){
            return sendText(sender, JSON.stringify(res.collection));
          }else{
            return sendText(sender, 'Ohh.. No gifts');
          }
        },
        (err) => {
          console.log(err);
        }
      )
    });
    res.status(200).send('EVENT_RECEIVED');
  } else {
    res.sendStatus(404);
  }

});

function sendText(sender, text) {
	let messageData = {text: text}
	request({
		url: "https://graph.facebook.com/v2.6/me/messages",
		qs : { access_token: token },
		method: "POST",
		json: {
			recipient: { id: sender },
			message : messageData,
		}
	}, (error, response, body) => {
		if (error) {
			console.log("sending error")
		} else if (response.body.error) {
			console.log("response body error")
		}console.log(body);
	})
}

function getGift(data){
  return new Promise((resolve, reject) => {
    request({
      url: `https://swiftgift.me/api/v2/products`,
      qs : { search: data},
      method: "GET",
    }, (error, response, body) => {
      if (error) {
        throw new Error('Error on get data from API');
      } else if (response.body.error) {
        throw new Error('Error on get data from API');
      }
      if(body){
        resolve(body);
      }
    })
  })
}


app.listen(app.get('port'), function() {
	console.log("Server started")
})


