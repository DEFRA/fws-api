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

    await this.services.putMessage(message)

    return message
  }
}

module.exports = Message
