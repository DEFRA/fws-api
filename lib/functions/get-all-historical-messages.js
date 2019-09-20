const Db = require('../helpers/db')
const Fwis = require('../models/fwis')
const Services = require('../helpers/services')

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
    const fwis = new Fwis(rows)
    response.body = fwis.getJson()

    return response
  } catch (err) {
    err.message = '[500] ' + err.message
    throw err
  }
}
