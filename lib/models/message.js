'use strict'

const messageSchema = require('../helpers/schemas.js').validateMessage
const Joi = require('joi')
const ref = require('../helpers/severity.json')
const refLevel = require('../helpers/severityLevel.json')
const Db = require('../helpers/db')
const Services = require('../helpers/services')
const S3 = require('../helpers/s3')
const s3 = new S3()

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
      created: new Date().toISOString(),
      language: xmlResult.WarningMessage.$.language
    }

    // Validate Message
    try {
      await Joi.validate(message, messageSchema)
      // get the last message
      message.lastMessage = (await this.services.getLastMessage(message.targetAreaCode)).rows[0]
    } catch (err) {
      throw err
    }

    try {
      await this.services.putMessage(message)
      return message
    } catch (err) {
      console.log('error caught', err)

      // build error Log
      const messageLog = {
        targetAreaCode: xmlResult.WarningMessage.TargetAreaCode[0],
        approved: xmlResult.WarningMessage.$.approved,
        severity: xmlResult.WarningMessage.SeverityLevel[0],
        situation: xmlResult.WarningMessage.InternetSituation[0],
        language: xmlResult.WarningMessage.$.language
      }

      // send error log up to database
      const db = new Db()
      const services = new Services(db)
      await services.errorLog(messageLog)

      // email error and add a db call for pushing error log to fws and email 'wandisupport@environment-agency.gov.uk
      await s3.publishMessage()

      // this error to be caught by catch in process message
      throw err
    }
  }
}

module.exports = Message
