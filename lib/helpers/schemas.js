'use strict'

const Joi = require('joi')

// schema to validate incoming XML isnt blank and is a string
const processMessageEventSchema = Joi.object().required().keys({
  bodyXml: Joi.string().required()
})

// schema to check the xml has parsed and populated correctly
const validateMessage = Joi.object().required().keys({
  targetAreaCode: Joi.string().required(),
  severity: Joi.string().required(),
  severityValue: Joi.number().integer().min(1).max(4).required(),
  situation: Joi.string().required(),
  situationChanged: Joi.string().required(),
  severityChanged: Joi.string().required(),
  created: Joi.string().isoDate().required()
})

module.exports = {
  processMessageEventSchema,
  validateMessage
}
