'use strict'

const Joi = require('joi')

// schema to check the xml has parsed and populated correctly
const validateMessage = Joi.object().required().keys({
  targetAreaCode: Joi.string().max(50).required(),
  severity: Joi.string().required(),
  severityValue: Joi.number().integer().min(1).max(4).required(),
  situation: Joi.string().max(990).required(),
  situationChanged: Joi.string().required(),
  severityChanged: Joi.string().required(),
  created: Joi.string().isoDate().required(),
  language: Joi.string().regex(/^(English|english)$/).required()
})

module.exports = {
  validateMessage
}
