const winston = require('winston')
const authorisedRequest = require('../lib/authorisedrequest')
const config = require('../config')

function getMetadata (path, key) {
  const url = `${config.apiRoot}/metadata/${path}/`

  return new Promise((resolve, reject) => {
    authorisedRequest(null, url)
      .then((responseData) => {
        module.exports[key] = responseData
        resolve(responseData)
      })
      .catch((reponseError) => {
        winston.log('error', 'Error fetching metadataRepository for url: %s', url)
        reject(reponseError)
        throw reponseError
      })
  })
}

const metadataItems = [
  ['sector', 'SECTOR_OPTIONS'],
  ['turnoverrange', 'TURNOVER_OPTIONS'],
  ['region', 'REGION_OPTIONS'],
  ['country', 'COUNTRYS'],
  ['employeerange', 'EMPLOYEE_OPTIONS']
]

module.exports.getAdvisors = function (token) {
  return authorisedRequest(token, `${config.apiRoot}/metadata/advisor/`)
}

module.exports.fetchAll = (cb) => {
  // todo
  // refactor to create an array of jobs to do and then use promise all
  // before returning back via a promise.

  let caughtErrors
  let totalRequests = 0
  let completeRequests = 0

  function checkResults () {
    completeRequests += 1
    if (completeRequests === totalRequests) {
      winston.log('debug', 'All metadataRepository requests complete')
      cb(caughtErrors)
    }
  }

  for (const item of metadataItems) {
    totalRequests += 1
    getMetadata(item[0], item[1])
      .then((data) => {
        if (item[2]) {
          item[2](data)
        }

        checkResults()
      })
      .catch((err) => {
        caughtErrors = caughtErrors || []
        caughtErrors.push(err)
        checkResults()
      })
  }
}

module.exports.REASONS_FOR_ARCHIVE = [
  'Company is dissolved',
  'Other'
]
