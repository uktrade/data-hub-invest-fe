const express = require('express')
const { ukOtherCompanyOptions, foreignOtherCompanyOptions } = require('../options')
const { genCSRF, isBlank, toQueryString } = require('../lib/controllerutils')
const router = express.Router()

function getAddStepOne (req, res, next) {
  res.render('company/add-step-1.html', {
    ukOtherCompanyOptions,
    foreignOtherCompanyOptions,
    company: req.body
  })
}

function postAddStepOne (req, res, next) {
  // validate, if bad then generate errors, and show form again
  const errors = {}

  if (isBlank(req.body.business_type)) {
    errors.business_type = ['You must select a company type']
  }

  if (req.body.business_type === 'ukother' && isBlank(req.body.business_type_uk_other)) {
    errors.business_type_uk_other = ['You must select the type of business']
  }

  if (req.body.business_type === 'forother' && isBlank(req.body.business_type_for_other)) {
    errors.business_type_for_other = ['You must select the type of business']
  }

  if (Object.keys(errors).length > 0) {
    genCSRF(req, res)
    res.locals.errors = errors
    return getAddStepOne(req, res)
  }

  const params = toQueryString({
    business_type: req.body.business_type,
    business_type_uk_other: req.body.business_type_uk_other,
    business_type_for_other: req.body.business_type_for_other
  })

  res.redirect(`/company/add-step-2/?${params}`)
}

function getAddStepTwo (req, res, next) {
  res.render('company/add-step-2.html', req.query)
}

function postAddStepTwo (req, res, next) {
}

router.get('/company/add-step-1/', getAddStepOne)
router.post('/company/add-step-1/', postAddStepOne)
router.get('/company/add-step-2/', getAddStepTwo)
router.post('/company/add-step-2/', postAddStepTwo)

module.exports = { router }
