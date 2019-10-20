const config = require('@root/config')
const { sleep } = require('@root/common/helpers')
const Post = require('@root/models/Post.js')

const GeneratorGetCatalogUrl = async function*(provider) {
  let numPage = 1
  let { maxNumberCatPage = 10 } = config
  while (maxNumberCatPage--) {
    yield await provider.getCatalogUrlByPage(numPage)
    numPage++
  }
}

const getActualCatLinks = async provider => {
  const getCatalogUrl = GeneratorGetCatalogUrl(provider)
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

module.exports = async function() {
  const providers = require('@root/providers')
  const promiseAr = Object.values(providers).map(p => getActualCatLinks(p))
  await Promise.all(promiseAr)
}
