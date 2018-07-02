const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const ig = require('instagram-node').instagram();
const Twitter = require('twitter');
const dotenv = require('dotenv').load();
const fs = require('fs');


app.set('view engine', 'ejs');


const client = new Twitter({
    consumer_key: process.env.TWITTER_CONSUMER_KEY,
    consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
    bearer_token: process.env.TWITTER_BEARER_TOKEN
});

let twoots = [];

client.get('search/tweets', {
    q: '#spongebob'
}, function(error, tweets, response) {
    // console.log('Error: ', error);
    // console.log('Tweets: ', tweets.statuses);
    twoots = tweets.statuses;
    // console.log('Response: ', response);
});

app.use('/assets', express.static('assets'));


app.get('/', (req, res) => {
    res.render('index', {tweets: twoots});
});


io.on('connection', (socket) => {
    console.log('a user connected');

    socket.on('chat message', (msg) => {
        console.log('Message: ', msg);
        // io.emit('chat message', msg);
    });

    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});


http.listen(3000, () => {
    console.log('listening on 3000');
});