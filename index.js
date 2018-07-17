
'use strict'

const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const dotenv = require('dotenv');
dotenv.config({ path: ".env"})

const app = express();
const router = require('./routes');
app.set('port', (process.env.PORT || 5000));

app.get('/', function(req, res) {
	res.send('Hi swiftgift team!');
})


app.listen(app.get('port'), function() {
	console.log('Server started')
})


