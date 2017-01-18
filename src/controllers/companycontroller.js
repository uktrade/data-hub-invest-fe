/* eslint new-cap: 0 */
const express = require('express')
const winston = require('winston')
const controllerUtils = require('../lib/controllerutils')
const companyRepository = require('../repositorys/companyrepository')
const itemCollectionService = require('../services/itemcollectionservice')

const router = express.Router()
const companyDetailLabels = {
  registered_address: 'Registered address',
  business_type: 'Company type',
  sector: 'Sector',
  alias: 'Trading name',
  trading_address: 'Trading address',
  website: 'Website',
  description: 'Business description',
  employee_range: 'Number of employees',
  turnover_range: 'Annual turnover',
  uk_region: 'Region',
  account_manager: 'Account manager',
  export_to_countries: 'Is the company currently exporting to a market?',
  future_interest_countries: 'Future countries of interest'
}
const chDetailLabels = {
  company_number: 'Company number',
  registered_address: 'Registered office address',
  business_type: 'Company type',
  company_status: 'Company status',
  sic_code: 'Nature of business (SIC)'
}

const companyDetailsDisplayOrder = Object.keys(companyDetailLabels)
const chDetailsDisplayOrder = Object.keys(chDetailLabels)

function cleanErrors (errors) {
  if (errors.registered_address_1 || errors.registered_address_2 ||
    errors.registered_address_town || errors.registered_address_county ||
    errors.registered_address_postcode || errors.registered_address_country) {
    errors.registered_address = ['Invalid address']
    delete errors.registered_address_1
    delete errors.registered_address_2
    delete errors.registered_address_town
    delete errors.registered_address_county
    delete errors.registered_address_postcode
    delete errors.registered_address_country
  }

  if (errors.trading_address_1 || errors.trading_address_2 ||
    errors.trading_address_town || errors.trading_address_county ||
    errors.trading_address_postcode || errors.trading_address_country) {
    errors.trading_address = ['Invalid address']
    delete errors.trading_address_1
    delete errors.trading_address_2
    delete errors.trading_address_town
    delete errors.trading_address_county
    delete errors.trading_address_postcode
    delete errors.trading_address_country
  }
}

function getDisplayCH (company) {
  if (!company.companies_house_data) return null

  const companyHouseData = company.companies_house_data

  const displayCH = {
    company_number: companyHouseData.company_number,
    business_type: companyHouseData.company_category,
    company_status: companyHouseData.company_status
  }

  let registeredAddress = ''
  if (companyHouseData.registered_address_1) registeredAddress += `${companyHouseData.registered_address_1}, `
  if (companyHouseData.registered_address_2) registeredAddress += `${companyHouseData.registered_address_2}, `
  if (companyHouseData.registered_address_town) registeredAddress += `${companyHouseData.registered_address_town}, `
  if (companyHouseData.registered_address_county) registeredAddress += `${companyHouseData.registered_address_county}, `
  if (companyHouseData.registered_address_postcode) registeredAddress += `${companyHouseData.registered_address_postcode}`

  if (registeredAddress.length > 0) {
    displayCH.registered_address = registeredAddress
  } else {
    displayCH.registered_address = ''
  }

  displayCH.sic_code = []
  if (companyHouseData.sic_code_1 && companyHouseData.sic_code_1.length > 0) displayCH.sic_code.push(companyHouseData.sic_code_1)
  if (companyHouseData.sic_code_2 && companyHouseData.sic_code_1.length > 0) displayCH.sic_code.push(companyHouseData.sic_code_2)
  if (companyHouseData.sic_code_3 && companyHouseData.sic_code_1.length > 0) displayCH.sic_code.push(companyHouseData.sic_code_3)
  if (companyHouseData.sic_code_4 && companyHouseData.sic_code_1.length > 0) displayCH.sic_code.push(companyHouseData.sic_code_4)

  return displayCH
}

