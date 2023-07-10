const moongose = require('mongoose');

const userSchema = new moongose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true 
    },
    image: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true 
    },
    is_online: {
        type: String, 
        default: "0"
    }
},
{
    timestamps: true
});

module.exports = moongose.model('User', userSchema);