var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var postSchema = new Schema({
    url: {
        type: String,
        unique: true,
        index: true,
    },
    title: String,
    content: String,
    amount: String,
    skype: String,
    telegram: String,
    email: String,
    phone: String,
}, {
    collection: 'posts'
});
module.exports = mongoose.model('Post', postSchema);