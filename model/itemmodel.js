var mongoose = require('mongoose');

var ItemSchema = new mongoose.Schema({
    title: String,
    content: String,
    username: String,
    status: Boolean,
    buyer: Object,
    price: Number,
    phone: Number,
    tag : Object,
    image: [mongoose.Schema.Types.Mixed],
    hit: {
        type: Number,
        default: 0
    },
    like_count: {
        type: Number,
        default: 0
    },
    like_users: {
        type: [String],
        default: ""
    },
    regdate: {
        type: Date,
        default: Date.now
    }
});

var Item = mongoose.model('Item', ItemSchema);

module.exports = Item;