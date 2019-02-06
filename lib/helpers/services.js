const queries = require('../models/queries.json')

class Services {
  constructor (db) {
    this.db = db
  }

  getLastMessage (targetAreaCode) {
    return this.db.query(queries.getLastMessage, [targetAreaCode])
  }

  putMessage (message) {
    return this.db.query(queries.putMessage, [message.TargetAreaCode, message.Severity, message.SeverityValue, message.Situation, message.SituationChanged, message.SeverityChanged, message.created])
  }
}

module.exports = Services
