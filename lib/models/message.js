'use strict'

const queries = require('./queries.json')

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

class Message {
  constructor (db) {
    this.db = db
  }

  async save (xmlResult) {
    let message = {
      TargetAreaCode: xmlResult.WarningMessage.TargetAreaCode[0],
      SeverityValue: xmlResult.WarningMessage.SeverityLevel[0],
      Situation: xmlResult.WarningMessage.InternetSituation[0],
      created: new Date().toISOString()
    }

    // get the last message
    message.lastMessage = (await this.db.query(queries.getLastMessage, [message.TargetAreaCode])).rows[0]

    return message
  }
}

module.exports = Message
