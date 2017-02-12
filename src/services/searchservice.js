const authorisedRequest = require('../lib/authorisedrequest')
const config = require('../config')
const includes = require('lodash/includes')
const winston = require('winston')

function search ({ token, term, limit = 10, page = 1, filters, nonuk = false}) {
  let body = { term, limit }
  body.offset = (page * body.limit) - body.limit

  let endpoint = 'search'

  if (nonuk) {
    endpoint = 'nonuk'
  }

  if (filters) {
    body = Object.assign(body, filters)
  }

  // Filters for company actually means filtering for 2 company types
  // so we modify the criteria sent to the server.
  if (body.doc_type && body.doc_type === 'company') {
    body.doc_type = ['company_company', 'company_companieshousecompany']
  } else if (body.doc_type && Array.isArray(body.doc_type) && includes(body.doc_type, 'company')) {
    let newDocTypeArray = body.doc_type.filter(item => item !== 'company')
    newDocTypeArray.push('company_company')
    newDocTypeArray.push('company_companieshousecompany')
    body.doc_type = newDocTypeArray
  }

  const options = {
    url: `${config.apiRoot}/${endpoint}?term=${term}`,
    method: 'GET'
  }

  return authorisedRequest(token, options)
    .then(result => {
      result.term = term
      result.page = page
      return result
    })
}

function searchCH (token, term) {
  const options = {
    url: `${config.apiRoot}/ch?term=${term}`,
    method: 'GET'
  }

  return authorisedRequest(token, options)
    .then(result => {
      result.term = term
      return result
    })
}

function searchLimited (token, term) {
  const options = {
    url: `${config.apiRoot}/limited?term=${term}`,
    method: 'GET'
  }

  return authorisedRequest(token, options)
    .then(result => {
      result.term = term
      return result
    })
}

function suggestCompany (token, term, types) {
  if (!types) {
    types = ['company_company']
  }
  const options = {
    url: `${config.apiRoot}/search/`,
    body: {
      term,
      doc_type: types,
      limit: 10,
      offset: 0
    },
    method: 'POST'
  }

  return authorisedRequest(token, options)
    .then((result) => {
      winston.debug('suggestion raw result', result)
      return result.hits
        .map((hit) => ({
          name: hit._source.name,
          id: hit._id,
          _type: hit._type
        }))
    })
    .catch((error) => {
      winston.error('Error calling auth reguest for suggestions', error)
    })
}

module.exports = { search, suggestCompany, searchCH, searchLimited }
