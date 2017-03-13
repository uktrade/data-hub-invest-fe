/**
 * Created by jimsmith on 24/01/2017.
 */

const express = require('express')
const companyRepository = require('../repositorys/companyrepository')
const metadataRepository = require('../repositorys/metadatarepository')
const search = require('../services/searchservice')
const {investmentBriefDetails, detailsDisplay, referralSource, months, valueLabels, requirementsLabels} = require('../labels/investmentlabels')
const {validateProject} = require('./investmentvalidator')
const {genCSRF, booleanise, prepForDropdown} = require('../lib/controllerutils')

const investmentDetailsDisplayOrder = Object.keys(investmentBriefDetails)
const detailsDisplayOrder = Object.keys(detailsDisplay)
const referOrder = Object.keys(referralSource)
const valueOrder = Object.keys(valueLabels)
const requirementsOrder = Object.keys(requirementsLabels)

function fixInvestmentDisplayDefaults (company) {
  if (!company.registered_address_country) {
    company.registered_address_country = {name: 'TODO'}
  }
  if (!company.summary) {
    company.summary = {}
  }
  if (!company.summary.investment_tier) {
    company.summary.investment_tier = 'TODO'
  }
  if (!company.projects) {
    company.projects = []
  }

  return company
}

function getInvestmentDetailsDisplay (company) {
  if (!company.id) return null
  // @todo figure out th
  company = fixInvestmentDisplayDefaults(company)
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
        foreign,
        id
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

function create (req, res) {
  const topLevelReferralSource = prepForDropdown(metadataRepository.REFERRAL, 'referral_type')
  const businessActivities = prepForDropdown(metadataRepository.BUSINESS_ACTIVITY, 'business_activity')

  const fdi = prepForDropdown(metadataRepository.FDI, 'fdi_option')
  const nonfdi = prepForDropdown(metadataRepository.NONFDI, 'nonfdi')

  const sectors = prepForDropdown(metadataRepository.SECTOR_OPTIONS, 'name')
  const investerid = req.params.investerId || req.body.investerId
  const investeeid = req.params.companyId || req.body.companyId

  let lcompany, lcontacts, ladvisors

  companyRepository.getCompany(req.session.token, investerid, null)
    .then((invester) => {
      lcompany = invester
      return companyRepository.getCompanyInvestmentSummary(req.session.token, investerid)
    })
    .then((summary) => {
      lcompany.summary = summary
      return companyRepository.getCompany(req.session.token, investeeid, null)
    })
    .then((investee) => {
      lcompany.investee = investee
      return metadataRepository.getClientContacts(req.session.token)
    })
    .then((contacts) => {
      lcontacts = prepForDropdown(contacts, 'contact')
      return metadataRepository.getAdvisors(req.session.token)
    })
    .then((advisors) => {
      ladvisors = prepForDropdown(advisors, 'name')
      return companyRepository.getCompanyInvestmentProjects(req.session.token, lcompany.id)
    })
    .then((projects) => {
      lcompany.projects = projects
      return companyRepository.getCompanyInvestmentProjects(req.session.token, investeeid)
    })
    .then((iprojects) => {
      lcompany.investee.projects = iprojects
      return companyRepository.getCompanyInvestmentSummary(req.session.token, investeeid)
    })
    .then((isummary) => {
      lcompany.investee.summary = isummary

      let investmentDisplay = getInvestmentDetailsDisplay(lcompany)
      let investeeDetails = getInvestmentDetailsDisplay(lcompany.investee)

      res.render('investment/create', {
        sectors,
        lcontacts,
        ladvisors,
        topLevelReferralSource,
        businessActivities,
        investmentDisplay,
        investmentBriefDetails,
        investmentDetailsDisplayOrder,
        investeeDetails,
        fdi,
        nonfdi,
        investerid,
        investeeid
      })
    }).catch((error) => console.log(error))
}

function userOrAnotherAdvisor (amField, advisorId, userId) {
  if (booleanise(amField)) {
    return userId
  } else {
    return advisorId
  }
}

function postProject (req, res) {
  delete req.body._csrf_token

  const errors = validateProject(req.body)

  if (errors) {
    genCSRF(req, res)
    res.locals.errors = errors
    return create(req, res)
  }

  console.log(req.body.amreferralsource, req.body.referral_source_manager, res.locals.user.id)

  const project = {
    investment_source: req.body.investerId,
    investment_recipient: req.body.investeeId,
    client_contact: req.body.client_contact,
    client_relationship_manager: userOrAnotherAdvisor(req.body.amcrm, req.body.client_relationship_manager, res.locals.user.id),
    referral_source_manager: userOrAnotherAdvisor(req.body.amreferralsource, req.body.referral_source_manager, res.locals.user.id),
    referral_source_main: req.body.referral_source_main,
    referral_source_sub: req.body.referral_source_sub,
    fdi_type: req.body.fdi_type,
    nonfdi_type: req.body.nonfdi_type,
    sector: req.body.sector,
    subsector: req.body.subsector,
    business_activity: req.body.business_activity,
    project_description: req.body.project_description,
    anonymous_description: req.body.anonymous_description,
    maynotshare: req.body.maynotshare,
    nda: booleanise(req.body.ndasigned),
    estimated_land_date: `${req.body.land_year}-${req.body.land_month}-01`,
    project_id: 'P-' + ('' + Math.random()).substr(2, 8)
  }

  console.log(project)

  companyRepository.saveCreateInvestmentProject(req.session.token, project)
    .then((id) => {
      res.redirect(`/investment/${id}/details`)
    }).catch((error) => console.log('ERROR', error))
}

function createInvestmentType (ldetails) {
  if (ldetails.fdi) {
    let fditype = metadataRepository.FDI.find(el => el.id === ldetails.fdi_type)
    fditype = fditype.fdi_option
    return `FDI - ${fditype}`
  } else if (ldetails.nonfdi) {
    let nonfditype = metadataRepository.NONFDI.find(el => el.id === ldetails.nonfdi_type)
    nonfditype = nonfditype.nonfdi_type
    return `Non-FDI - ${nonfditype}`
  } else {
    return 'Commitment to invest'
  }
}

function details (req, res) {
  let ldetails = {}
  companyRepository.getInvestmentProjectDetails(req.session.token, req.params.sourceId)
    .then((details) => {
      ldetails = details
      return metadataRepository.getAdvisors(req.session.token)
    })
    .then((advisors) => {
      if (ldetails.client_relationship_manager) {
        ldetails.client_relationship_manager = advisors.find((el) => el.id === ldetails.client_relationship_manager).name
      }
      if (ldetails.referral_source_manager) {
        ldetails.referral_source_manager = advisors.find((el) => el.id === ldetails.referral_source_manager)
      }
      return companyRepository.getDitCompanyLite(req.session.token, ldetails.investment_source)
    }).then((co) => {
      ldetails.company = co
      const prospectStage = 'Not started'

    // project must have a sector...
      let sector = (metadataRepository.SECTOR_OPTIONS.find(el => el.id === ldetails.sector)).name

    // but subsector is not always present
      let subsector = metadataRepository.SUBSECTOR.find(el => el.id === ldetails.subsector)
      if (!subsector) {
        subsector = 'Not set'
      } else {
        subsector = subsector.name
      }

      let businessactivity = (metadataRepository.BUSINESS_ACTIVITY.find(el => el.id === ldetails.business_activity)).business_activity

      const shareable = ldetails.canshare ? 'Yes, can be shared' : 'No, cannot be shared'
      const nda = ldetails.nda ? 'Yes, NDA signed' : 'No NDA'

      const landDateRaw = new Date(ldetails.estimated_land_date)

      console.log(ldetails)

      const details = {
        company_name: ldetails.company.name,
        investment_type: createInvestmentType(ldetails),
        sector_primary: sector,
        sector_sub: subsector,
        business_activity: businessactivity,
        nda_signed: nda,
        project_shareable: shareable,
        project_description: ldetails.project_description,
        projectNumber: ldetails.project_id,
        estimated_land_date: `${months[landDateRaw.getMonth()]} ${landDateRaw.getFullYear()}`
      }

      const blankValue = {}
      Object.keys(valueLabels).forEach((k) => blankValue[k] = ' ')

      const blankRequirements = {}
      Object.keys(requirementsLabels).forEach((k) => blankRequirements[k] = ' ')

      const referral = {
        activity: 'Evant',
        event: 'Moscow Hoteliers Conference 2016',
        advisor: ldetails.referral_source_manager.name
      }

      res.render('investment/details',
        {
          prospectStage,
          details,
          detailsDisplay,
          detailsDisplayOrder,
          referral,
          referOrder,
          referralSource,
          blankValue,
          valueLabels,
          valueOrder,
          blankRequirements,
          requirementsLabels,
          requirementsOrder
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
  res.json(metadataRepository.SUBSECTOR.filter((f) => {
    return f.parent === req.params.id
  }))
}

function subreferrals (req, res) {
  res.json(metadataRepository.SUBREFERRAL.filter((f) => {
    return f.parent === req.params.id
  }))
}

router.get('/investment/', index)
router.get('/investment/:companyId/:investerId/create', create)
router.post('/investment/:sourceId/create', postProject)
router.get('/investment/:sourceId/details', details)
router.get('/investment/:sourceId', index)
router.get('/api/investment/search/:term', invsearch)
router.get('/api/investment/subsectors/:id', subsectors)
router.get('/api/investment/subreferrals/:id', subreferrals)

module.exports = {router}
