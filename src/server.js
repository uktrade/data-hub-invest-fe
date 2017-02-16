const config = require('./config')
const express = require('express')
const bodyParser = require('body-parser')
const compression = require('compression')
const logger = require('morgan')
const session = require('express-session')
const flash = require('connect-flash')
const winston = require('winston')
const expressValidator = require('express-validator')
const nunjucks = require('nunjucks')
const companyController = require('./controllers/companycontroller')
const investmentController = require('./controllers/investmentcontroller')
const searchController = require('./controllers/searchcontroller')
const apiController = require('./controllers/apicontroller')
const myAccountController = require('./controllers/myaccountcontroller')
const indexController = require('./controllers/indexcontroller')
const companyAddController = require('./controllers/companyaddcontroller')
const companyInvestmentSummaryController = require('./controllers/companyinvestmentsummarycontroller')

const filters = require('@uktrade/trade_elements/dist/nunjucks/filters')
const datahubFlash = require('./middleware/flash')
const user = require('./middleware/user')
const locals = require('./middleware/locals')
const forceHttps = require('./middleware/forcehttps')
const headers = require('./middleware/headers')
const metadata = require('./repositorys/metadatarepository')

const app = express()
app.disable('x-powered-by')
const isDev = app.get('env') === 'development'
winston.level = config.logLevel

var sess = {
  secret: 'keyboard cat',
  cookie: {}
}
app.use(session(sess))

app.use(bodyParser.urlencoded({ extended: true, limit: '1mb' }))
app.use(bodyParser.json({ limit: '1mb' }))
app.use(expressValidator())

app.use(compression())

filters.stringify = JSON.stringify

app.set('view engine', 'html')
const nunenv = nunjucks.configure([`${__dirname}/views`, `${__dirname}/../node_modules/@uktrade/trade_elements/dist/nunjucks`], {
  autoescape: true,
  express: app,
  watch: isDev
})

Object.keys(filters).forEach((filterName) => {
  nunenv.addFilter(filterName, filters[filterName])
})

// Static files
app.use('/javascripts', express.static(`${__dirname}/../build/javascripts`))
app.use('/css', express.static(`${__dirname}/../build/css`))
app.use(express.static(`${__dirname}/../src/public`))

app.use('/images', express.static(`${__dirname}/../node_modules/@uktrade/trade_elements/dist/images`))
app.use('/css', express.static(`${__dirname}/../node_modules/@uktrade/trade_elements/dist/css`))
app.use('/javascripts', express.static(`${__dirname}/../node_modules/@uktrade/trade_elements/dist/javascripts`))

app.use('/fonts', express.static(`${__dirname}/../node_modules/font-awesome/fonts`))

app.use(logger((isDev ? 'dev' : 'combined')))

app.use(forceHttps)
app.use(flash())
app.use(locals)
app.use(datahubFlash)
app.use(user)
app.use(headers)

app.use('/myaccount', myAccountController.router)
app.use(companyController.router)
app.use(companyInvestmentSummaryController.router)
app.use(companyAddController.router)
app.use(investmentController.router)
app.use(companyInvestmentSummaryController.router)

app.use('/search', searchController.router)
app.use(apiController.router)
app.get('/', indexController)

metadata.fetchAll((errors) => {
  if (errors) {
    winston.log('error', 'Unable to load all metadataRepository, cannot start app')

    for (const err of errors) {
      throw err
    }
  } else {
    app.listen(config.port, () => {
      winston.log('info', 'app listening on port %s', config.port)
    })
  }
})
