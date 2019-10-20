const { sleep } = require('@root/common/helpers')
const config = require('@root/config')
const Post = require('@root/models/Post.js')
const providers = require('@root/providers')

module.exports = async function() {
  let posts = await Post.find(
    { title: { $exists: false }, url: /.*weblancer.*/i },
    { url: 1 },
    { limit: 0 }
  ).exec()
  let count = posts.length
  for (let post of posts) {
    console.dir(post.url)
    console.time('DownTime')
    post.src = new URL(post.url).hostname
    await providers[post.src].getDataFromProjectPage(post)
    post.getMetaData()
    return post
    await post.save()
    let { timeBetweenPostDown = 5555 } = config
    await sleep(timeBetweenPostDown)
    if (post.title) {
      console.dir(post.title)
    }
    console.timeEnd('DownTime')
    console.dir(count--)
  }
}
