/**
 * Created by jimsmith on 24/01/2017.
 */

const express = require('express')
const winston = require('winston')
const companyRepository = require('../repositorys/companyrepository')
const search = require('../services/searchservice')
const countryIds = require('../lib/countryids').ids

// imported from company controller
// @todo merge into utils
const investmentDetailLabels = {
  company_name: 'Company',
  account_management_tier: 'Account management tier',
  account_manager: 'Account manager',
  ownership: 'Ownership'
}

const investmentDetailsDisplayOrder = Object.keys(investmentDetailLabels)

function getInvestmentDetailsDisplay(company) {
  if (!company.id) return null
  return {
    company_name: `${company.name}`,
    account_management_tier: 'B - Top 300',
    account_manager: `<a href="/advisor/${company.account_manager.id}/">${company.account_manager.name}</a>`,
    ownership: 'United States of America'
  }
}

const router = express.Router()

function index(req, res) {
  const id = req.params.sourceId
  companyRepository.getCompany(req.session.token, id, null).then((company) => {
    let investmentDisplay = getInvestmentDetailsDisplay(company)
    res.render('investment/index', {
      investmentDisplay,
      investmentDetailLabels,
      investmentDetailsDisplayOrder,
      countryIds
    })
  }).catch((error) => {
    const errors = error.error
    if (error.response) {
      return res.status(error.response.statusCode).json({errors})
    }
    next(error)
  })
}

function OLDinvsearch(req, res) {
  search.search({
    token: req.session.token,
    term: req.params.term,
    nonuk: true
  })
    .then((result) => {
      const promises = []
      for (const co of result.hits) {
        if (co._type !== 'company_companieshousecompany') { // @todo - assumption - we'll only have investment data for non-CH cos
          promises.push(companyRepository.getCompanyInvestmentSummaryLite(req.session.token, co._id))
        }
      }
      return Promise.all(promises)
    }).then((result) => {
    res.json(result)
  })
    .catch(error => res.render('error', {error}))
}

function collate(rez) {
  const companies = [];

  rez.forEach((item) => {
    console.log(item)
    if (!!item) {
      if (!!item._type && item._type === "company_company") {
        companies[item._id] = item;
      }

      if (!!item.investment_tier) {
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

function invsearch(req, res) {
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
router.get('/api/investment/oldsearch/:term', OLDinvsearch)

module.exports = {router}
