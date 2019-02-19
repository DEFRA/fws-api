const xml2js = require('xml2js')
const eventSchema = require('../helpers/schemas.js').processMessageEventSchema
const Joi = require('joi')
const Db = require('../helpers/db')
const Services = require('../helpers/services')
const Message = require('../models/message')

module.exports.handler = async (event) => {
  try {
    const response = {
      statusCode: 200,
      message: JSON.stringify('Message processed'),
      body: event.bodyXml.substring(0, 100) + '...'
    }

    // validate that the bodyxml coming in is there and is in a string format
    const { error } = Joi.validate(event, eventSchema)

    if (error) {
      throw error
    }

    // create the incoming fws message as a const
    const fwsMessage = event.bodyXml

    // console.log(fwsMessage)

    // use xml2js to parse it to json format
    const xmlResult = await new Promise((resolve, reject) => {
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
    const savedMessage = await message.save(xmlResult)

    await db.end()

    // build response body object
    response.body = {
      message: 'FWS message successfully stored for ' + savedMessage.targetAreaCode,
      targetAreaCode: savedMessage.targetAreaCode,
      severity: savedMessage.severity,
      severityValue: savedMessage.severityValue,
      situation: savedMessage.situation,
      situationChanged: savedMessage.situationChanged,
      severityChanged: savedMessage.severityChanged
    }

    // console.log(event)
    console.log(response)

    return response
  } catch (err) {
    console.log(err.message)
<<<<<<< HEAD

    // create email using SNS to alert that target area code doesnt match any in the database

    const response = {
      statusCode: 400,
      message: JSON.stringify('error'),
      body: event.bodyXml.substring(0, 100) + '...',
      error: err.message
    }
    return response
=======
    // create email using SNS to alert that target area code doesnt match any in the database
    throw err
>>>>>>> f5eaa9bcd4c70c85bac441f100eb64e2764e67be
  }
}
