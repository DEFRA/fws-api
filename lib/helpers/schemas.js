'use strict'

const Joi = require('joi')

const processMessageEventSchema = Joi.object().required().keys({
  bodyXml: Joi.string().required()
})

module.exports = {
  processMessageEventSchema: processMessageEventSchema
}
