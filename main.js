const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const ig = require('instagram-node').instagram();
const Twitter = require('twitter');
const dotenv = require('dotenv').load();
const TwitterStream = require('node-tweet-stream')


app.set('view engine', 'ejs');


let tag = 'trump';
let tweetHolder = [];


const client = new Twitter({
    consumer_key: process.env.TWITTER_CONSUMER_KEY,
    consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
    bearer_token: process.env.TWITTER_BEARER_TOKEN
});


const stream = new TwitterStream({
    consumer_key: process.env.TWITTER_CONSUMER_KEY,
    consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
    token: process.env.TWITTER_TOKEN,
    token_secret: process.env.TWITTER_TOKEN_SECRET
});


client.get('search/tweets', {
    q: `#${tag}`,
    count: 50
}, function(error, tweets, response) {
    tweetHolder = tweets.statuses;
});


app.use('/assets', express.static('assets'));


app.get('/', (req, res) => {
    res.render('index', {tweets: tweetHolder});
});


io.on('connection', (socket) => {
    console.log('User connected');

    socket.on('new tag', (newTag) => {
        stream.untrack(`#${tag}`);
        tag = newTag;
        client.get('search/tweets', {
            q: `#${tag}`,
            count: 50
        }, function(error, tweets, response) {
            tweetHolder = tweets.statuses;
            stream.track(`#${tag}`);
            io.emit('new tag', tweetHolder);
        });

    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});


stream.on('tweet', function (tweet) {
    // console.log('tweet received', tweet);
    io.emit('new tweet', tweet);
})

stream.on('error', function (err) {
    console.log('Oh no')
})

stream.track(`#${tag}`);


// ig.use({
//     client_id: process.env.IG_CLIENT_ID,
//     client_secret: process.env.IG_CLIENT_SECRET
// });
// ig.use({ access_token: "8138115510.bc91208.805453ed591c418792212d394026a652" });

// var redirect_uri = 'http://localhost:3000/handleauth';

// exports.authorize_user = function(req, res) {
//     res.redirect(ig.get_authorization_url(redirect_uri));
// };

// exports.handleauth = function(req, res) {
//     ig.authorize_user(req.query.code, redirect_uri, function(err, result) {
//     if (err) {
//         console.log(err.body);
//         res.send("Didn't work");
//     } else {
//         console.log('Yay! Access token is ' + result.access_token);
//         res.send('You made it!!');
//     }
//     });
// };

// app.get('/authorize_user', exports.authorize_user);
// app.get('/handleauth', exports.handleauth);

// ig.tag('tag', function(err, result, remaining, limit) {
//     console.log('IG tag search: ', result);
// });

// var stream = client.stream('statuses/filter', {track: 'javascript'});
// stream.on('data', function(event) {
//     console.log(event && event.text);
// });

// stream.on('error', function(error) {
//     throw error;
// });

// You can also get the stream in a callback if you prefer.
// client.stream('statuses/filter', {track: 'javascript'}, function(stream) {
//     stream.on('data', function(event) {
//         console.log(event && event.text);
//     });

//     stream.on('error', function(error) {
//         throw error;
//     });
// });


http.listen(3000, () => {
    console.log('listening on port 3000');
});