const queries = require('../models/queries.json')

class Services {
  constructor (db) {
    this.db = db
  }

  getLastMessage (targetAreaCode) {
    return this.db.query(queries.getLastMessage, [targetAreaCode])
  }

  putMessage (message) {
    return this.db.query(queries.putMessage, [
      message.targetAreaCode, message.severity,
      message.severityValue, message.situation,
      message.situationChanged, message.severityChanged,
      message.created, message.createdById,
      message.createdByEmail, message.createdByName
    ])
  }

  getAllMessages () {
    return this.db.query(queries.getAllMessages)
  }

  getAllHistoricalMessages (targetAreaCode) {
    return this.db.query(queries.getAllMessages, [targetAreaCode])
  }

  getAllTargetAreas () {
    return this.db.query(queries.getAllTargetAreas)
  }

  clearDownNoLongerInForce () {
    return this.db.query(queries.clearDownNoLongerInForce)
  }

  errorLog (messageLog) {
    return this.db.query(queries.errorLog, [
      messageLog.dateCreated,
      messageLog.errorMessage,
      messageLog.fwsMessage
    ])
  }

  getApiKey (accountKey) {
    return this.db.query(queries.getApiKey, [accountKey])
  }
}

module.exports = Services
