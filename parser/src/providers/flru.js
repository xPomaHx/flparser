const axiosClient = require('@root/axiosClient')
const cheerio = require('cheerio')

const config = require('@root/config')

module.exports = {
  async getDataFromProjectPage(model) {
    try {
      let url = model.url
      model.src = new URL(url).hostname
      let html = (await axiosClient.get(url)).data

      let $ = cheerio.load(html, { decodeEntities: false })

      model.title = ($('.b-page__title').text() || '').trim()
      model.amount = (
        $('.b-layout__txt_fontsize_18>.b-layout__bold').text() || ''
      ).trim()
      model.content =
        ($("[id^='projectp']").html() || '').trim() +
        '\n' +
        ($("[id^='project_info']>div>div:nth-child(3)").text() || '').trim() +
        '\n' +
        (
          $(
            '.contest-project-view > .contest-body > div:nth-child(1)'
          ).html() || ''
        ).trim() +
        '\n' +
        (
          $(
            '.contest-project-view > .contest-body > div:nth-child(3) '
          ).text() || ''
        ).trim()
      model.date = Date.now()
    } catch (er) {
      model.title = er.message
    }
  },
  async getCatalogUrlByPage(numPage) {
    let url = `https://www.fl.ru/projects/?page=${numPage}`
    console.dir('download: ' + url)
    let html = (await axiosClient.get(url)).data
    let $ = cheerio.load(html, { decodeEntities: false })
    let projectslist = $('#projects-list .b-post')
    let links = {}
    for (let i = 0; i < projectslist.length; i++) {
      let proj = projectslist[i]
      const { ingoneDonatPost = false } = config
      if (!($(proj).hasClass('topprjpay') && ingoneDonatPost)) {
        let url = $(proj)
          .find('.b-post__link')
          .attr('href')
        links['https://www.fl.ru' + url] = true
      }
    }
    return links
  }
}
