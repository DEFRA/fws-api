const xml2js = require('xml2js')
const Db = require('../helpers/db')
const Services = require('../helpers/services')
const Message = require('../models/message')
const awsHelper = require('../helpers/aws')

const AWS = require('aws-sdk')

module.exports.handler = async (event, context) => {
  let xmlResult
  try {
    const response = {
      statusCode: 200
    }
    // Stringify to surface carriage returns and replace \r\n with \n
    const fwsMessage = JSON.parse(JSON.stringify(event.bodyXml).replace(/\\r\\n/g, '\\n'))

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
    await message.save(xmlResult, event.profile)
    // close database pool
    await db.end()

    // Invoke lambda function to store warning alerts in S3 bucket

    const lambda = new AWS.Lambda({
      // endpoint: new AWS.Endpoint(process.env.FWS_API_URL)
      endpoint: new AWS.Endpoint('https://lambda.eu-west-1.amazonaws.com')
    })

    const params = {
      // FunctionName: process.env.FWS_ENV_NAME + process.env.FWS_SERVICE_NAME + '-putWarningsAlerts',
      FunctionName: 'devfws-putWarningsAlerts',
      InvocationType: 'Event',
      Payload: JSON.stringify({ TEST: 'Test' }) // TODO: fix object
    }

    await lambda.invoke(params, (err, data) => {
      if (err) console.log(err, err.stack)
      else console.log(data)
    })

    // End invoke lambda function

    return response
  } catch (err) {
    try {
      const messageLog = {
        fwsMessage: JSON.stringify(xmlResult),
        errorMessage: err.message,
        dateCreated: new Date().toISOString()
      }

      // send error log up to database
      const db = new Db()
      const services = new Services(db)
      await services.errorLog(messageLog)
      await db.end()

      // email error and add a db call for pushing error log to fws and email 'wandisupport@environment-agency.gov.uk
      await awsHelper.email.publishMessage(messageLog)

      throw err
    } catch (err) {
      err.message = '[500] ' + err.message
      throw err
    }
  }
}
