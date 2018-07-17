
'use strict'

const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');

const app = express();

app.set('port', (process.env.PORT || 5000));

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.get('/', function(req, res) {
	res.send('Hi swiftgift team!');
})

const APP_TOKEN = 'EAADK80zWSdgBAPZBcBGoGYYA1o38XFy3KKRGOwC32ZCWmBEYjRw3rVJN5rBeWT2nFZAwa7m0pIBMvgFvsGCWA4rLxIBlsk3VqdYHfDJjulZB8P9XpX3FBZCD5XEQgtY2IXkuO0Do9wUDo2vCXLZBZBoVCu4qdlQXMeavMQ4u4pwtwZDZD'
const FB_API = 'https://graph.facebook.com/v2.6/me/messages';
const NO_RESULT_IMAGE = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ5HuehtrKIwuO1jb0tq7o8-O5OzmUKsDeQj2_K18I7h6voDpjB7Q';

app.get('/webhook', (req, res) => {

  let VERIFY_TOKEN = 'swiftgift'
    
  let mode = req.query['hub.mode'];
  let token = req.query['hub.verify_token'];
  let challenge = req.query['hub.challenge'];
    
  if (mode && token) {
  
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {    
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

      if(webhook_event.message) {
        
        let message = webhook_event.message.text;
        let sender = webhook_event.sender.id;

        getGift(message).then(
          (result) => {
            createMessage(sender, result.collection);
            res.sendStatus(200);
          },
          (err) => {
            sendErrorMessage(sender, 'Try again please');
            throw new Error(err.message);
            res.sendStatus(404);
          }
        )
      }else {
        res.sendStatus(404);
      }
    });
  } else {
    res.sendStatus(404);
  }
});

function sendMessage(sender, elements) {
	request({
		url: FB_API,
		qs : { access_token: APP_TOKEN },
		method: 'POST',
		json: {
			recipient: { id: sender },
			message:{
        attachment:{
          type:'template',
          payload:{
            template_type: 'generic',
            sharable: true,
            image_aspect_ratio: 'square',
            elements: elements
          }
        }
      }
		}
	}, (error, response, body) => {
		if (error) {
      sendErrorMessage(sender, 'Try again please');
      throw new Error('Error on send msg to FB', error);
		} else if (response.body.error) {
      sendErrorMessage(sender, 'Try again please');
      throw new Error('Error on send msg to FB', response.body.error);
		}
	})
}

function sendErrorMessage(sender, text){
  request({
		url: FB_API,
		qs : { access_token: APP_TOKEN },
		method: 'POST',
		json: {
			recipient: { id: sender },
			message:{
        text: text,
      }
		}
	}, (error, response, body) => {
		if (error) {
      sendErrorMessage(sender, 'Try again please');
      throw new Error('Error on send msg to FB', error);
		} else if (response.body.error) {
      sendErrorMessage(sender, 'Try again please');
      throw new Error('Error on send msg to FB', response.body.error);
		}
	})
}

function getGift(data){
  return new Promise((resolve, reject) => {
    request({
      url: `https://swiftgift.me/api/v2/products`,
      qs : { search: data},
      method: 'GET',
    }, (error, response, body) => {
      if (error) {
        sendErrorMessage(sender, 'Try again please');
        throw new Error('Error on get data from API', error);
      } else if (response.body.error) {
        sendErrorMessage(sender, 'Try again please');        
        throw new Error('Error on get data from API', response.body.error);
      }
      if(body){
        resolve(JSON.parse(body));
      }
    })
  })
}

function createMessage(sender, data){
  let response = [];
  return new Promise((resolve, reject) => {
    if(data.length > 0){
      data.map((i, index) => {
        response.push({
          title: i.name,
          image_url: i.image_url.substr(2),
          subtitle: i.lowest_price + i.currency,
        });
        if(index % 5 === 0 || index === data.length - 1){
          sendMessage(sender, response);
          response = [];
        }
      })
      
    }else{
      sendMessage(sender, [{
        title: 'Ohh... no gifts for you',
        image_url: NO_RESULT_IMAGE,
      }]);
    }
  });
}

app.listen(app.get('port'), function() {
	console.log('Server started')
})