function getDisplayCompany (company) {
  if (!company.id) return null

  const displayCompany = {
    sector: company.sector.name,
    alias: company.alias || '',
    description: company.description || '',
    website: company.website || '',
    employee_range: (company.employee_range && company.employee_range.name) ? company.employee_range.name : '',
    turnover_range: (company.turnover_range && company.turnover_range.name) ? company.turnover_range.name : '',
    account_manager: (company.account_manager && company.account_manager.name) ? company.account_manager.name : ''
  }

  let tradingAddress = ''
  if (company.trading_address_1) tradingAddress += `${company.trading_address_1}, `
  if (company.trading_address_2) tradingAddress += `${company.trading_address_2}, `
  if (company.trading_address_town) tradingAddress += `${company.trading_address_town}, `
  if (company.trading_address_county) tradingAddress += `${company.trading_address_county}, `
  if (company.trading_address_postcode) tradingAddress += `${company.trading_address_postcode}, `
  if (company.trading_address_country) tradingAddress += `${company.trading_address_country.name}`
  if (tradingAddress.length > 0) {
    displayCompany.trading_address = tradingAddress
  } else {
    displayCompany.trading_address = ''
  }

  if (!company.companies_house_data) {
    let registeredAddress = ''
    if (company.registered_address_1) registeredAddress += `${company.registered_address_1}, `
    if (company.registered_address_2) registeredAddress += `${company.registered_address_2}, `
    if (company.registered_address_town) registeredAddress += `${company.registered_address_town}, `
    if (company.registered_address_county) registeredAddress += `${company.registered_address_county}, `
    if (company.registered_address_postcode) registeredAddress += `${company.registered_address_postcode}, `
    if (company.registered_address_country) registeredAddress += `${company.registered_address_country.name}`

    if (registeredAddress.length > 0) {
      displayCompany.registered_address = registeredAddress
    } else {
      displayCompany.registered_address = ''
    }
    displayCompany.business_type = company.business_type.name
  }

  if (company.uk_region) displayCompany.uk_region = company.uk_region.name

  if (company.export_to_countries && company.export_to_countries.length > 0) {
    displayCompany.export_to_countries = company.export_to_countries.map(country => country.name).toString()
  } else {
    displayCompany.export_to_countries = 'No'
  }
  if (company.future_interest_countries && company.future_interest_countries.length > 0) {
    displayCompany.future_interest_countries = company.future_interest_countries.map(country => country.name).toString()
  } else {
    displayCompany.future_interest_countries = 'No'
  }

  return displayCompany
}

function index (req, res, next) {
  const id = req.params.sourceId
  const source = req.params.source

  companyRepository.getCompany(req.session.token, id, source)
    .then((company) => {
      const timeSinceNewContact = itemCollectionService.getTimeSinceLastAddedItem(company.contacts)
      const contactsInLastYear = itemCollectionService.getItemsAddedInLastYear(company.contacts)
      const companyDisplay = getDisplayCompany(company)
      const chDisplay = getDisplayCH(company)

      res.render('company/index', {
        company,
        companyDisplay,
        chDisplay,
        timeSinceNewContact,
        contactsInLastYear,
        companyDetailLabels,
        companyDetailsDisplayOrder,
        chDetailLabels,
        chDetailsDisplayOrder
      })
    })
    .catch((error) => {
      const errors = error.error
      if (error.response) {
        return res.status(error.response.statusCode).json({errors})
      }
      next(error)
    })
}

function get (req, res) {
  const id = req.params.sourceId
  const source = req.params.source

  companyRepository.getCompany(req.session.token, id, source)
    .then((company) => {
      res.json(company)
    })
    .catch((error) => {
      const errors = error.error
      return res.status(error.response.statusCode).json({ errors })
    })
}

function post (req, res) {
  // Flatten selected fields
  const company = Object.assign({}, req.body.company)
  controllerUtils.flattenIdFields(company)
  controllerUtils.nullEmptyFields(company)

  if (company.export_to_countries === null) company.export_to_countries = []
  if (company.future_interest_countries === null) company.future_interest_countries = []

  controllerUtils.genCSRF(req, res)

  companyRepository.saveCompany(req.session.token, company)
    .then((data) => {
      res.json(data)
    })
    .catch(({ statusCode, errors }) => {
      cleanErrors(errors)
      return res.status(statusCode).json({ errors })
    })
}

function archive (req, res) {
  controllerUtils.genCSRF(req, res)

  companyRepository.archiveCompany(req.session.token, req.body.id, req.body.reason)
    .then((company) => {
      res.json(company)
    })
    .catch((error) => {
      winston.log('error', error)
      if (typeof error.error === 'string') {
        return res.status(error.response.statusCode).json({ errors: { detail: error.response.statusMessage } })
      }
      const errors = error.error
      cleanErrors(errors)
      return res.status(error.response.statusCode).json({ errors })
    })
}

function unarchive (req, res) {
  controllerUtils.genCSRF(req, res)

  companyRepository.unarchiveCompany(req.session.token, req.body.id)
    .then((company) => {
      res.json(company)
    })
    .catch((error) => {
      winston.error('error', error)
      if (typeof error.error === 'string') {
        return res.status(error.response.statusCode).json({ errors: { detail: error.response.statusMessage } })
      }
      const errors = error.error
      cleanErrors(errors)
      return res.status(error.response.statusCode).json({ errors })
    })
}

router.get('/company/:source/:sourceId', index)
router.get('/api/company/:source/:sourceId', get)
router.post('/api/company', post)
router.post('/api/company/archive', archive)
router.post('/api/company/unarchive', unarchive)

module.exports = { router, getDisplayCompany, getDisplayCH }
