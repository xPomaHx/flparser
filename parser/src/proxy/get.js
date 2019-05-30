const puppeteer = require('puppeteer')
const { sleep } = require('./../helpers.js')
const fs = require('fs')

function runcmd(strComand, arg) {
  return new Promise((resolve, reject) => {
    const spawn = require('child_process').spawn
    const ls = spawn(strComand, arg)
    let outData = []

    ls.stdout.on('data', function(data) {
      outData.push(data.toString())
      // console.dir('stdout: ' + data.toString())
    })

    ls.stderr.on('data', function(data) {
      outData.push(data.toString())
      // console.dir('stderr: ' + data.toString())
    })

    ls.on('exit', function(code) {
      resolve(outData)
    })
  })
}

async function getPage(url, proxy) {
  let sproxy = {
    protocol: 'SOCKS5',
    ip: proxy[0],
    port: proxy[1]
  }
  var args = []
  args.push(
    '--proxy-server=' + sproxy.protocol + '://' + sproxy.ip + ':' + sproxy.port
  )
  console.dir('startBrowser')
  var browser = await puppeteer.launch({
    args: args
  })
  var page = await browser.newPage()
  await page.setUserAgent(
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.84 Safari/537.36'
  )
  await page.setViewport({
    width: 1920,
    height: 1920
  })

  let html = ''
  try {
    await page.goto(url, {
      waitUntil: 'networkidle0'
    })
    if ((await page.$('.cf-browser-verification')) != null) {
      await sleep(5555)
      await page.goto(url, {
        waitUntil: 'networkidle0'
      })
    }
    html = await page.evaluate(() => document.body.innerHTML)
  } catch (er) {
    // console.dir(er)
  } finally {
    await sleep(111)
    await browser.close().catch(function() {
      console.dir(arguments)
    })
    await sleep(111)
  }
  return html
}

const dockerContainerName = 'proxygraberfind'
/* module.exports = */

runcmd(`docker`, [`build`, `-t`, dockerContainerName, `.`])
  .then(() => {
    return runcmd(`docker`, [`run`, dockerContainerName])
  })
  .then(data => {
    function getAllRegexp(str) {
      var regprox = /([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3})[^0-9]{1,100}?([0-9]{2,5})/gs
      var rez = []
      var m
      do {
        m = regprox.exec(str)
        if (m && m[1] && m[2]) {
          rez.push([m[1], m[2]])
        }
      } while (m !== null)
      return rez
    }
    let proxyList = getAllRegexp(data)
    return (async () => {
      for (let proxy of proxyList) {
        getPage('https://www.fl.ru/projects/?page=1', proxy).then(html => {
          fs.writeFile(proxy[0] + proxy[1], html)
        })
      }
    })()
  })
