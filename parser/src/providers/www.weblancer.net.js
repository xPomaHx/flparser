const { getCatalogUrlByPage, getDataFromProjectPage } = require('../base')
const axiosClient = require('@root/axiosClient')
const Cookies = require('@root/common/cookies.js')

const fs = require('fs')
const path = require('path')
const { promisify } = require('util')
const unlink = promisify(fs.unlink)
const querystring = require('query-string')

const filename = `${this.name}cookies.txt`
const pathCookiesFile = path.resolve('@root/../mocksData/' + filename)

const config = {
  name: 'www.weblancer.net',
  get baseUrl() {
    return `https://${this.name}`
  },
  catUrl: 'jobs/?page=',
  catListSel: '.page_content .cols_table .row',
  catLink: 'h2.title a',
  title: '.page_header_content',
  amount: '.page_header_content .amount',
  contentHtml1: '.page_content .cols_table .row .text_field',
  contentText1: '.page_header_content>div>div a',
  contentHtml2: '.noNeed',
  contentText2: '.noNeed',
  getDataFromProjectPage,
  getCatalogUrlByPage,
  httpRequest: {
    async get() {
      if (!arguments.headers) arguments.headers = {}
      arguments.headers.Cookie = await config.cookies
      const reqResult = await axiosClient.get.apply(null, arguments)
      if (reqResult.data.indexOf('99designs_com') === -1) {
        await unlink(pathCookiesFile).catch(_ => null)
        arguments.headers.Cookie = await config.cookies
        return axiosClient.get.apply(null, arguments)
      } else {
        return reqResult
      }
    },
    async post() {
      return axiosClient.post(arguments)
    }
  }
}

const cookies = new Cookies(config.name)
cookies.fetch = async () => {
  const loginUrl = `${config.baseUrl}/account/login/`
  const httpResponse = await axiosClient.post(
    loginUrl,
    querystring.stringify({
      login: '99designs_com',
      password: '^@ZufLzCm@kBWsl!',
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
  this._cookies = cookies
  return cookies
}
module.exports = root
