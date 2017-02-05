const axios = require('axios')
const { hide, show } = require('@uktrade/trade_elements').elementstuff

class LookupAddress {

  constructor (elementSelector) {
    this.cacheElements(elementSelector)
    this.suggestions = []
    this.addEvents()
    hide(this.addressPostcodeField.parentNode)
  }

  cacheElements (elementSelector) {
    const element = this.element = document.querySelector(elementSelector)
    this.postcodeLookupField = element.querySelector('.postcode-lookup-field')
    this.postcodeLookupButton = element.querySelector('.postcode-lookup-button')
    this.address1Field = element.querySelector('[name*="_address_1"]')
    this.address2Field = element.querySelector('[name*="_address_2"]')
    this.addressTownField = element.querySelector('[name*="_address_town"]')
    this.addressCountyField = element.querySelector('[name*="_address_county"]')
    this.addressPostcodeField = element.querySelector('[name*="_address_postcode"]')
    this.addressSuggestionsWrapper = element.querySelector('.form-group--address-suggestions select')
    this.addressSuggestionsDropdown = element.querySelector('.form-group--address-suggestions select')
  }

  addEvents () {
    this.postcodeLookupButton.addEventListener('click', this.pressLookupButton, true)
    this.addressSuggestionsDropdown.addEventListener('change', this.selectAddressSuggestion, true)
  }

  pressLookupButton = (event) => {
    const postcode = this.postcodeLookupField.value
    axios.get(`/api/postcodelookup/${postcode}`)
      .then((response) => {
        this.suggestions = response.data
        var html = '<option value="">Please select an address</option>'
        for (const index in this.suggestions) {
          const suggestion = this.suggestions[index]
          html += `<option value="${index}">${suggestion.address1}</option>`
        }
        this.addressSuggestionsDropdown.innerHTML = html
      })
  }

  selectAddressSuggestion = (event) => {
    if (event.target.value === '') {
      return
    }

    const index = parseInt(event.target.value)
    const suggestion = this.suggestions[index]
    this.address1Field.value = suggestion.address1
    this.address2Field.value = suggestion.address2
    this.addressTownField.value = suggestion.city
    this.addressCountyField.value = suggestion.county
    this.addressPostcodeField.value = suggestion.postcode
  }
}

module.exports = LookupAddress
