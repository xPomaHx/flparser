'use strict'

const axiosClient = jest.requireMock('@root/axiosClient')

const providers = require('@root/providers')
describe('getDataFromProjectPage', function() {
  describe('www.fl.ru', function() {
    test('data from html extract usial 1 ', async () => {
      let model = {}
      model.url =
        'https://www.fl.ru/projects/4058676/integratsiya-formyi-na-sayte-s-bitriks24.html'
      await providers['www.fl.ru'].getDataFromProjectPage(model)
      expect(model.title).toContain('Интеграция формы на сайте с Битрикс24')
      expect(model.amount).toBe('2000 ₽')
      expect(model.content).toContain('Веб-программирование')
      expect(model.content).toContain('Битрикс24 по api')
      expect(model.content).toContain('Требуется интеграция')
    })
    test('data from html extract usial 2 ', async () => {
      let model = {}
      model.url =
        'https://www.fl.ru/projects/4058903/trebuetsya-otrisovka-shemyi-stroeniya-po-shablonu.html'
      await providers['www.fl.ru'].getDataFromProjectPage(model)
      expect(model.title).toContain(
        'Требуется отрисовка схемы строения по шаблону'
      )
      expect(model.amount).toBe('500 ₽')
      expect(model.content).toContain('презентабельный')
      expect(model.content).toContain('Промышленный дизайн')
      expect(model.content).toContain('остальным вопросам')
    })
    test('data from html extract concurs 1 ', async () => {
      let model = {}
      model.url =
        'https://www.fl.ru/projects/2658763/konkurs-na-sozdanie-stikerov-dlya-telegram.html'
      await providers['www.fl.ru'].getDataFromProjectPage(model)
      expect(model.title).toContain('Конкурс на создание стикеров для Telegram')
      expect(model.amount).toBe('25 000 $')
      expect(model.content).toContain('Telegram проводит конкурс')
      expect(model.content).toContain('эмоции emoji')
    })
  })
})
describe('login', function() {
  describe('weblancer.net', function() {
    test('send http post and get cookie', async () => {
      const Cookies = require('@root/common/cookies.js')
      const providersCookies = new Cookies('www.weblancer.net')
      let cookieJSON = await providersCookies.get()
      expect(JSON.stringify(cookieJSON)).toContain('99designs_com')
    })
  })
})
