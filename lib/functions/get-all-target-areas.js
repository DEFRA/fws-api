/**
 * lambda function to getAllTargetAreas using services
 */
const Db = require('../helpers/db')
const Services = require('../helpers/services')

/**
 * handler to getAllTargetAreas using services helper
 * returns 500 incase of error
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
    const { rows: targetAreas } = await services.getAllTargetAreas()
    await db.end()
    response.body = JSON.stringify(targetAreas)

    return response
  } catch (err) {
    err.message = '[500] ' + err.message
    throw err
  }
}
