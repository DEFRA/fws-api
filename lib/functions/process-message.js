const xml2js = require('xml2js')
const Db = require('../helpers/db')
const Services = require('../helpers/services')
const Message = require('../models/message')
const S3 = require('../helpers/s3')
const s3 = new S3()

module.exports.handler = async (event) => {
  let xmlResult
  try {
    const response = {
      statusCode: 200
    }
    // create the incoming fws message as a const
    const fwsMessage = event.bodyXml

    // use xml2js to parse it to json format
    xmlResult = await new Promise((resolve, reject) => {
      xml2js.parseString(fwsMessage, (err, value) => {
        if (err) return reject(err)
        resolve(value)
      })
    })

    // build message object based on model
    // initiate database
    const db = new Db()
    // initiate services with database
    const services = new Services(db)
    // initiate message with services
    const message = new Message(services)
    // save message
    await message.save(xmlResult)

    await db.end()

    // console.log(event)
    console.log(response)
    return response
  } catch (err) {
    try {
      let messageLog = {
        fwsMessage: JSON.stringify(xmlResult),
        errorMessage: err.message,
        dateCreated: new Date().toISOString()
      }

      // send error log up to database
      const db = new Db()
      const services = new Services(db)
      await services.errorLog(messageLog)
      db.end()

      // email error and add a db call for pushing error log to fws and email 'wandisupport@environment-agency.gov.uk
      await s3.publishMessage(messageLog)

      throw err
    } catch (err) {
      throw err
    }
  }
}
