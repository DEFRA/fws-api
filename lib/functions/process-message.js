const xml2js = require('xml2js')
const Db = require('../helpers/db')
const Services = require('../helpers/services')
const Message = require('../models/message')
const aws = require('../helpers/aws')

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

    await db.end()

    // post to fws-api
    // need test here to confirm if local or on lambda
    // if (context && context.invokeid !== 'id') {
    //   let ips = []
    //   const { Reservations } = await aws.ec2.describeInstances(process.env.FWS_FE_TAG)
    //   Reservations.forEach(reservation => {
    //     reservation.Instances.forEach(instance => {
    //       if (instance.State.Code === 16) { // running: see https://docs.aws.amazon.com/AWSEC2/latest/APIReference/API_InstanceState.html
    //         ips.push(instance.PrivateIpAddress)
    //       }
    //     })
    //   })
    //   if (ips.length > 0) {
    //     for (let i = 0; i < ips.length; i++) {
    //       console.log('Posting to: ' + ips[i])
    //       await services.postUpdateWarnings(ips[i])
    //     }
    //   }
    // }

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
      db.end()

      // email error and add a db call for pushing error log to fws and email 'wandisupport@environment-agency.gov.uk
      await aws.email.publishMessage(messageLog)

      throw err
    } catch (err) {
      err.message = '[500] ' + err.message
      throw err
    }
  }
}
