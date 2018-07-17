'use strict'

const dotenv = require('dotenv');
dotenv.config({ path: ".env"})

const express = require('express');
const router = express.Router();

const VERIFY_TOKEN = process.env.VERIFY_TOKEN || '';
const APP_TOKEN = process.env.APP_TOKEN || '';
const FB_API = process.env.FB_API || '';
const NO_RESULT_IMAGE = process.env.NO_RESULT_IMAGE || '';

router.get('/webhook', (req, res) => {

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

router.post('/webhook', (req, res) => {  
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

module.exports.router = router;