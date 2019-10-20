const axiosClient = require('@root/common/axiosClient')
const Cookies = require('@root/common/cookies.js')

const querystring = require('query-string')
const cheerio = require('cheerio')

const configApp = require('@root/config')
const { sleep } = require('@root/common/helpers')
const Post = require('@root/models/Post.js')

const config = {
  name: 'www.weblancer.net',
  get baseUrl() {
    return `https://${this.name}`
  },
  catUrl: 'jobs/?page=',
  catListSel: '.page_content .cols_table .row',
  catLink: 'h2.title a',
  title: '.page_header_content h1',
  amount: '.page_header_content .amount',
  contentHtml1: '.page_content .cols_table .row .text_field',
  contentText1: '.page_header_content>div>div a',
  contentHtml2: '.noNeed',
  contentText2: '.noNeed',
  credentials: {
    login: '99designs_com',
    password: '^@ZufLzCm@kBWsl!'
  }
}

const cookies = new Cookies(config.name)
cookies.fetch = async () => {
  const loginUrl = `${config.baseUrl}/account/login/`
  const httpResponse = await axiosClient.post(
    loginUrl,
    querystring.stringify({
      ...config.credentials,
      store_login: 1
    }),
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    }
  )
  let cookies
  if (httpResponse.data.error) {
    cookies = null
    console.dir(httpResponse.data)
    return
  } else {
    cookies = httpResponse.headers['set-cookie']
  }
  return cookies
}
module.exports = {
  isLogin(html = this._html) {
    return html.indexOf(config.credentials.login) !== -1
  },
  async fetchPage(url = this._url) {
    let { data, headers } = await axiosClient.get(url, {
      responseType: 'arraybuffer',
      responseEncoding: 'binary',
      headers: {
        Cookie: await cookies.get()
      }
    })
    if (headers) {
      let charset = headers['content-type']
        .split(';')[1]
        .replace('charset=', '')

      const iconv = require('iconv-lite')
      data = iconv.decode(data, charset)
    }
    this._html = data
    return data
  },
  async getPage(url) {
    this._url = url
    await this.fetchPage()
    if (this.isLogin()) return this._html
    cookies.delete()
    return this.fetchPage()
  },
  parse(html = this._html) {
    let $ = cheerio.load(html.replace(/&nbsp;/g, ' '), {
      decodeEntities: false
    })
    let data = {}
    data.title = ($(config.title).text() || '').trim()
    data.amount = ($(config.amount).text() || '').trim()
    data.content =
      ($(config.contentHtml1).html() || '').trim() +
      '\n' +
      ($(config.contentText1).text() || '').trim() +
      '\n' +
      ($(config.contentHtml2).html() || '').trim() +
      '\n' +
      ($(config.contentText2).text() || '').trim()
    return data
  },
  parseCat(html) {
    let $ = cheerio.load(html, { decodeEntities: false })
    let projectslist = $(config.catListSel)
    let links = {}
    for (let i = 0; i < projectslist.length; i++) {
      let proj = projectslist[i]
      let url = $(proj)
        .find(config.catLink)
        .attr('href')
      links[config.baseUrl + url] = true
    }
    return links
  },
  genNextCatUrl: function*() {
    let numPage = 1
    let { maxNumberCatPage = 10 } = configApp
    while (maxNumberCatPage--) {
      console.dir(maxNumberCatPage)
      yield `${config.baseUrl}/${config.catUrl}${numPage}`
      numPage++
    }
  },
  async getActualCatLinks() {
    const { catalogPageMatchBreak = 3 } = configApp
    let catalogPageMatchBreakCurrent = 0
    for await (let url of this.genNextCatUrl()) {
      let links = await this.getPage(url).then(this.parseCat)
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
      const { timeBetweenCatDown = 5555 } = configApp
      await sleep(timeBetweenCatDown)
    }
  },
  getMetaData(html = this._html) {
    let model = {}
    try {
      const replaceAll = function(target, search, replacement) {
        return target.replace(new RegExp(search, 'g'), replacement)
      }
      let txt = html
      txt = replaceAll(txt, '&#8211', '')
      txt = replaceAll(txt, '&nbsp', '')
      txt = replaceAll(txt, '&quot', '')
      txt = replaceAll(txt, '<br>', ' ')

      txt = txt.toLowerCase()
      let reg = {
        telegram: /(telegram|телеграмм|телеграм|t\.me)+.{0,20}[a-z0-9]{2,}/gm,
        vk: /vk\.com[^\s]+/gm,
        email: /[^\s]{2,}@[^\s]{2,}\.[a-z\d]{2,}/gm,
        skype: /(skype|скайп|скайпе|скайпу)+.{0,20}([a-z0-9\.^:=]{3,})/gm
      }
      for (let regt in reg) {
        let rezreg = txt.match(reg[regt])
        if (rezreg) {
          model[regt] = rezreg[0].replace(
            /whatsapp|email|slack|telegram|skype|viber|[,\s\n]*|facebook/gm,
            ''
          )
          if (!model[regt]) model[regt] = null
        }
      }
    } catch (er) {
      console.dir(model.title)
      console.dir(er)
    }
    return model
  },
  async reScan() {
    let posts = await Post.find({ content: { $ne: null } })
    for (let post of posts) {
      let meta = this.getMetaData(post.content)
      post.telegram = null
      post.vk = null
      post.email = null
      post.skype = null
      Object.assign(post, meta)
      await post.save()
    }
  },
  async getPostsData() {
    let posts = await Post.find(
      { title: { $exists: false }, url: /.*weblancer.*/i },
      { url: 1 },
      { limit: 0 }
    ).exec()
    let count = posts.length
    for (let post of posts) {
      console.dir(post.url)
      console.time('DownTime')
      await this.getPage(post.url)
      let data = this.parse()
      let meta = this.getMetaData(data.content)
      Object.assign(post, data, meta)
      await post.save()
      let { timeBetweenPostDown = 5555 } = configApp
      console.timeEnd('DownTime')
      await sleep(timeBetweenPostDown)
      if (post.title) {
        console.dir(post.title)
      }
      console.dir(count--)
    }
  }
}
