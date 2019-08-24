const mongoose = require('mongoose')

const Schema = mongoose.Schema
const postSchema = new Schema(
  {
    url: {
      type: String,
      unique: true,
      required: true,
      index: true
    },
    src: String,
    title: String,
    content: String,
    amount: String,
    skype: String,
    telegram: String,
    email: String,
    phone: String,
    vk: String
  },
  {
    collection: 'posts'
  }
)

module.exports = postSchema
