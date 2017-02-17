const axios = require('axios')

const trade = require('@uktrade/trade_elements').elementstuff

const areClientRelationship = document.querySelectorAll('.client-rev-reveal > label > input')[0]
const notClientRelationship = document.querySelectorAll('.client-rev-reveal > label > input')[1]
const differentclientrelationship = document.querySelector('#crm-wrapper')
const sectorDropdown = document.querySelector('#sector')
const subSectorDropdown = document.querySelector('#subsector')
const subSectorDropdownWrapper = document.querySelector('#subsector-wrapper')
const createBusinessActivity = document.querySelector('#inv-add-business-activity')
const addBusinessActivity = document.querySelector('#addbusiness-wrapper')
const subReferWrapper = document.querySelector('#inv-subref-wrapper')
const referrerDropdown = document.querySelector('#referral')
const subReferDropdownWrapper = document.querySelector('#inv-subref-dd-wrapper')
const subReferDropdown = document.querySelector('#inv-subref-dd')
const radioFdi = document.querySelector('#radio-fdi')
const radioNonFdi = document.querySelector('#radio-nonfdi')
const fdiDropdownWrapper = document.querySelector('#inv-fdi-wrapper')
const nonFdiDropdownWrapper = document.querySelector('#inv-non-fdi-wrapper')
const radioNdaNotSigned = document.querySelector('#inv-nda-signed_no')
const radioCanShareWrapper = document.querySelector('#invsubnda > fieldset')
const radioCanShare = document.querySelector('#inv-nda-unsigned_yes')
const textShareDetailsWrapper = document.querySelector('#inv-share-details-wrapper')

notClientRelationship.addEventListener('click', () => {
  trade.removeClass(differentclientrelationship, 'hidden')
},
  true
)

areClientRelationship.addEventListener('click', () => {
  trade.addClass(differentclientrelationship, 'hidden')
},
  true
)

createBusinessActivity.addEventListener('click', () => {
  trade.removeClass(addBusinessActivity, 'hidden')
})

function sectorHasSubs (id) {
  axios.get(`/api/investment/subsectors/${id}`)
    .then((result) => {
      if (result.data.length > 0) {
        subSectorDropdown.innerHTML = '<option value="-">Pick a value</option>'
        result.data.forEach((el) => {
          subSectorDropdown.innerHTML += `<option value="${el.id}">${el.name}</option>`
        })
        trade.removeClass(subSectorDropdownWrapper, 'hidden')
      } else {
        trade.addClass(subSectorDropdownWrapper, 'hidden')
      }
    })
}

function referHasSubs (id) {
  axios.get(`/api/investment/subreferrals/${id}`)
    .then((result) => {
      if (result.data.length > 0) {
        if (result.data[0].subreferral_type !== 'FILL_IN_BOX') {
          subReferDropdown.innerHTML = '<option value="-">Pick a value</option>'
          result.data.forEach((el) => {
            subReferDropdown.innerHTML += `<option value="${el.id}">${el.subreferral_type}</option>`
          })
          trade.removeClass(subReferDropdownWrapper, 'hidden')
        } else {
          trade.removeClass(subReferWrapper, 'hidden')
        }
      } else {
        trade.addClass(subReferWrapper, 'hidden')
      }
    })
}

sectorDropdown.addEventListener('change', (ev) => sectorHasSubs(ev.target.value))
referrerDropdown.addEventListener('change', (ev) => referHasSubs(ev.target.value))

radioFdi.addEventListener('click', () => {
  trade.removeClass(fdiDropdownWrapper, 'hidden')
  trade.addClass(nonFdiDropdownWrapper, 'hidden')
})

radioNonFdi.addEventListener('click', () => {
  trade.addClass(fdiDropdownWrapper, 'hidden')
  trade.removeClass(nonFdiDropdownWrapper, 'hidden')
})

radioNdaNotSigned.addEventListener('click', () => {
  trade.removeClass(radioCanShareWrapper, 'hidden')
})

radioCanShare.addEventListener('click', () => {
  trade.removeClass(textShareDetailsWrapper, 'hidden')
})
