const axiosClient = require('@root/common/axiosClient')
const cheerio = require('cheerio')

module.exports = (function() {
  return {
    async getDataFromProjectPage(model) {
      try {
        let url = model.url
        let html = (await axiosClient.get(url, {
          encoding: 'binary'
        })).data
        html = html.replace(/&nbsp;/g, ' ')
        let $ = cheerio.load(html, { decodeEntities: false })
        model.html = html
        model.title = ($(this.title).text() || '').trim()
        model.amount = ($(this.amount).text() || '').trim()
        model.content =
          ($(this.contentHtml1).html() || '').trim() +
          '\n' +
          ($(this.contentText1).text() || '').trim() +
          '\n' +
          ($(this.contentHtml2).html() || '').trim() +
          '\n' +
          ($(this.contentText2).text() || '').trim()
        model.date = Date.now()
      } catch (er) {
        console.dir(er)
        model.title = er.message
      }
    },
    async getCatalogUrlByPage(numPage) {
      let url = `${this.baseUrl}/${this.catUrl}${numPage}`
      console.dir('download: ' + url)
      let html = (await axiosClient.get(url)).data
      let $ = cheerio.load(html, { decodeEntities: false })
      let projectslist = $(this.catListSel)
      let links = {}
      for (let i = 0; i < projectslist.length; i++) {
        let proj = projectslist[i]
        let url = $(proj)
          .find(this.catLink)
          .attr('href')
        links[this.baseUrl + url] = true
      }
      return links
    },
    getMetaData(model) {
      try {
        const replaceAll = function(target, search, replacement) {
          return target.replace(new RegExp(search, 'g'), replacement)
        }
        let txt = model.content
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
            model[regt] = m[2] || null
          }
        }
      } catch (er) {
        console.dir(model.title)
        console.dir(er)
      }
    }
  }
})()
