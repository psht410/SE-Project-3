var mongoose = require('mongoose');

var ImageSchema = new mongoose.Schema({
    itemid: String,
    imgname: String
});

var Image = mongoose.model('Image', ImageSchema);

module.exports = Image;