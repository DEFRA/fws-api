const Db = require('../helpers/db')
const Services = require('../helpers/services')
const Fwis = require('../models/fwis')
const FwisPlus = require('../models/fwisPlus')
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
    console.time('clear down')
    await services.clearDownNoLongerInForce()
    console.timeEnd('clear down')
    console.time('getAllMessages')
    const { rows } = await services.getAllMessages()
    console.timeEnd('getAllMessages')
    await db.end()

    // unescape stuation text from the database
    console.time('escape situation text')
    rows.forEach(rows => {
      rows.situation = unescape(rows.situation)
    })
    console.timeEnd('escape situation text')
    console.time('fwis object')
    const fwis = event.resource === '/fwis-plus.json' ? new FwisPlus(rows) : new Fwis(rows)
    console.timeEnd('fwis object')
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
