'use strict'

const Joi = require('joi')

const processMessageEventSchema = Joi.object().required().keys({
  bodyXml: Joi.string().required().min(3)
})

module.exports = {
  processMessageEventSchema: processMessageEventSchema
}
