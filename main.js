const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const ig = require('instagram-node').instagram();
const Twitter = require('twitter');
const dotenv = require('dotenv').load();


app.set('view engine', 'ejs');


const client = new Twitter({
    consumer_key: process.env.TWITTER_CONSUMER_KEY,
    consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
    bearer_token: process.env.TWITTER_BEARER_TOKEN
});

ig.use({
    client_id: process.env.IG_CLIENT_ID,
    client_secret: process.env.IG_CLIENT_SECRET
});


var redirect_uri = 'http://localhost:3000';

exports.authorize_user = function(req, res) {
    res.redirect(ig.get_authorization_url(redirect_uri));
};

exports.handleauth = function(req, res) {
    ig.authorize_user(req.query.code, redirect_uri, function(err, result) {
    if (err) {
        console.log(err.body);
        res.send("Didn't work");
    } else {
        console.log('Yay! Access token is ' + result.access_token);
        res.send('You made it!!');
    }
    });
};

// This is where you would initially send users to authorize
app.get('/authorize_user', exports.authorize_user);
// This is your redirect URI
app.get('/handleauth', exports.handleauth);


ig.tag('tag', function(err, result, remaining, limit) {
    console.log('IG tag search: ', remaining);
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

    socket.on('chat message', (tag) => {

        client.get('search/tweets', {
            q: `#${tag}`
        }, function(error, tweets, response) {
            twoots = tweets.statuses;

            io.emit('chat message', twoots);
        });

    });

    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});


http.listen(3000, () => {
    console.log('listening on 3000');
});