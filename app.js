/*
Programmer: Harsh Moreshwar Kale
Project: MugBit
Date: 10/07/2023
*/

require('dotenv').config();

const moongose = require('mongoose');
moongose.connect("mongodb://127.0.0.1:27017/practice-db");

const app = require('express')();
const http = require('http').Server(app);
const port = 3000;

const userRoute = require('./routes/userRoute');
const User = require("./models/userModel");
const Chat = require("./models/chatModel");

app.use('/', userRoute);

const io = require("socket.io")(http);

var usp = io.of('/user-namespace');


usp.on("connection", async function (socket) {    
    var userId = socket.handshake.auth.token;
    await User.findByIdAndUpdate({ _id: userId }, { $set: { is_online: '1' } });
    // User Status Broadcast
    socket.broadcast.emit("getOnlineUser", { user_id: userId });
    console.log("User Connected!");
    socket.on("disconnect", async function () {
        var time = Date();
        var activeAt = time.substr(0, 15);
        console.log("User Disconnected!");
        var userId = socket.handshake.auth.token;
        await User.findByIdAndUpdate({ _id: userId }, { $set: { is_online: '0' } });
        // User Status Broadcast
        socket.broadcast.emit("getOfflineUser", { user_id: userId, time: activeAt });
    });
    // chatting implementation
    socket.on("newChat", function(data){
        socket.broadcast.emit("loadNewChat", data);
    });
    // load old chats
    socket.on("existsChat", async function(data){
        var chats = await Chat.find({ $or: [
            {
                sender_id: data.sender_id,
                receiver_id: data.receiver_id
            },
            {
                sender_id: data.receiver_id,
                receiver_id: data.sender_id
            }
        ] });
        socket.emit("loadChats", { chats: chats });
    });
});

http.listen(port, function () {
    console.log(`Server is running at http://localhost:${port}`);
})


