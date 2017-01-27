const DateLib = require('../lib/date')

function getInvestmentDetailsDisplay (company) {
  if (!company.id) return null
  return {
    account_management_tier: 'B - Top 300',
    account_manager: `<a href="/advisor/${company.account_manager.id}/">${company.account_manager.name}</a>`,
    ownership: 'United States of America'
  }
}
function getOpenInvestmentProjects (investmentProjects) {
  if (!investmentProjects) return null

  return investmentProjects
    .filter(project => project.open)
    .map((project) => {
      return {
        name: `<a href="/investmentprojects/${project.id}/">${project.name}</a>`,
        value: project.value,
        state: project.state,
        land_date: DateLib.formatDate(project.land_date)
      }
    })
}
function getClosedInvestmentProjects (investmentProjects) {
  if (!investmentProjects) return null

  return investmentProjects
    .filter(project => !project.open)
    .map((project) => {
      return {
        name: `<a href="/investmentprojects/${project.id}/">${project.name}</a>`,
        value: project.value,
        state: project.state,
        state_date: DateLib.formatDate(project.state_date)
      }
    })
}

module.exports = { getInvestmentDetailsDisplay, getOpenInvestmentProjects, getClosedInvestmentProjects }
