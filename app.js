require('dotenv').config();

const moongose = require('mongoose');
moongose.connect("mongodb://127.0.0.1:27017/practice-db");

const app = require('express')();
const http = require('http').Server(app);
const port = 3000;

const userRoute = require('./routes/userRoute');

app.use('/', userRoute);

http.listen(port, function(){
    console.log(`Server is running at http://localhost:${port}`);
})


