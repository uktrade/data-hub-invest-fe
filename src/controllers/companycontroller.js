/* eslint new-cap: 0 */
const express = require('express')
const winston = require('winston')
const controllerUtils = require('../lib/controllerutils')
const companyRepository = require('../repositorys/companyrepository')
const metadataRepository = require('../repositorys/metadatarepository')
const companyFormattingService = require('../services/companyformattingservice')
const { companyDetailLabels, chDetailLabels, companyTableHeadings, companyTypeOptions } = require('../labels/companylabels')
const router = express.Router()

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

function getCommon (req, res, next) {
  const id = req.params.sourceId
  const source = req.params.source
  const csrfToken = controllerUtils.genCSRF(req, res)
  return companyRepository.getCompany(req.session.token, id, source)
  .then((company) => {
    const headingAddress = companyFormattingService.getHeadingAddress(company)
    const headingName = companyFormattingService.getHeadingName(company)
    const countries = metadataRepository.COUNTRYS

    res.locals.id = id
    res.locals.source = source
    res.locals.company = company
    res.locals.countries = countries
    res.locals.headingName = headingName
    res.locals.headingAddress = headingAddress
    res.locals.csrfToken = csrfToken

    next()
  })
}

function postCommon (req, res, next) {
  const keys = Object.keys(req.body)
  for (const key of keys) {
    if (req.body[key] === 'yes') {
      req.body[key] = true
    }
    if (req.body[key] === 'no') {
      req.body[key] = false
    }
  }
  next()
}

function getDetails (req, res, next) {
  const company = res.locals.company
  const companyDisplay = companyFormattingService.getDisplayCompany(company)
  const chDisplay = companyFormattingService.getDisplayCH(company)
  const parents = companyFormattingService.parseRelatedData(company.parents)
  const children = companyFormattingService.parseRelatedData(company.children)

  res.render('company/details', {
    tab: 'details',
    companyDisplay,
    chDisplay,
    companyDetailLabels,
    companyDetailsDisplayOrder: Object.keys(companyDetailLabels),
    chDetailLabels,
    chDetailsDisplayOrder: ['name', 'company_number', 'registered_address', 'business_type', 'company_status', 'sic_code'],
    companyTableHeadings,
    companyTableKeys: Object.keys(companyTableHeadings),
    children,
    parents
  })
}

function editDetails (req, res) {
  const company = res.locals.company || {}
  const chDisplay = (company.companies_house) ? companyFormattingService.getDisplayCH(company) : null

  const businessType = company.business_type || req.query.business_type
  const ukBased = company.uk_based || (req.query.country === 'uk')

  let template
  if (businessType === 'ltd') {
    template = 'edit-ltd'
  } else if (businessType === 'ltdchild') {
    template = 'edit-ltdchild'
  } else if (!ukBased) {
    template = 'edit-none-uk'
  } else {
    template = 'edit-ukother'
  }

  res.render(`company/${template}`, {
    tab: 'details',
    chDisplay,
    companyDetailLabels,
    companyDetailsDisplayOrder: Object.keys(companyDetailLabels),
    chDetailLabels,
    chDetailsDisplayOrder: ['name', 'business_type', 'company_status', 'incorporation_date', 'sic_code'],
    companyTableHeadings,
    companyTableKeys: Object.keys(companyTableHeadings),
    companyTypeOptions,
    business_type: businessType,
    showHeadquarters: !controllerUtils.isBlank(company.headquarters),
    businessType,
    ukBased,
    REGION_OPTIONS: metadataRepository.REGION_OPTIONS,
    SECTOR_OPTIONS: metadataRepository.SECTOR_OPTIONS,
    EMPLOYEE_OPTIONS: metadataRepository.EMPLOYEE_OPTIONS,
    TURNOVER_OPTIONS: metadataRepository.TURNOVER_OPTIONS
  })
}

function postDetails (req, res, next) {
  // Flatten selected fields
  const company = Object.assign({}, req.body)
  companyRepository.saveCompany(req.session.token, company)
    .then((data) => {
      req.flash('success-message', 'Updated company record')
      res.redirect(`/company/company_company/${data.id}/details`)
    })
    .catch((error) => {
      controllerUtils.genCSRF(req, res)
      winston.debug(error)
      if (error.errors) {
        winston.debug(error)
        res.locals.errors = controllerUtils.transformErrors(error.errors)
        cleanErrors(res.locals.errors)
        res.locals.company = req.body
        return editDetails(req, res)
      }

      return next(error)
    })
}

function getContacts (req, res) {
  res.render('company/contacts', {tab: 'contacts'})
}

function getInteractions (req, res) {
  res.render('company/interactions', {tab: 'interactions'})
}

function getExport (req, res) {
  res.render('company/export', {tab: 'export'})
}

router.use('/company/:source/:sourceId/*', getCommon)
router.post('/company/:source/:sourceId/*', postCommon)
router.get(['/company/:source/:sourceId/edit', '/company/add'], editDetails)
router.post(['/company/:source/:sourceId/edit', '/company/add'], postDetails)
router.get('/company/:source/:sourceId/details', getDetails)
router.get('/company/:source/:sourceId/contacts', getContacts)
router.get('/company/:source/:sourceId/interactions', getInteractions)
router.get('/company/:source/:sourceId/export', getExport)

module.exports = { router }
