const Db = require('../helpers/db')
const Services = require('../helpers/services')
const Fwis = require('../models/fwis')

module.exports.handler = async (event) => {
  try {
    const response = {
      statusCode: 200,
      headers: {
        'Content-Type': event.resource
      }
    }

    const db = new Db()
    const services = new Services(db)
    let { rows } = await services.getAllMessages()
    await db.end()

    const fwis = new Fwis(rows)

    if (event.resource.indexOf('xml') > -1) {
      response.body = fwis.getXml()
      response.headers['Content-Type'] = 'application/xml'
    } else {
      response.body = fwis.getJson()
    }

    return response
  } catch (err) {
    throw err
  }
}
