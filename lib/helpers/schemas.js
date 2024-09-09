'use strict'

const Joi = require('joi')

// schema to check the xml has parsed and populated correctly
const validateMessage = Joi.object({
  targetAreaCode: Joi.string().max(50).required(),
  severity: Joi.string().required(),
  severityValue: Joi.number().integer().min(1).max(5).required(),
  situation: Joi.string().required().when('severityValue', { is: Joi.number().valid(5), then: Joi.allow('') }),
  situationChanged: Joi.string().isoDate().required(),
  severityChanged: Joi.string().isoDate().required(),
  created: Joi.string().isoDate().required(),
  language: Joi.string().regex(/^(English|english)$/).required(),
  createdById: Joi.string().uuid(),
  createdByEmail: Joi.string().email(),
  createdByName: Joi.string()
})

module.exports = {
  validateMessage
}
