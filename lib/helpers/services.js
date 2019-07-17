const queries = require('../models/queries.json')
// const wreck = require('wreck').defaults({
//   timeout: 5000
// })

class Services {
  constructor (db) {
    this.db = db
  }

  getLastMessage (targetAreaCode) {
    return this.db.query(queries.getLastMessage, [targetAreaCode])
  }

  putMessage (message) {
    return this.db.query(queries.putMessage, [message.targetAreaCode, message.severity, message.severityValue, message.situation, message.situationChanged, message.severityChanged, message.created])
  }

  getAllMessages () {
    return this.db.query(queries.getAllMessages)
  }

  clearDownNoLongerInForce () {
    return this.db.query(queries.clearDownNoLongerInForce)
  }

  errorLog (messageLog) {
    return this.db.query(queries.errorLog, [messageLog.dateCreated, messageLog.errorMessage, messageLog.fwsMessage])
  }

  getApiKey (accountKey) {
    return this.db.query(queries.getApiKey, [accountKey])
  }

  // postUpdateWarnings (ip) {
  //   return wreck.post('http://' + ip + ':3000/api/update-warnings')
  // }
}

module.exports = Services
