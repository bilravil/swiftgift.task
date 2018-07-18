
'use strict'

const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
dotenv.config({ path: ".env"})

const app = express();
const router = require('./routes').router;

app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

app.set('port', (process.env.PORT || 5000));
app.use(router);

app.listen(app.get('port'), function() {
	console.log('Server started')
})


