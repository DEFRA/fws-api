const xml2js = require('xml2js')
const eventSchema = require('../helpers/schemas.js').processMessageEventSchema
const Joi = require('joi')
const Message = require('../models/message')

module.exports.handler = async (event) => {
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

  console.log(fwsMessage)

  // use xml2js to parse it to json format
  const xmlResult = await new Promise((resolve, reject) => {
    xml2js.parseString(fwsMessage, (err, value) => {
      if (err) reject(err)
      resolve(value)
    })
  })

  const message = new Message(xmlResult)

  // build response body object
  response.body = {
    message: 'FWS message successfully stored for ' + message.data.TargetAreaCode,
    TargetAreaCode: message.data.TargetAreaCode,
    SeverityValue: message.data.SeverityValue,
    Situation: message.data.Situation

  }

  // console.log(event)
  console.log('This one: ', response)

  return response
}
