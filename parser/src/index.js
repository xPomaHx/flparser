'use strict'
require('module-alias/register')
;(async () => {
  process.setMaxListeners(0)
  process.on('unhandledRejection', (reason, p) => {
    console.log('Unhandled Rejection at: Promise', p, 'reason:', reason)
  })

  const mongoose = require('mongoose')
  const { sleep } = require('@root/common/helpers')

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
  app.get('/rescan', async function(req, res) {
    const providers = require('@root/providers')
    await providers['www.weblancer.net'].reScan()
    res.send('ready')
  })
  app.listen(80)
  ;(async () => {
    while (true) {
      console.dir('jobStart')
      const providers = require('@root/providers')
      await providers['www.weblancer.net'].getActualCatLinks()
      await providers['www.weblancer.net'].getPostsData()
      await sleep(30 * 60 * 1000)
    }
  })()
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
