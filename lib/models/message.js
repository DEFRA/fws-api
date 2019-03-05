'use strict'

const messageSchema = require('../helpers/schemas.js').validateMessage
const Joi = require('joi')
const ref = require('../helpers/severity.json')
const refLevel = require('../helpers/severityLevel.json')

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
      situationChanged: xmlResult.WarningMessage.$.approved,
      severityChanged: xmlResult.WarningMessage.$.approved,
      created: new Date().toISOString()
    }

    // Validate Message
    try {
      await Joi.validate(message, messageSchema)
    } catch (err) {
      throw err
    }
    // get the last message
    message.lastMessage = (await this.services.getLastMessage(message.targetAreaCode)).rows[0]

    try {
      await this.services.putMessage(message)
      return message
    } catch (err) {
      console.log('error caught', err)
      // if error is caught build http messageLog
      // const messageLog = {
      //   targetAreaCode: message.targetAreaCode,
      //   approved: message.situationChanged,
      //   severity: message.severity,
      //   situation: message.situation
      // }

      // this error to be caught by catch in process message
      throw err
    }
  }
}

module.exports = Message
