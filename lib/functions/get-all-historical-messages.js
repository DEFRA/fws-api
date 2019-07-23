const Db = require('../helpers/db')
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

    const code = event.params.code
    console.log('Getting all historical messages for target area', event, code)
    const { rows } = await services.getAllHistoricalMessages()
    console.log('Got all historical messages for target area', code)
    await db.end()

    response.body = JSON.stringify(rows)

    return response
  } catch (err) {
    err.message = '[500] ' + err.message
    throw err
  }
}
