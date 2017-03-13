const investmentProjectsOpenLabels = {
  name: 'Open projects',
  value: 'Value',
  state: 'Stage',
  land_date: 'Land date'
}

const investmentProjectsClosedLabels = {
  name: 'Closed projects',
  value: 'Value',
  state: 'Status',
  state_date: 'Status date'
}

const investmentDetailLabels = {
  company_name: 'Company',
  account_management_tier: 'Account management tier',
  investment_account_manager: 'Investment account manager',
  account_manager: 'Account manager',
  client_relationship_manager: 'Client relationship manager',
  ownership: 'Ownership'
}

const investmentBriefDetails = {
  company_name: 'Company',
  country_address: 'Country of Address',
  investment_in_uk: 'Investment in the UK',
  account_management_tier: 'Account tier'
}

const investmentFormLabels = {
  company_name: 'Company',
  investment_tier: 'Investment account manager tier',
  investment_account_manager: 'Investment account manager',
  client_relationship_manager: 'Client relationship manager',
  ownership: 'Ownership'
}

const detailsDisplay = {
  company_name: 'Client',
  investment_type: 'Type of investment',
  sector_primary: 'Primary sector',
  sector_sub: 'Sub-sector',
  business_activity: 'Business activity',
  project_description: 'Project description',
  nda_signed: 'Non-disclosure agreement',
  project_shareable: 'Shareable with UK partners',
  estimated_land_date: 'Estimated land date'
}

const months = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'
]

const referralSource = {
  activity: 'Activity',
  event: 'Event',
  advisor: 'Advisor'
}

const requirementsLabels = {
  main_strategic_driver: 'Main strategic driver',
  client_requirements: 'Client requirements',
  competitor_countries: 'Competitor countries',
  possible_uk_locations: 'Possible UK locations',
  investment_location: 'Investment location',
  uk_recipient_company: 'UK recipient company'
}

const valueLabels = {
  total_investment: 'Total Investment',
  foreign_equity_investment: 'Foreign equity investment',
  government_assistance: 'Government assistance',
  new_jobs: 'New jobs',
  average_salary: 'Average salary',
  safeguarded_jobs: 'Safeguarded jobs',
  r_d_budget: 'R&D budget',
  non_fdi_r_d_project: 'Non-FDI R&D project',
  new_to_world_tech: 'New-to-world tech',
  export_revenue: 'Export revenue'
}

module.exports = {
  detailsDisplay,
  investmentBriefDetails,
  investmentDetailLabels,
  investmentFormLabels,
  investmentProjectsClosedLabels,
  investmentProjectsOpenLabels,
  months,
  referralSource,
  requirementsLabels,
  valueLabels
}

