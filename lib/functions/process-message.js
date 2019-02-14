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
        if (err) reject(err)
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
      message: 'FWS message successfully stored for ' + savedMessage.TargetAreaCode,
      TargetAreaCode: savedMessage.TargetAreaCode,
      Severity: savedMessage.Severity,
      SeverityValue: savedMessage.SeverityValue,
      Situation: savedMessage.Situation,
      SituationChanged: savedMessage.SituationChanged,
      SeverityChanged: savedMessage.SeverityChanged
    }

    // console.log(event)
    console.log(response)

    return response
  } catch (err) {
    throw err
  }
}
