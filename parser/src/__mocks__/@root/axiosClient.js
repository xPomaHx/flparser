const axiosClient = require('@root/axiosClient')

const origunalGet = axiosClient.get
const fs = require('fs')
const path = require('path')
const { promisify } = require('util')
const readFile = promisify(fs.readFile)
const writeFile = promisify(fs.writeFile)

axiosClient.get = jest.fn(async (url, param) => {
  const filename = url.replace(/[^a-z0-9]+/gim, '_') + `.html`
  const pathFile = path.resolve('@root/../mocksData/' + filename)
  const data = await readFile(pathFile, 'utf8').catch(() => null)
  if (data) {
    return { data }
  } else {
    const { data: httpData } = await origunalGet(url, param)
    await writeFile(pathFile, httpData)
    return { data: httpData }
  }
})
module.exports = axiosClient
