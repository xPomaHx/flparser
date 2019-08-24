'use strict'
require('module-alias/register')
;(async () => {
  process.setMaxListeners(0)
  process.on('unhandledRejection', (reason, p) => {
    console.log('Unhandled Rejection at: Promise', p, 'reason:', reason)
  })

  // const puppeteer = require('puppeteer')
  const mongoose = require('mongoose')
  // const Word = require(__dirname + '/models/Word.js')
  const Post = require('@root/models/Post.js')
  // mongoose.set('debug', true);
  let mongooseconnection = null
  while (!mongooseconnection) {
    mongooseconnection = mongoose.connect('mongodb://mongo/parser').catch(null)
    await mongooseconnection
    if (!mongooseconnection) {
      console.dir('mongooseconnection not ready')
    }
  }
  // let mongooseconnection = mongoose.connect("mongodb+srv://admin:admin@cluster0-ltqg3.gcp.mongodb.net/test?retryWrites=true");

  const express = require('express')
  const app = express()
  app.get('/getWithContact', async function(req, res) {
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
  const getPage = require('@root/jobs/downloadProjectPages')
  app.get('/getPage', async function(req, res) {
    res.json(await getPage())
    // await getPage()
    console.dir('end')
  })

  const getCat = require('@root/jobs/downloadCatalogPages')

  app.get('/getCat', async function(req, res) {
    res.json('endgetActualCatLinks')
    await getCat()
    console.dir('endgetActualCatLinks')
  })
  app.listen(80)
  /*
  ;(async () => {
    const { sleep } = require('@root/helpers')
    console.dir('Start infinity jobs')
    while (true) {
      await getCat()
      await sleep(1000 * 60 * 1)
      await getPage()
      await sleep(1000 * 60 * 30)
    }
  })()
  */
  /*
  только платно
  https://www.fl.ru

  приоритетное направление
  https://www.weblancer.net
  https://freelance.ua/
  http://www.kadrof.ru/work/40575
  https://www.freelancejob.ru/projects/p4/
  https://vk.com/garantfreelance
  https://vk.com/frilansfree

  всегда есть емайл мало заказов
  https://myfreelancing.ru/advert-category/prj/


  заявки бесплатно, только для интелектуального поиска.
  https://freelancehunt.com/projects


  на рассмотрении
https://freelansim.ru/

*/
})()
