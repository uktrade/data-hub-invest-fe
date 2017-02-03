const express = require('express')
const interactionRepository = require('../repositorys/interactionrepository')
const controllerUtils = require('../lib/controllerutils')

const router = express.Router()

function index (req, res) {
  res.render('interaction/index')
}

function get (req, res) {
  const interactionId = req.params.interactionId
  if (!interactionId) {
    res.redirect('/')
  }

  interactionRepository.getInteraction(req.session.token, interactionId)
    .then((contact) => {
      res.json(contact)
    })
    .catch((error) => {
      const errors = error.error
      return res.status(error.response.statusCode).json({ errors })
    })
}

function post (req, res) {
  const interaction = Object.assign({ }, req.body.interaction)

  controllerUtils.flattenIdFields(interaction)
  controllerUtils.nullEmptyFields(interaction)
  controllerUtils.genCSRF(req, res)

  interactionRepository.saveInteraction(req.session.token, interaction)
    .then((data) => {
      res.json(data)
    })
    .catch((error) => {
      if (typeof error.error === 'string') {
        return res.status(error.response.statusCode).json({ errors: { detail: error.response.statusMessage } })
      }

      const errors = error.error
      return res.status(error.response.statusCode).json({ errors })
    })
}

router.get('/interaction/*', index)
router.get('/api/interaction/:interactionId', get)
router.post('/api/interaction', post)

module.exports = { router }
