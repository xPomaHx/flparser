let providers = {}
;['www.weblancer.net', 'www.fl.ru'].forEach(n => {
  providers[n] = require(`./${n}`)
})
module.exports = providers
