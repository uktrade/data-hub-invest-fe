/* eslint new-cap: 0 */
const express = require('express')
const winston = require('winston')
const controllerUtils = require('../lib/controllerutils')
const companyRepository = require('../repositorys/companyrepository')
const itemCollectionService = require('../services/itemcollectionservice')
const companyFormattingService = require('../services/companyformattingservice')
const investmentFormattingService = require('../services/investmentformattingservice')
const { companyDetailLabels, chDetailLabels, companyTableHeadings } = require('../labels/companylabels')
const { investmentDetailLabels, investmentProjectsOpenLabels, investmentProjectsClosedLabels } = require('../labels/investmentlabels')
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

function index (req, res, next) {
  const id = req.params.sourceId
  const source = req.params.source

  companyRepository.getCompany(req.session.token, id, source)
    .then((company) => {
      const timeSinceNewContact = itemCollectionService.getTimeSinceLastAddedItem(company.contacts)
      const contactsInLastYear = itemCollectionService.getItemsAddedInLastYear(company.contacts)
      const companyDisplay = companyFormattingService.getDisplayCompany(company)
      const chDisplay = companyFormattingService.getDisplayCH(company)
      const headingAddress = companyFormattingService.getHeadingAddress(company)
      const headingName = companyFormattingService.getHeadingName(company)
      const parents = companyFormattingService.parseRelatedData(company.parents)
      const children = companyFormattingService.parseRelatedData(company.children)
      const investmentDisplay = investmentFormattingService.getInvestmentDetailsDisplay(company)
      const investmentProjectsOpen = investmentFormattingService.getOpenInvestmentProjects(company.investmentProjects)
      const investmentProjectsClosed = investmentFormattingService.getClosedInvestmentProjects(company.investmentProjects)

      res.render('company/index', {
        company,
        companyDisplay,
        chDisplay,
        timeSinceNewContact,
        contactsInLastYear,
        companyDetailLabels,
        companyDetailsDisplayOrder: Object.keys(companyDetailLabels),
        chDetailLabels,
        chDetailsDisplayOrder: Object.keys(chDetailLabels),
        headingAddress,
        headingName,
        companyTableHeadings,
        companyTableKeys: Object.keys(companyTableHeadings),
        children,
        parents,
        investmentDetailLabels,
        investmentDetailsDisplayOrder: Object.keys(investmentDetailLabels),
        investmentDisplay,
        investmentProjectsOpenLabels,
        investmentProjectsOpenKeys: Object.keys(investmentProjectsOpenLabels),
        investmentProjectsOpen,
        investmentProjectsClosedLabels,
        investmentProjectsClosedKeys: Object.keys(investmentProjectsClosedLabels),
        investmentProjectsClosed
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

module.exports = { router }
