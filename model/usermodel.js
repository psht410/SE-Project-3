var mongoose = require('mongoose');

var UserSchema = new mongoose.Schema({
    username: {
        type: String,
        unique: true
    },
    password: String,
    phone: Number,
    location: String,
    pfp: mongoose.Schema.Types.Mixed,
    regdate: {
        "type": Date,
        "default": Date.now
    }
});

var User = mongoose.model('User', UserSchema);

module.exports = User;