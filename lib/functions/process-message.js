const xml2js = require('xml2js')
const eventSchema = require('../helpers/schemas.js').processMessageEventSchema
const Joi = require('joi')
const Db = require('../helpers/db')
const Services = require('../helpers/services')
const Message = require('../models/message')
const S3 = require('../helpers/s3')
const s3 = new S3()

module.exports.handler = async (event) => {
  let xmlResult
  try {
    const response = {
      statusCode: 200,
      message: JSON.stringify('Message processed'),
      body: event.bodyXml.substring(0, 100) + '...'
    }

    // validate that the bodyxml coming in is there and is in a string format
    const { error } = Joi.validate(event, eventSchema)

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
    // if error is caught build http response
    const response = {
      statusCode: 400,
      message: JSON.stringify('error'),
      errorMessage: err.message
    }

    // if error is because targetAreaCode does not match one in DB add body in to response object
    if (err.message === 'insert or update on table "message" violates foreign key constraint "fk_tacode_message_target_area"') {
      response.body = event.bodyXml.substring(0, 100) + '...'
    }

    // build error Log
    const messageLog = {
      targetAreaCode: xmlResult.WarningMessage.TargetAreaCode[0],
      approved: xmlResult.WarningMessage.$.approved,
      severity: xmlResult.WarningMessage.SeverityLevel[0],
      situation: xmlResult.WarningMessage.InternetSituation[0],
      language: xmlResult.WarningMessage.$.language
    }

    // send error log up to database
    const db = new Db()
    const services = new Services(db)
    await services.errorLog(messageLog)

    // email error and add a db call for pushing error log to fws and email 'wandisupport@environment-agency.gov.uk
    await s3.publishMessage()

    // console.log(savedMessage)
    console.log(response)
    return response
  }
}
