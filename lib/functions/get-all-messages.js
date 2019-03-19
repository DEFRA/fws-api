const Db = require('../helpers/db')
const Services = require('../helpers/services')
const Fwis = require('../models/fwis')

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
    await services.clearDownNoLongerInForce()
    let { rows } = await services.getAllMessages()
    await db.end()

    // stringify and parse converts dates in to ISO 8601 ><
    const fwis = new Fwis(JSON.parse(JSON.stringify(rows)))

    if (event.resource.indexOf('xml') > -1) {
      response.body = fwis.getXml()
      response.headers['Content-Type'] = 'application/xml'
    } else {
      response.body = fwis.getJson()
    }

    return response
  } catch (err) {
    err.message = '[500] ' + err.message
    throw err
  }
}
