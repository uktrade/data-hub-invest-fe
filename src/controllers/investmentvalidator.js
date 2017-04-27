const {isBlank, booleanise} = require('../lib/controllerutils')
const {copyObj} = require('../lib/utils')

function fmtErrorLabel (term) {
  return [`You must provide ${term} `]
}

exports.validateProject = function validateProject (projectBody) {
  const errors = {}
  // copy the project properties so the original request body is not mutated
  let project = copyObj(projectBody)
  project.amcrm = booleanise(project.amcrm)
  project.amreferralsource = booleanise(project.amreferralsource)
  project.fdi = project.fdi === 'FDI'
  project.nonfdi = project.fdi === 'Non-FDI'
  project.commitment_to_invest = project.fdi === 'Commitment to Invest'

  if (parseInt(project.land_month, 10) > 12 || parseInt(project.land_month, 10) < 0) {
    errors.land_month = 'not a valid month'
  }

  if (parseInt(project.land_year, 10) < 2017) {
    errors.land_year = 'not a valid year'
  }

  if (isBlank(project.client_contact)) {
    errors.client_contact = fmtErrorLabel('client contact')
  }

  if (!project.amcrm && isBlank(project.client_relationship_manager)) {
    errors.client_relationship_manager = fmtErrorLabel('client relationship manager')
  }

  if (!project.amreferralsource && isBlank(project.referral_source_manager)) {
    errors.referral_source_manager = fmtErrorLabel('referral source manager')
  }

  if (isBlank(project.referral_source_main)) {
    errors.referral_source_main = fmtErrorLabel('referral source ')
  }
  if (isBlank(project.sector)) {
    errors.sector = fmtErrorLabel('sector')
  }
  if (isBlank(project.business_activity)) {
    errors.business_activity = fmtErrorLabel('business activity')
  }
  if (isBlank(project.project_description)) {
    errors.project_description = fmtErrorLabel('project description')
  }

  if (!(project.fdi || project.nonfdi || project.commitment_to_invest)) {
    errors.fdi = fmtErrorLabel('an FDI status')
  }

  if (project.fdi && isBlank(project.fdi_type)) {
    errors.fdi = fmtErrorLabel('an FDI value')
  }

  if (project.nonfdi && isBlank(project.nonfdi_type)) {
    errors.fdi = fmtErrorLabel('a non-FDI value')
  }
  if (Object.keys(errors).length > 0) {
    return errors
  }
  return null
}
