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

postSchema.methods.getMetaData = function() {
  try {
    const replaceAll = function(target, search, replacement) {
      return target.replace(new RegExp(search, 'g'), replacement)
    }
    let txt = this.content
    txt = replaceAll(txt, '&#8211', '')
    txt = replaceAll(txt, '&nbsp', '')
    txt = replaceAll(txt, '&quot', '')
    txt = replaceAll(txt, '<br>', ' ')

    txt = txt.toLowerCase()
    let reg = {
      telegram: /(telegram|телеграмм|телеграм)+[\s:\.,\n@]*([a-zA-z-0-9]{2,})|t\.me/gim,
      vk: /vk\.com\/[A-Za-z0-9]+/gim,
      email: /([A-Za-z0-9_\-]+\.*[A-Za-z0-9_\-]+@[A-Za-z0-9][A-Za-z0-9\-]*[A-Za-z0-9]\.+[A-Za-z]{2,4})/gim,
      skype: /(skype|скайп|скайпе|скайпу)+[\s:\(\)\-–\.,\n@]*?([a-zA-z0-9\.\-_+!@#$%^?>:<&*=]{3,})/gim
    }
    for (let regt in reg) {
      let m
      let regex = reg[regt]
      while ((m = regex.exec(txt)) !== null) {
        if (m.index === regex.lastIndex) {
          regex.lastIndex++
        }
        if (m[2]) {
          m[2] = m[2].replace(/whatsapp|email|slack|vk|telegram/gim, '')
        }
        this[regt] = m[2] || null
      }
    }
  } catch (er) {
    console.dir(this.title)
    console.dir(er)
  }
}
module.exports = postSchema
