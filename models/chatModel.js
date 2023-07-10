const moongose = require("mongoose");

const chatSchema = moongose.Schema({
    sender_id: {
        type: moongose.Schema.Types.ObjectId,
        ref: 'User'
    },
    receiver_id: {
        type: moongose.Schema.Types.ObjectId,
        ref: 'User'
    },
    message: {
        type: String,
        required: true
    }
},
{
    timestamps: true 
});

module.exports = moongose.model('Chat', chatSchema);