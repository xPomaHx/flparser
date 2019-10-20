module.exports = {
  randomIntFromInterval(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min)
  },
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}
