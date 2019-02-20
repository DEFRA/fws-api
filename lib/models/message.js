'use strict'

const reference = require('../helpers/severity.json')
const ref = reference

class Message {
  constructor (services) {
    this.services = services
  }

  async save (xmlResult) {
    let message = {
      targetAreaCode: xmlResult.WarningMessage.TargetAreaCode[0],
      severity: ref[xmlResult.WarningMessage.SeverityLevel[0]],
      severityValue: xmlResult.WarningMessage.SeverityLevel[0],
      situation: xmlResult.WarningMessage.InternetSituation[0],
      situationChanged: xmlResult.WarningMessage.$.approved,
      severityChanged: xmlResult.WarningMessage.$.approved,
      created: new Date().toISOString()
    }

    // get the last message
    message.lastMessage = (await this.services.getLastMessage(message.targetAreaCode)).rows[0]

    console.log(message)

    try {
      await this.services.putMessage(message)
      return message
    } catch (err) {
      console.log('error caught', err)
      // if error is caught build http messageLog
      const messageLog = {
        targetAreaCode: message.targetAreaCode,
        approved: message.situationChanged,
        severity: message.severity,
        situation: message.situation
      }

      // need to add a db call for pushing error log to fws and email 'wandisupport@environment-agency.gov.uk

      // this error to be caught by catch in process message
      throw err
    }
  }
}

module.exports = Message
