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

    console.log('Getting all target areas')
    const { rows: targetAreas } = await services.getAllTargetAreas()
    console.log('Got all target areas', targetAreas)

    await db.end()

    response.body = targetAreas

    return response
  } catch (err) {
    console.error(err)
    err.message = '[500] ' + err.message
    throw err
  }
}
