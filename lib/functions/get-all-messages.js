const Db = require('../helpers/db')
const Services = require('../helpers/services')
const Fwis = require('../models/fwis')
const FwisPlus = require('../models/fwisPlus')

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
    const { rows } = await services.getAllMessages()
    await db.end()

    const fwis = event.resource === '/fwis-plus.json' ? new FwisPlus(rows) : new Fwis(rows)

    // Do we return xml or json?
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
