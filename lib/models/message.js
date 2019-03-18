'use strict'

const messageSchema = require('../helpers/schemas.js').validateMessage
const Joi = require('joi')
const ref = require('../helpers/severity.json')
const refLevel = require('../helpers/severityLevel.json')
const moment = require('moment')

class Message {
  constructor (services) {
    this.services = services
  }

  async save (xmlResult) {
    let message = {
      targetAreaCode: xmlResult.WarningMessage.TargetAreaCode[0],
      severity: ref[xmlResult.WarningMessage.SeverityLevel[0]],
      severityValue: refLevel[xmlResult.WarningMessage.SeverityLevel[0]],
      situation: xmlResult.WarningMessage.InternetSituation[0],
      situationChanged: moment(xmlResult.WarningMessage.$.approved, 'DD/MM/YYYY HH:mm').toISOString(),
      severityChanged: moment(xmlResult.WarningMessage.$.approved, 'DD/MM/YYYY HH:mm').toISOString(),
      created: new Date().toISOString(),
      language: xmlResult.WarningMessage.$.language
    }

    // Validate Message
    const { error } = Joi.validate(message, messageSchema)
    if (error) throw new Error(error)

    // get the last message
    message.lastMessage = (await this.services.getLastMessage(message.targetAreaCode)).rows[0]

    // if last message exists and severity hasnt changed set severity changed to last message values
    if (message.lastMessage !== undefined && JSON.stringify(message.severityValue) === message.lastMessage.severity_value) {
      message.severityChanged = message.lastMessage.severity_changed
    }

    // send message to the database
    await this.services.putMessage(message)
    return message
  }
}

module.exports = Message
