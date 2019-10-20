const axiosClient = require('@root/common/axiosClient')

const origunalGet = axiosClient.get
const fs = require('fs')
const path = require('path')
const { promisify } = require('util')
const readFile = promisify(fs.readFile)
const writeFile = promisify(fs.writeFile)
const BJSON = require('buffer-json')

axiosClient.get = jest.fn(async function(url, param) {
  const filename = url.replace(/[^a-z0-9]+/gim, '_') + `.html`
  const pathFile = path.resolve('@root/../mocksData/' + filename)
  const data = await readFile(pathFile).catch(() => null)
  if (data) {
    return BJSON.parse(data)
  } else {
    const response = await origunalGet.apply(null, arguments)
    await writeFile(
      pathFile,
      BJSON.stringify({ data: response.data, headers: response.headers })
    )
    return response
  }
})
module.exports = axiosClient
