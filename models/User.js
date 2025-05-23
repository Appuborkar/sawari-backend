const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    photo: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
    },
    mobile: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    }
});



module.exports = mongoose.model('User', UserSchema);
