const mongoose = require('mongoose')

const postSchema = require('./schemes/post')

module.exports = mongoose.model('Post', postSchema)
