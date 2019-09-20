'use strict'
require('module-alias/register')
;(async () => {
  process.setMaxListeners(0)
  process.on('unhandledRejection', (reason, p) => {
    console.log('Unhandled Rejection at: Promise', p, 'reason:', reason)
  })

  const mongoose = require('mongoose')
  const Post = require('@root/models/Post.js')

  let mongooseconnection = null
  while (!mongooseconnection) {
    mongooseconnection = mongoose.connect('mongodb://mongo/parser').catch(null)
    await mongooseconnection
    if (!mongooseconnection) {
      console.dir('mongooseconnection not ready')
    }
  }

  const express = require('express')
  const app = express()
  app.use(function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*')
    res.header(
      'Access-Control-Allow-Headers',
      'Origin, X-Requested-With, Content-Type, Accept'
    )
    next()
  })
  app.get('/api/posts', async function(req, res) {
    let posts = await Post.find({
      $or: [
        { skype: { $ne: null } },
        { telegram: { $ne: null } },
        { email: { $ne: null } },
        { phone: { $ne: null } },
        { vk: { $ne: null } }
      ]
    })
    res.json(posts)
  })
  app.listen(80)
})()
