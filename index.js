const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;
const https = require('https');

app.use(bodyParser.json());

app.listen(port, () => {
  console.log('Server started on ' + port);
});

app.post('/webhook', (req, res) => {

  let body = req.body;

  if (body.object === 'page') {

    body.entry.forEach(function(entry) {

      let webhook_event = entry.messaging[0];
      console.log(webhook_event);
    });

    res.status(200).send('EVENT_RECEIVED');
  } else {
    res.sendStatus(404);
  }
});

app.get('/webhook', (req, res) => {

  // Your verify token. Should be a random string.
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

// https.get('https://swiftgift.me/api/v2/products?search=mug', (resp) => {
//   let data = '';

//   resp.on('data', (chunk) => {
//     data += chunk;
//   }); 
 
//   resp.on('end', () => {
//     console.log(JSON.parse(data));
//   });
 
// }).on('error', (err) => {
//     throw new Error(err.message);
// });