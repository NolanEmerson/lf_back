const http = require('http');
const express = require('express');

const app = express();

app.use('/assets', express.static('assets'));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.listen(3000, () => {
    console.log('Listening on port 3000');
});