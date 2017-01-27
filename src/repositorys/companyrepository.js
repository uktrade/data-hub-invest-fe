const config = require('../config')
const authorisedRequest = require('../lib/authorisedrequest')
const interactionRepository = require('./interactionrepository')
const contactRepository = require('./contactrepository')
const metadataRepository = require('./metadatarepository')

const relatedProperties = {
  'sector': 'SECTOR_OPTIONS',
  'turnover_range': 'TURNOVER_OPTIONS',
  'uk_region': 'REGION_OPTIONS',
  'employee_range': 'EMPLOYEE_OPTIONS',
  'business_type': 'TYPES_OF_BUSINESS',
  'registered_address_country': 'COUNTRYS',
  'trading_address_countrt': 'COUNTRYS'
}

// Get a company and then go back and get further detail for each company contact
// and interaction, so the company detail pages can give the detail required.
function getDitCompany (token, id) {
  let result

  return authorisedRequest(token, `${config.apiRoot}/company/${id}/`)
  .then((company) => {
    result = company
    result.interactions = []
    result.contacts = []

    const promises = []
    for (const interaction of result.interactions) {
      promises.push(interactionRepository.getInteraction(token, interaction.id))
    }

    return Promise.all(promises)
  })
  .then((interactions) => {
    result.interactions = interactions

    const promises = []
    for (const contact of result.contacts) {
      promises.push(contactRepository.getBriefContact(token, contact.id))
    }

    return Promise.all(promises)
  })
  .then((contacts) => {
    result.contacts = contacts
    return result
  })
}

function getCHCompany (token, id) {
  return authorisedRequest(token, `${config.apiRoot}/ch-company/${id}/`)
}

function addRelatedCHCompany (token, company) {
  return new Promise((resolve) => {
    getCHCompany(token, company.company_number)
      .then((companies_house_data) => {
        company.companies_house_data = companies_house_data
        resolve(company)
      })
  })
}

function getCompany (token, id, source) {
  return new Promise((resolve, reject) => {
    // Get DIT Company
    if (source === 'company_companieshousecompany') {
      getCHCompany(token, id)
        .then((companies_house_data) => {
          resolve({
            company_number: id,
            companies_house_data,
            contacts: [],
            interactions: []
          })
        })
        .catch((error) => {
          reject(error)
        })

      return
    }

    getDitCompany(token, id)
      .then((company) => {
        return addRelatedData(company)
      })
      .then((company) => {
        if (company.company_number && company.company_number.length > 0) {
          return addRelatedCHCompany(token, company)
        }
        return company
      })
      .then((company) => {
        resolve(company)
      })
      .catch((error) => {
        reject(error)
      })
  })
}

function addRelatedData (company) {
  return new Promise((resolve, reject) => {
    const relatedKeys = Object.keys(relatedProperties)

    for (const property of relatedKeys) {
      if (company[property] && company[property].length > 0) {
        const metadataKey = relatedProperties[property]
        const values = metadataRepository[metadataKey]
        company[property] = values.filter(item => item.id === company[property])[0]
      }
    }

    getParentsAndChildren(company)
      .then(() => {
        return authorisedRequest(null, `${config.apiRoot}/company/${company.id}/contacts/`)
      })
      .then((contacts) => {
        company.contacts = contacts

        if (!company.account_manager || company.account_manager.length === 0) {
          resolve(company)
        } else {
          return authorisedRequest(null, `${config.apiRoot}/metadata/advisor/${company.account_manager}/`)
        }
      })
      .then((accountManager) => {
        company.account_manager = accountManager
        return authorisedRequest(null, `${config.apiRoot}/company/${company.id}/investmentprojects/`)
      })
      .then((investmentProjects) => {
        company.investmentProjects = investmentProjects
        resolve(company)
      })
  })
}

function getParentsAndChildren (company) {
  const promises = []
  company.parents = []
  company.children = []

  return authorisedRequest(null, `${config.apiRoot}/company/${company.id}/related/`)
    .then((related) => {
      for (const id of related.parents) {
        promises.push(authorisedRequest(null, `${config.apiRoot}/company/${id}/`)
          .then((parentCompany) => {
            return company.parents.push(parentCompany)
          }))
      }
      for (const id of related.children) {
        promises.push(authorisedRequest(null, `${config.apiRoot}/company/${id}/`)
          .then((childCompany) => {
            return company.children.push(childCompany)
          }))
      }
      return Promise.all(promises)
    })
}

function setCHDefaults (token, company) {
  return new Promise((resolve) => {
    if (company.company_number) {
      getCHCompany(token, company.company_number)
        .then((ch) => {
          if (!company.name) company.name = ch.name
          if (!company.registered_address_1) company.registered_address_1 = ch.registered_address_1
          if (!company.registered_address_2) company.registered_address_2 = ch.registered_address_2
          if (!company.registered_address_town) company.registered_address_town = ch.registered_address_town
          if (!company.registered_address_county) company.registered_address_county = ch.registered_address_county
          if (!company.registered_address_postcode) company.registered_address_postcode = ch.registered_address_postcode
          if (!company.registered_address_country) company.registered_address_country = ch.registered_address_country.id

          company.uk_based = true

          // Business type
          const businessTypes = metadataRepository.TYPES_OF_BUSINESS
          for (const businessType of businessTypes) {
            if (businessType.name.toLowerCase() === ch.company_category.toLowerCase()) {
              company.business_type = businessType.id
            }
          }
          resolve(company)
        })
    } else {
      resolve(company)
    }
  })
}

function saveCompany (token, company) {
  function saveParsedCompany (parsedCompany) {
    let method
    let url

    if (parsedCompany.id && parsedCompany.id.length > 0) {
      method = 'PUT'
      url = `${config.apiRoot}/company/${parsedCompany.id}/`
    } else {
      method = 'POST'
      url = `${config.apiRoot}/company/`
    }

    return new Promise((resolve, reject) => {
      authorisedRequest(token, { url, method, body: parsedCompany })
        .then((data) => {
          resolve(data)
        })
        .catch((error) => {
          if (typeof error.error === 'string') {
            return reject({
              statusCode: error.response.statusCode,
              errors: { detail: error.response.statusMessage }
            })
          }

          return reject({
            statusCode: error.response.statusCode,
            errors: error.error
          })
        })
    })
  }

  delete company.companies_house_data
  delete company.contacts
  delete company.interactions

  if (company.id && company.id.length > 0) {
    return saveParsedCompany(company)
  }

  return setCHDefaults(token, company)
    .then(parsedCompany => saveParsedCompany(parsedCompany))
}

function archiveCompany (token, companyId, reason) {
  const options = {
    body: { reason },
    url: `${config.apiRoot}/company/${companyId}/archive/`,
    method: 'POST'
  }
  return authorisedRequest(token, options)
}

function unarchiveCompany (token, companyId) {
  return authorisedRequest(token, `${config.apiRoot}/company/${companyId}/unarchive/`)
}

module.exports = { getCompany, saveCompany, getDitCompany, getCHCompany, archiveCompany, unarchiveCompany }
