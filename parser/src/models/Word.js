var mongoose = require('mongoose')
var Schema = mongoose.Schema
var wordSchema = new Schema(
  {
    word: {
      type: String,
      unique: true,
      required: true,
      index: true
    },
    number: { type: Number, default: 0 }
  },
  {
    collection: 'words'
  }
)
module.exports = mongoose.model('Word', wordSchema)
