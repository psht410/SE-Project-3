var mongoose = require('mongoose');

var UserSchema = new mongoose.Schema({
    username: {
        type: String,
        unique: true,
        lowercase: true
    },
    password: String,
    phone: Number,
    location: String,
    admin: {
        type: Boolean,
        default: false
    },
    pfp: mongoose.Schema.Types.Mixed,
    regdate: {
        type: Date,
        default: Date.now
    }
});

var User = mongoose.model('User', UserSchema);

module.exports = User;