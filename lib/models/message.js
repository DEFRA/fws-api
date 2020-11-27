/**
 * Model used to generate message leveraging messageSchema
 */
'use strict'

const messageSchema = require('../helpers/schemas.js').validateMessage
const ref = require('../helpers/severity.json')
const refLevel = require('../helpers/severityLevel.json')
const moment = require('moment-timezone')
const escape = require('lodash.escape')

/**
 *
 */
class Message {
  /**
   * @param services
   */
  constructor (services) {
    this.services = services
  }

  /**
   * message object and validating the same using messageSchema followed by
   * saving the same using services
   * @param xmlResult
   * @param profile
   * @returns {Promise<{severity: *, createdByEmail: *, createdByName: *, severityValue: *, created, targetAreaCode: *, language, situation: *, situationChanged: string, createdById: *, severityChanged}>}
   */
  async save (xmlResult, profile) {
    const message = {
      targetAreaCode: xmlResult.WarningMessage.TargetAreaCode[0],
      severity: ref[xmlResult.WarningMessage.SeverityLevel[0]],
      severityValue: refLevel[xmlResult.WarningMessage.SeverityLevel[0]],
      situation: xmlResult.WarningMessage.InternetSituation[0],
      situationChanged: moment.tz(xmlResult.WarningMessage.$.approved, 'DD/MM/YYYY HH:mm', 'Europe/London').toISOString(),
      severityChanged: moment.tz(xmlResult.WarningMessage.$.approved, 'DD/MM/YYYY HH:mm', 'Europe/London').toISOString(),
      created: new Date().toISOString(),
      language: xmlResult.WarningMessage.$.language,
      createdById: profile && profile.id,
      createdByEmail: profile && profile.email,
      createdByName: profile && profile.name
    }

    // Validate Message
    const { error } = messageSchema.validate(message)
    if (error) throw new Error(error)

    // escape situation text
    message.situation = escape(message.situation)

    // get the last message
    message.lastMessage = (await this.services.getLastMessage(message.targetAreaCode)).rows[0]

    // if last message exists and severity hasnt changed set severity changed to last message values
    if (message.lastMessage !== undefined && JSON.stringify(message.severityValue) === message.lastMessage.severity_value) {
      message.severityChanged = message.lastMessage.severity_changed
    }

    // send message to the database
    await this.services.putMessage(message)

    return message
  }
}

module.exports = Message
