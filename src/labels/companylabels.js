const companyDetailLabels = {
  business_type: 'Business type',
  name: 'Name',
  registered_address: 'Primary address',
  alias: 'Trading name',
  trading_address: 'Trading address',
  uk_region: 'UK region',
  headquarters: 'Headquarters',
  sector: 'Sector',
  website: 'Website',
  description: 'Business description',
  employee_range: 'Number of employees',
  turnover_range: 'Annual turnover'
}
const chDetailLabels = {
  name: 'Registered company name',
  company_number: 'Companies House number',
  registered_address: 'Registered office address',
  business_type: 'Company type',
  company_status: 'Company status',
  sic_code: 'Nature of business (SIC)',
  incorporation_date: 'Incorporation date'
}
const companyTableHeadings = {
  name: 'Company name',
  address: 'Address'
}
const companyTypeOptions = {
  ltd: 'UK private or public limited company',
  ltdchild: 'Child of a UK private or public limited company',
  ukother: 'Other type of UK organisation',
  forother: 'Foreign company'
}

module.exports = { companyDetailLabels, chDetailLabels, companyTableHeadings, companyTypeOptions }

