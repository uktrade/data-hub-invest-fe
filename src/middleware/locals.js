const winston = require('winston')
const pjson = require('../../package.json')
const reactVersion = require('../../node_modules/react/package.json').version
const config = require('../config')

const startTime = new Date().getTime()

module.exports = function locals (req, res, next) {
  winston.debug('locals:start')
  res.locals.baseUrl = req.baseUrl
  res.locals.releaseVersion = pjson.version
  res.locals.startTime = startTime
  res.locals.asset_path = '/'
  res.locals.referer = req.headers.referer
  res.locals.env = config.env
  res.locals.reactVersion = reactVersion
  res.locals.googleTagManager = config.googleTagManager
  winston.debug('locals:end')
  next()
}
