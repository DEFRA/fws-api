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
    // if error is caught build http response
    // create messageLog with blank fields and log the time
    let messageLog = {}
    // build error mesageLog based on error message
    if (err.message === 'ValidationError: child "bodyXml" fails because ["bodyXml" is required]') {
      messageLog = {
        targetAreaCode: '',
        approved: '',
        severity: '',
        situation: '',
        language: '',
        errorMessage: 'failed warning message cannot commit to database',
        dateCreated: new Date().toISOString()
      }
      // email error and add a db call for pushing error log to fws and email 'wandisupport@environment-agency.gov.uk
      await s3.publishMessage(messageLog)

      // if error is caught build http response
      const response = {
        statusCode: 400
      }

      // console.log(savedMessage)
      console.log(response)
      return response
      // else continue if
    } else if (err.message === 'insert or update on table "message" violates foreign key constraint "fk_tacode_message_target_area"') {
      messageLog.errorMessage = 'Failed warning message - missing TA data'
    } else if (err.message === `ValidationError: child "language" fails because ["language" with value "${xmlResult.WarningMessage.$.language}" fails to match the required pattern: /^(English|english)$/]`) {
      messageLog.errorMessage = 'Failed warning message - wrong language'
    } else if (err.message === 'getaddrinfo ENOTFOUND fws-dev-rds.aws-int.defra.cloud fws-dev-rds.aws-int.defra.cloud:5432') {
      messageLog.errorMessage = 'failed warning message cannot commit to database'
    } else {
      messageLog.errorMessage = 'failed warning message missing data'
    }

    messageLog.targetAreaCode = xmlResult.WarningMessage.TargetAreaCode[0]
    messageLog.approved = xmlResult.WarningMessage.$.approved
    messageLog.severity = xmlResult.WarningMessage.SeverityLevel[0]
    messageLog.situation = xmlResult.WarningMessage.InternetSituation[0]
    messageLog.language = xmlResult.WarningMessage.$.language
    messageLog.dateCreated = new Date().toISOString()

    // send error log up to database
    const db = new Db()
    const services = new Services(db)
    await services.errorLog(messageLog)

    // email error and add a db call for pushing error log to fws and email 'wandisupport@environment-agency.gov.uk
    await s3.publishMessage(messageLog)

    // if error is caught build http response
    const response = {
      statusCode: 400
    }

    // console.log(savedMessage)
    console.log(response)
    return response
  }
}
