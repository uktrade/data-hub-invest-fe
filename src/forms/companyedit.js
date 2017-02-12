/* eslint no-new: 0 */
const LookupAddress = require('./lookupaddress')
const radioHide = require('./radiohide')
require('./sectors')

if (document.querySelector('#registered-address-wrapper')) {
  new LookupAddress('#registered-address-wrapper')
}

new LookupAddress('#trading-address-wrapper')

radioHide('trading_address_same_as_registered', 'yes', '#trading-address-wrapper', true)
radioHide('is_headquarters', 'no', '#headquarters-type-wrapper', true)
