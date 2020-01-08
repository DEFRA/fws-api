const Db = require('../helpers/db')
const FwisPlus = require('../models/fwisPlus')
const Services = require('../helpers/services')
const unescape = require('lodash.unescape')

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
