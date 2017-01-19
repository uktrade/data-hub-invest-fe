/* eslint new-cap: 0 */
const express = require('express')
const winston = require('winston')
const controllerUtils = require('../lib/controllerutils')
const companyRepository = require('../repositorys/companyrepository')
const itemCollectionService = require('../services/itemcollectionservice')
const getFormattedAddress = require('../lib/address').getFormattedAddress

const router = express.Router()
const companyDetailLabels = {
  registered_address: 'Registered address',
  business_type: 'Company type',
  alias: 'Trading name',
  trading_address: 'Trading address',
  uk_region: 'Region',
  headquarters: 'Headquarters',
  sector: 'Primary sector',
  website: 'Website',
  description: 'Business description',
  employee_range: 'Number of employees',
  turnover_range: 'Annual turnover'
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
const TODO = '<span class="status-badge status-badge--xsmall status-badge--action">TO DO</span>'

const fakeParents = [{
  id: '1234',
  name: 'Marriott International (USA) HQ - Global HQ',
  address: 'Bethesda, United States of America'
}]
const fakeChildren = [
  {
    id: '1234',
    name: 'Marriott Hanbury Manor Hotel & Country Club',
    address: 'Hanbury, UK'
  },
  {
    id: '1234',
    name: 'Marriott Hotel (Twickenham)',
    address: 'Twickenham, UK'
  },
  {
    id: '1234',
    name: 'Marriott Hotel and Country Club St Pierre',
    address: 'Chepstow, UK'
  },
  {
    id: '1234',
    name: 'Marriott International Aberdeen',
    address: 'Aberdeen, UK'
  },
  {
    id: '1234',
    name: 'Marriott Manchester Victoria & Albert Hotel',
    address: 'Manchester, UK'
  }
]

const companyTableHeadings = {
  name: 'Company name',
  address: 'Address'
}
const companyTableKeys = ['name', 'address']

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
    company_status: companyHouseData.company_status,
    registered_address: getFormattedAddress(company.companies_house_data, 'registered')
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
    sector: (company.sector && company.sector.name) ? company.sector.name : TODO,
    alias: company.alias || '',
    description: company.description || TODO,
    website: company.website ? `<a href="${company.website}">${company.website}</a>` : TODO,
    employee_range: (company.employee_range && company.employee_range.name) ? company.employee_range.name : TODO,
    turnover_range: (company.turnover_range && company.turnover_range.name) ? company.turnover_range.name : TODO,
    account_manager: (company.account_manager && company.account_manager.name) ? company.account_manager.name : TODO,
    headquarters: 'UK headquarters'
  }

  displayCompany.trading_address = getFormattedAddress(company, 'trading')

  if (!company.companies_house_data) {
    displayCompany.registered_address = getFormattedAddress(company, 'registered')
    displayCompany.business_type = (company.business_type && company.business_type.name) ? company.business_type.name : TODO
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
function getHeadingAddress (company) {
  // If this is a CDMS
  const cdmsTradingAddress = getFormattedAddress(company, 'trading')
  if (cdmsTradingAddress.length > 0) {
    return cdmsTradingAddress
  }

  if (company.companies_house_data !== null) {
    return getFormattedAddress(company.companies_house_data, 'registered')
  }

  return getFormattedAddress(company, 'registered')
}
function parseRelatedData (companies) {
  return companies.map((company) => {
    return {
      name: `<a href="/company/%{company.id}">${company.name}</a>`,
      address: company.address
    }
  })
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
      const headingAddress = getHeadingAddress(company)

      const parents = parseRelatedData(fakeParents)
      const children = parseRelatedData(fakeChildren)

      res.render('company/index', {
        company,
        companyDisplay,
        chDisplay,
        timeSinceNewContact,
        contactsInLastYear,
        companyDetailLabels,
        companyDetailsDisplayOrder,
        chDetailLabels,
        chDetailsDisplayOrder,
        headingAddress,
        companyTableHeadings,
        companyTableKeys,
        children,
        parents
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

module.exports = { router, getDisplayCompany, getDisplayCH, getHeadingAddress }
