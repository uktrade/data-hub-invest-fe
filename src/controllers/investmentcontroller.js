/**
 * Created by jimsmith on 24/01/2017.
 */

const express = require('express')
const companyRepository = require('../repositorys/companyrepository')
const metadataRepository = require('../repositorys/metadatarepository')
const search = require('../services/searchservice')
const {investmentBriefDetails} = require('../labels/investmentlabels')

const investmentDetailsDisplayOrder = Object.keys(investmentBriefDetails)

function getInvestmentDetailsDisplay (company, extra) {
  if (!company.id) return null
  return {
    company_name: `${company.name}`,
    country_address: `${company.registered_address_country.name}`,
    account_management_tier: `${company.summary.investment_tier}`,
    investment_in_uk: `${company.projects.length} Investment Project`
  }
}

const router = express.Router()

function index (req, res) {
  const id = req.params.sourceId
  let lcompany
  companyRepository.getCompany(req.session.token, id, null)
    .then((company) => {
      lcompany = company
      return companyRepository.getCompanyInvestmentSummary(req.session.token, company.id)
    })
    .then((extra) => {
      let investmentDisplay = getInvestmentDetailsDisplay(lcompany, extra)
      const foreign = lcompany.registered_address_country.name !== 'United Kingdom'
      res.render('investment/index', {
        investmentDisplay,
        investmentBriefDetails,
        investmentDetailsDisplayOrder,
        foreign
      })
    })
    .catch((error) => {
      const errors = error.error
      if (error.response) {
        return res.status(error.response.statusCode).json({errors})
      }
    })
}

function collate (rez) {
  const companies = []
  const flatCountries = {}
  metadataRepository.COUNTRYS.forEach(function (land) {
    flatCountries[land.id] = land.name
  })

  rez.forEach((item) => {
    if (item) {
      if (!!item._type && item._type === 'company_company') {
        item.country = flatCountries[item._source.registered_address_country]
        companies[item._id] = item
      }

      if (item.investment_tier) {
        companies[item.id].summary = item
      }

      if (Array.isArray(item)) {
        companies[item[0].company].details = item
      }
    }
  }
)
  return companies
}

function prepForDropdown (metadata, key) {
  return metadata.map((thing) => { return {value: thing.id, label: thing[key]} })
}

function create (req, res) {
  const topLevelReferralSource = prepForDropdown(metadataRepository.REFERRAL, 'referral_type')
  const businessActivities = prepForDropdown(metadataRepository.BUSINESS_ACTIVITY, 'business_activity')
  const fdi = prepForDropdown(metadataRepository.FDI, 'fdi_option')
  const nonfdi = prepForDropdown(metadataRepository.NONFDI, 'nonfdi')

  const sectors = prepForDropdown(metadataRepository.SECTOR_OPTIONS, 'name')
  const id = req.params.sourceId
  let lcompany

  companyRepository.getCompany(req.session.token, id, null)
    .then((company) => {
      lcompany = company
      return companyRepository.getCompanyInvestmentSummary(req.session.token, company.id)
    })
    .then((summary) => {
        lcompany.summary = summary
        return companyRepository.getCompanyInvestmentProjects(req.session.token, lcompany.id)
    })
    .then((projects) => {
      lcompany.projects = projects
      let investmentDisplay = getInvestmentDetailsDisplay(lcompany)
      res.render('investment/create', {
        sectors,
        topLevelReferralSource,
        businessActivities,
        investmentDisplay,
        investmentBriefDetails,
        investmentDetailsDisplayOrder,
        fdi,
        nonfdi
      })
    })
}

function invsearch (req, res) {
  search.search({
    token: req.session.token,
    term: req.params.term,
    nonuk: true
  })
    .then((result) => {
      return companyRepository.hydrateCompanyInvestments(req.session.token, result.hits)
    })
    .then((rez) => {
      let companies = Object.assign({}, collate(rez))
      res.json(companies)
    })
}

function subsectors (req, res) {
  res.json(metadataRepository.SUBSECTOR.filter((f) => { return f.parent === req.params.id }))
}

function subreferrals (req, res) {
  res.json(metadataRepository.SUBREFERRAL.filter((f) => { return f.parent === req.params.id }))
}

router.get('/investment/', index)
router.get('/investment/:sourceId/create', create)
router.get('/investment/:sourceId', index)
router.get('/api/investment/search/:term', invsearch)
router.get('/api/investment/subsectors/:id', subsectors)
router.get('/api/investment/subreferrals/:id', subreferrals)

module.exports = {router}
