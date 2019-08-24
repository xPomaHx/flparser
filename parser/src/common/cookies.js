const { promisify } = require('util')
const fs = require('fs')
const writeFile = promisify(fs.writeFile)
const readFile = promisify(fs.readFile)
const unlink = promisify(fs.unlink)
const path = require('path')
const axiosClient = require('@root/axiosClient')
const querystring = require('query-string')

module.exports = class {
  constructor(name) {
    this.name = name
  }
  get pathCookiesFile() {
    return path.resolve('@root/../mocksData/' + this.filename)
  }
  get filename() {
    return `${this.name}cookies.txt`
  }
  get baseUrl() {
    return `https://${this.name}`
  }
  async get() {
    await this.read()
    if (this._cookies) return this._cookies
    console.dir('notread')
    await this.fetch()
    await this.save()
    return this._cookies
  }
  async read(cookiesJson) {
    const cookiesTxt = await readFile(this.pathCookiesFile, 'utf8').catch(
      _ => null
    )
    if (cookiesTxt) {
      let cookiesJson = JSON.parse(cookiesTxt)
      this._cookies = cookiesJson
      return cookiesJson
    }
  }
  async save(cookiesJson = this._cookies) {
    await writeFile(this.pathCookiesFile, JSON.stringify(cookiesJson)).catch(
      _ => null
    )
  }
  async fetch() {
    console.dir('notSET')
    throw new Error('not set fetch function on coockee geter')
  }
  async delete() {
    delete this._cookies
    await unlink(this.pathCookiesFile).catch(_ => null)
  }
}
