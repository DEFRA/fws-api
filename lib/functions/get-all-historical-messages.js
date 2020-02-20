/**
 * lambda function to getAllHistoricalMessages using helpers such as db and services
 */
const Db = require('../helpers/db')
const FwisPlus = require('../models/fwisPlus')
const Services = require('../helpers/services')
const unescape = require('lodash.unescape')

/**
 * handler which uses services helper to getAllHistoricalMessages and return response
 * accordingly
 * @param event
 * @returns {Promise<{headers: {'Content-Type': string}, statusCode: number}>}
 */
module.exports.handler = async (event) => {
  try {
    const response = {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    }

    const db = new Db()
    const services = new Services(db)
    const code = event.pathParameters.code
    const { rows } = await services.getAllHistoricalMessages(code)
    await db.end()

    // unescape stuation text from the database
    rows.forEach(rows => {
      rows.situation = unescape(rows.situation)
    })

    const fwis = new FwisPlus(rows)
    response.body = fwis.getJson()

    return response
  } catch (err) {
    err.message = '[500] ' + err.message
    throw err
  }
}
