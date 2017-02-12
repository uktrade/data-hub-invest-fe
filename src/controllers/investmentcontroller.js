/**
 * Created by jimsmith on 24/01/2017.
 */

const express = require('express')
const companyRepository = require('../repositorys/companyrepository')
const metadataRepository = require('../repositorys/metadatarepository')
const search = require('../services/searchservice')

// imported from company controller
// @todo merge into utils
const investmentDetailLabels = {
  company_name: 'Company',
  account_management_tier: 'Account management tier',
  account_manager: 'Account manager',
  ownership: 'Ownership'
}

const investmentDetailsDisplayOrder = Object.keys(investmentDetailLabels)

function getInvestmentDetailsDisplay (company, extra) {
  if (!company.id) return null
  return {
    company_name: `${company.name}`,
    account_management_tier: `${extra.investment_tier}`,
    account_manager: `<a href="/advisor/${company.account_manager.id}/">${company.account_manager.name}</a>`,
    ownership: `${extra.ownership}`
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
      res.render('investment/index', {
        investmentDisplay,
        investmentDetailLabels,
        investmentDetailsDisplayOrder
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
  const flatCountries = []
  metadataRepository.COUNTRYS.map((land) => flatCountries[land.id] = land.name)

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

router.get('/investment/', index)
router.get('/investment/:sourceId', index)
router.get('/api/investment/search/:term', invsearch)

module.exports = {router}
