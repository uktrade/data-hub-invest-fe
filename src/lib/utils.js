const copyObj = function (obj) {
  return JSON.parse(JSON.stringify((obj)))
}

module.exports = { copyObj }
