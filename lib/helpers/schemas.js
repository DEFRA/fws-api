'use strict'

const Joi = require('joi')

const MAX_TARGET_AREA_CODE_LENGTH = 50
const MAX_SEVERITY_VALUE = 5
const MIN_SEVERITY_VALUE = 1

// schema to check the xml has parsed and populated correctly
const validateMessage = Joi.object({
  targetAreaCode: Joi.string().max(MAX_TARGET_AREA_CODE_LENGTH).required(),
  severity: Joi.string().required(),
  severityValue: Joi.number().integer().min(MIN_SEVERITY_VALUE).max(MAX_SEVERITY_VALUE).required(),
  situation: Joi.string().required().when('severityValue', { is: Joi.number().valid(MAX_SEVERITY_VALUE), then: Joi.allow('') }),
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
