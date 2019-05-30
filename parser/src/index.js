'use strict'
require('module-alias/register')
;(async () => {
  const { sleep } = require('./helpers')

  process.setMaxListeners(0)
  process.on('unhandledRejection', (reason, p) => {
    console.log('Unhandled Rejection at: Promise', p, 'reason:', reason)
  })

  // const puppeteer = require('puppeteer')
  const mongoose = require('mongoose')
  const config = require('./config')
  // const Word = require(__dirname + '/models/Word.js')
  const Post = require('./models/Post.js')
  // mongoose.set('debug', true);
  const mongooseconnection = mongoose.connect('mongodb://mongo/parser')
  await mongooseconnection
  // let mongooseconnection = mongoose.connect("mongodb+srv://admin:admin@cluster0-ltqg3.gcp.mongodb.net/test?retryWrites=true");

  const GeneratorGetCatalogUrl = async function*(getCatalogUrlByPage) {
    let numPage = 1
    let { maxNumberCatPage = 10 } = config
    while (maxNumberCatPage--) {
      yield await getCatalogUrlByPage(numPage)
      numPage++
    }
  }

  const getActualCatLinks = async getCatalogUrlByPage => {
    const getCatalogUrl = GeneratorGetCatalogUrl(getCatalogUrlByPage)
    const { catalogPageMatchBreak = 3 } = config
    let catalogPageMatchBreakCurrent = 0
    for await (let links of getCatalogUrl) {
      let posts = await Post.find({ url: { $in: Object.keys(links) } })
        .limit(Object.keys(links).length)
        .exec()
      for (let post of posts) {
        delete links[post.url]
      }
      if (!Object.keys(links).length) {
        catalogPageMatchBreakCurrent++
      } else {
        catalogPageMatchBreakCurrent = 0
      }
      console.dir('add:' + Object.keys(links).length)
      if (Object.keys(links).length) {
        var bulk = Post.collection.initializeUnorderedBulkOp()
        for (let url in links) {
          bulk
            .find({ url })
            .upsert()
            .updateOne({ url })
        }
        await bulk.execute({ w: 0 })
      }
      if (catalogPageMatchBreakCurrent === catalogPageMatchBreak) {
        break
      }
      const { timeBetweenCatDown = 5555 } = config
      await sleep(timeBetweenCatDown)
    }
  }

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
  app.get('/getPage', async function(req, res) {
    res.json(1)
    const { getDataFromProjectPage } = require('@root/providers/flru')
    let posts = await Post.find(
      { title: { $exists: false } },
      { url: 1 },
      { limit: 0 }
    ).exec()
    let count = posts.length
    for (let post of posts) {
      console.dir(post.url)
      console.time('DownTime')
      await getDataFromProjectPage(post)
      post.getMetaData()
      await post.save()
      let { timeBetweenPostDown = 5555 } = config
      await sleep(timeBetweenPostDown)
      if (post.title) {
        console.dir(post.title)
      }
      console.timeEnd('DownTime')
      console.dir(count--)
    }
    console.dir('end')
    // res.json(posts)
  })
  app.get('/getCat', async function(req, res) {
    res.json('endgetActualCatLinks')
    const { getCatalogUrlByPage } = require('@root/providers/flru')
    await getActualCatLinks(getCatalogUrlByPage)
    console.dir('endgetActualCatLinks')
  })
  app.listen(80)
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
