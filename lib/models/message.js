'use strict'

const reference = require('../helpers/severity.json')
const ref = reference

class Message {
  constructor (services) {
    this.services = services
  }

  async save (xmlResult) {
    let message = {
      TargetAreaCode: xmlResult.WarningMessage.TargetAreaCode[0],
      Severity: ref[xmlResult.WarningMessage.SeverityLevel[0]],
      SeverityValue: xmlResult.WarningMessage.SeverityLevel[0],
      Situation: xmlResult.WarningMessage.InternetSituation[0],
      SituationChanged: xmlResult.WarningMessage.$.approved,
      SeverityChanged: xmlResult.WarningMessage.$.approved,
      created: new Date().toISOString()
    }

    // get the last message
    message.lastMessage = (await this.services.getLastMessage(message.TargetAreaCode)).rows[0]

    console.log(message)

    await this.services.putMessage(message)

    return message
  }
}

module.exports = Message
