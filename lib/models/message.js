'use strict'

const queries = require('./queries.json')
const reference = require('../helpers/severity.json')

// function Message (xmlResult, db) {
//   let message = {
//     TargetAreaCode: xmlResult.WarningMessage.TargetAreaCode[0],
//     SeverityValue: xmlResult.WarningMessage.SeverityLevel[0],
//     Situation: xmlResult.WarningMessage.InternetSituation[0],
//     created: new Date().toISOString()
//   }

//   // get the last message
//   const lastMessage = await db.query(queries.getLastMessage, [message.TargetAreaCode])

//   Object.defineProperties(this, {
//     data: {
//       value: message
//     }
//   })
// }

const ref = reference

class Message {
  constructor (db) {
    this.db = db
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
    message.lastMessage = (await this.db.query(queries.getLastMessage, [message.TargetAreaCode])).rows[0]

    console.log(message)

    message = (await this.db.query(queries.putMessage, [message.TargetAreaCode, message.Severity, message.SeverityValue, message.Situation, message.SituationChanged, message.SeverityChanged, message.created]))

    return message
  }
}

module.exports = Message
