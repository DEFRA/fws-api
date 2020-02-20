/**
 *Service layer for interating with db based on the business requirement
 * uses db helper and queries model
 */
const queries = require('../models/queries.json')

/**
 * Services class
 */
class Services {
  /**
   * @constructor
   * @param db
   */
  constructor (db) {
    this.db = db
  }

  /**
   *function to get the ast message based on the targetAreaCode
    * @param targetAreaCode
   * @returns {*}
   */
  getLastMessage (targetAreaCode) {
    return this.db.query(queries.getLastMessage, [targetAreaCode])
  }

  /**
   *function to insert message in db
   * @param message
   * @returns {*}
   */
  putMessage (message) {
    return this.db.query(queries.putMessage, [
      message.targetAreaCode, message.severity,
      message.severityValue, message.situation,
      message.situationChanged, message.severityChanged,
      message.created, message.createdById,
      message.createdByEmail, message.createdByName
    ])
  }

  /**
   *function to get all the message using db
   * @returns {*}
   */
  getAllMessages () {
    return this.db.query(queries.getAllMessages)
  }

  /**
   *function to get all the get all historical messages
   * @param targetAreaCode
   * @returns {*}
   */
  getAllHistoricalMessages (targetAreaCode) {
    return this.db.query(queries.getHistoricMessages, [targetAreaCode])
  }

  /**
   *function to get all target areas
   * @returns {*}
   */
  getAllTargetAreas () {
    return this.db.query(queries.getAllTargetAreas)
  }

  /**
   * functions to clear down old/unused message
   * @returns {*}
   */
  clearDownNoLongerInForce () {
    return this.db.query(queries.clearDownNoLongerInForce)
  }

  /**
   *function to log errorMessage in the db
   * @param messageLog
   * @returns {*}
   */
  errorLog (messageLog) {
    return this.db.query(queries.errorLog, [
      messageLog.dateCreated,
      messageLog.errorMessage,
      messageLog.fwsMessage
    ])
  }

  /**
   *function to get the api key
   * @param accountKey
   * @returns {*}
   */
  getApiKey (accountKey) {
    return this.db.query(queries.getApiKey, [accountKey])
  }
}

module.exports = Services
