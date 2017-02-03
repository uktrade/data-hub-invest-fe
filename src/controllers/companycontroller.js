/* eslint new-cap: 0 */
const express = require('express')
const controllerUtils = require('../lib/controllerutils')
const companyRepository = require('../repositorys/companyrepository')
const metadataRepository = require('../repositorys/metadatarepository')
const companyFormattingService = require('../services/companyformattingservice')
const investmentFormattingService = require('../services/investmentformattingservice')
const { companyDetailLabels, chDetailLabels, companyTableHeadings } = require('../labels/companylabels')
const { investmentDetailLabels, investmentProjectsOpenLabels, investmentProjectsClosedLabels } = require('../labels/investmentlabels')
const { managedOptions, investmentTierOptions } = require('../options')
const router = express.Router()
const isBlank = controllerUtils.isBlank

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
    chDetailsDisplayOrder: Object.keys(chDetailLabels),
    companyTableHeadings,
    companyTableKeys: Object.keys(companyTableHeadings),
    children,
    parents
  })
}

function postDetails (req, res) {
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

function getContacts (req, res) {
  res.render('company/contacts', {tab: 'contacts'})
}

function getInteractions (req, res) {
  res.render('company/interactions', {tab: 'interactions'})
}

function getExport (req, res) {
  res.render('company/export', {tab: 'export'})
}

function getInvestment (req, res, next) {
  companyRepository.getCompanyInvestmentSummary(req.session.token, req.params.sourceId)
  .then((investmentSummary) => {
    if (!investmentSummary) {
      req.flash('info', 'Before creating a new investment project, please complete this section.')
      return res.redirect(`/company/company_company/${req.params.sourceId}/investment/edit`)
    }

    res.locals.investmentSummary = investmentSummary
    res.locals.investmentDisplay = investmentFormattingService.getInvestmentDetailsDisplay(investmentSummary)
    return metadataRepository.getAdvisors(req.session.token)
  })
  .then((advisors) => {
    res.locals.advisors = advisors
    companyRepository.getCompanyInvestmentProjects(req.session.token, req.params.sourceId)
  })
  .then((investmentProjects) => {
    if (investmentProjects) {
      res.locals.investmentProjects = investmentProjects
      res.locals.investmentProjectsOpen = investmentFormattingService.getOpenInvestmentProjects(investmentProjects)
      res.locals.investmentProjectsClosed = investmentFormattingService.getClosedInvestmentProjects(investmentProjects)
    }

    res.render('company/investment', {
      tab: 'investment',
      investmentProjectsOpenLabels,
      investmentProjectsClosedLabels,
      investmentDetailLabels,
      investmentTierOptions,
      investmentProjectsOpenKeys: Object.keys(investmentProjectsOpenLabels),
      investmentProjectsClosedKeys: Object.keys(investmentProjectsClosedLabels)
    })
  })
  .catch((error) => {
    if (error.statusCode && error.statusCode === 404) {
      return res.redirect(`/company/company_company/${req.params.sourceId}/investment/edit`)
    }
    next(error)
  })
}

function editInvestment (req, res, next) {
  metadataRepository.getAdvisors(req.session.token)
    .then((advisors) => {
      res.locals.advisors = advisors
      return companyRepository.getCompanyInvestmentSummaryLite(req.session.token, req.params.sourceId)
    })
    .then((investmentSummary) => {
      res.render('company/investmentform', {
        tab: 'investment',
        investmentTierOptions,
        investmentFormLabels,
        investmentSummary
      })
    })
}

function postInvestment (req, res) {
  delete req.body._csrf_token

  const errors = validateInvestment(req.body)
  if (errors) {
    controllerUtils.genCSRF(req, res)
    res.locals.errors = errors
    return editInvestment(req, res)
  }

  companyRepository.saveCompanyInvestmentSummary(req.session.token, req.body)
  .then((result) => {
    res.redirect(`/company/company_company/${req.params.sourceId}/investment`)
  })
  .catch((error) => {
    if (error.errors) {
      cleanErrors(error.errors)
      req.errors = error.errors
    } else {
      res.errors = error
    }
    return editInvestment(req, res)
  })
}

function validateInvestment (data) {
  const errors = {}
  if (isBlank(data.investment_tier)) {
    errors.investment_tier = ['You must select an investment tier']
  }

  if (isBlank(data.ownership)) {
    errors.ownership = ['You must select a country of ownership']
  }
  if (managedOptions.includes(data.investment_tier) && isBlank(data.investment_account_manager)) {
    errors.investment_account_manager = ['You must provide an investment account manager']
  }
  if (data.ownership === 'foreign' && isBlank(data.ownership_country)) {
    errors.ownership_country = ['You must provide the name of the country that this companys owner is registered in']
  }

  if (Object.keys(errors).length > 0) {
    return errors
  }

  return null
}

router.use('/company/:source/:sourceId/*', getCommon)
router.get('/company/:source/:sourceId/details', getDetails)
router.post('/company/:source/:sourceId/details', postDetails)
router.get('/company/:source/:sourceId/contacts', getContacts)
router.get('/company/:source/:sourceId/interactions', getInteractions)
router.get('/company/:source/:sourceId/export', getExport)
router.get('/company/:source/:sourceId/investment', getInvestment)
router.get('/company/:source/:sourceId/investment/edit', editInvestment)
router.post('/company/:source/:sourceId/investment/edit', postInvestment)

module.exports = { router }
