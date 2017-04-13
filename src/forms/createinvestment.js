const axios = require('axios')

const trade = require('@uktrade/trade_elements').elementstuff

const clientRelationship = document.querySelector('#amcrm_yes')
const notClientRelationship = document.querySelector('#amcrm_no')
const differentclientrelationship = document.querySelector('#client_relationship_manager-wrapper')

const referralSource = document.querySelector('#amreferralsource_yes')
const notReferralSource = document.querySelector('#amreferralsource_no')

const invReferralAltSourceWrapper = document.querySelector('#referral_source_manager-wrapper')

const referrerDropdown = document.querySelector('#referral_source_main')
const eventWrapper = document.querySelector('#eventbox-wrapper')
const subReferWrapper = document.querySelector('#referral_source_sub-wrapper')

const subReferDropdown = document.querySelector('#referral_source_sub')

const radioFdi = document.querySelector('#fdi_1_label')
const fdiDropdownWrapper = document.querySelector('#fdi_type-wrapper')

const radioNonFdi = document.querySelector('#fdi_2_label')
const nonFdiDropdownWrapper = document.querySelector('#nonfdi_type-wrapper')

const radioCommitment = document.querySelector('#fdi_3_label')

const sectorDropdown = document.querySelector('#sector')
const subSectorDropdown = document.querySelector('#subsector')
const subSectorDropdownWrapper = document.querySelector('#subsector-wrapper')

const createBusinessActivity = document.querySelector('#inv-add-business-activity')
const addBusinessActivity = document.querySelector('#addbusiness-wrapper')

const radioNdaNotSigned = document.querySelector('#ndasigned_no')
const radioSigned = document.querySelector('#ndasigned_yes')
const radioCanShareWrapper = document.querySelector('#invsubnda > fieldset')
const radioCanShare = document.querySelector('#inv-nda-unsigned_yes')
const textShareDetailsWrapper = document.querySelector('#anonymous_description-wrapper')
const radioCannotShare = document.querySelector('#inv-nda-unsigned_no')
const textNoShareDetailsWrapper = document.querySelector('#maynotshare-wrapper')

const month = document.querySelector('#land_month')
const year = document.querySelector('#land_year')

const now = new Date()
month.placeholder = now.getMonth() > 8 ? now.getMonth() + 1: '0' + (now.getMonth() + 1)
year.placeholder = now.getYear() + 1900

notClientRelationship.addEventListener('click', () => {
  trade.removeClass(differentclientrelationship, 'hidden')
}, true
)

clientRelationship.addEventListener('click', () => {
  trade.addClass(differentclientrelationship, 'hidden')
}, true
)

notReferralSource.addEventListener('click', () => {
  trade.removeClass(invReferralAltSourceWrapper, 'hidden')
})

referralSource.addEventListener('click', () => {
  trade.addClass(invReferralAltSourceWrapper, 'hidden')
})

createBusinessActivity.addEventListener('click', () => {
  trade.removeClass(addBusinessActivity, 'hidden')
})

referrerDropdown.addEventListener('change', (ev) => referHasSubs(ev.target.value))

function referHasSubs (id) {
  axios.get(`/api/investment/subreferrals/${id}`)
    .then((result) => {
      if (result.data.length > 0) {
        if (result.data[0].subreferral_type !== 'FILL_IN_BOX') {
          subReferDropdown.innerHTML = '<option value="-">Pick a value</option>'
          result.data.forEach((el) => {
            subReferDropdown.innerHTML += `<option value="${el.id}">${el.subreferral_type}</option>`
          })
          trade.removeClass(subReferWrapper, 'hidden')
        } else {
          trade.removeClass(eventWrapper, 'hidden')
        }
      } else {
        trade.addClass(subReferWrapper, 'hidden')
      }
    })
}

sectorDropdown.addEventListener('change', (ev) => sectorHasSubs(ev.target.value))

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

function updateSelectedStateDisplay () {
  /**
   * add the selected class to a checked fields label (for UI, do it here rather than in Nunjucks template)
   */
  // console.log('updateSelectedStateDisplay')
  let aRadioBtns = [].slice.call(document.querySelectorAll('input[type=radio][checked]'))
  aRadioBtns.forEach((input, i) => {
    let dParent = input.closest('label')
    if (dParent) {
      dParent.classList.add('selected')
      // console.log('dParent')
      // console.log(dParent)
    }
  })
}

radioFdi.addEventListener('focus', () => {
  trade.removeClass(fdiDropdownWrapper, 'hidden')
  trade.addClass(nonFdiDropdownWrapper, 'hidden')
}, true)

radioNonFdi.addEventListener('focus', () => {
  trade.addClass(fdiDropdownWrapper, 'hidden')
  trade.removeClass(nonFdiDropdownWrapper, 'hidden')
}, true)

radioCommitment.addEventListener('focus', () => {
  trade.addClass(fdiDropdownWrapper, 'hidden')
  trade.addClass(nonFdiDropdownWrapper, 'hidden')
}, true)

radioNdaNotSigned.addEventListener('click', () => {
  trade.removeClass(radioCanShareWrapper, 'hidden')
})

radioSigned.addEventListener('click', () => {
  trade.addClass(radioCanShareWrapper, 'hidden')
})

radioCanShare.addEventListener('click', () => {
  trade.addClass(textNoShareDetailsWrapper, 'hidden')
  trade.removeClass(textShareDetailsWrapper, 'hidden')
})

radioCannotShare.addEventListener('click', () => {
  trade.addClass(textShareDetailsWrapper, 'hidden')
  trade.removeClass(textNoShareDetailsWrapper, 'hidden')
})

document.addEventListener('DOMContentLoaded', updateSelectedStateDisplay)
