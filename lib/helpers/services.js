const queries = require('../models/queries.json')

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
    return this.db.query(queries.errorLog, [messageLog.approved, messageLog.targetAreaCode, messageLog.severity, messageLog.situation, messageLog.language])
  }

  getApiKey (accountId, accountKey) {
    return this.db.query(queries.getApiKey, [accountId, accountKey])
  }
}

module.exports = Services
