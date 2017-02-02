/* eslint new-cap: 0 */
const express = require('express')
const winston = require('winston')
const controllerUtils = require('../lib/controllerutils')
const contactRepository = require('../repositorys/contactrepository')

const router = express.Router()

function cleanErrors (errors) {
  if (errors.address_1 || errors.address_2 ||
    errors.address_town || errors.address_county ||
    errors.address_postcode || errors.address_country) {
    errors.registered_address = ['Invalid address']
    delete errors.address_1
    delete errors.address_2
    delete errors.address_town
    delete errors.address_county
    delete errors.address_postcode
    delete errors.address_country
  }
}

function index (req, res) {
  res.render('contact/index')
}

function get (req, res) {
  const contactId = req.params.contactId

  if (!contactId) {
    res.redirect('/')
  }

  contactRepository.getContact(req.session.token, contactId)
    .then((contact) => {
      res.json(contact)
    })
    .catch((error) => {
      const errors = error.error
      return res.status(400).json({ errors })
    })
}

function post (req, res) {
  // Flatten selected fields
  const contact = Object.assign({}, req.body.contact)

  controllerUtils.flattenIdFields(contact)
  controllerUtils.nullEmptyFields(contact)

  contact.telephone_countrycode = '+44'

  controllerUtils.genCSRF(req, res)

  contactRepository.saveContact(req.session.token, contact)
    .then((data) => {
      res.json(data)
    })
    .catch((error) => {
      if (typeof error.error === 'string') {
        return res.status(error.response.statusCode).json({ errors: { detail: error.response.statusMessage } })
      }

      const errors = error.error
      cleanErrors(errors)

      return res.status(error.response.statusCode).json({ errors })
    })
}

function archive (req, res) {
  controllerUtils.genCSRF(req, res)

  contactRepository.archiveContact(req.session.token, req.body.id, req.body.reason)
    .then((contact) => {
      res.json(contact)
    })
    .catch((error) => {
      winston.log('error', error)
      if (typeof error.error === 'string') {
        return res.status(error.response.statusCode).json({ errors: { detail: error.response.statusMessage } })
      }
      const errors = error.error
      cleanErrors(errors)
      return res.status(error.response.statusCode).json({ errors })
    })
}

function unarchive (req, res) {
  controllerUtils.genCSRF(req, res)

  contactRepository.unarchiveContact(req.session.token, req.body.id)
    .then((contact) => {
      res.json(contact)
    })
    .catch((error) => {
      winston.error('error', error)
      if (typeof error.error === 'string') {
        return res.status(error.response.statusCode).json({ errors: { detail: error.response.statusMessage } })
      }
      const errors = error.error
      cleanErrors(errors)
      return res.status(error.response.statusCode).json({ errors })
    })
}

router.get('/contact/*', index)
router.get('/api/contact/:contactId', get)
router.post('/api/contact', post)
router.post('/api/contact/archive', archive)
router.post('/api/contact/unarchive', unarchive)

module.exports = { router }
