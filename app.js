const express = require('express');
const http = require('http');

const database = require('./config/database')

const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const router = require('./route/route');

var host = '127.0.0.1';

var app = express();

app.set('port', 3000);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(cookieParser());

router.route(app);

app.listen(app.get('port'), host);

var server = http.createServer(app).listen(app.get('port'), function() {
    console.log('서버 실행함.');
    
    database.connect();
});
