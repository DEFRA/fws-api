'use strict'

const Db = require('../helpers/db')
const Services = require('../helpers/services')
const Fwis = require('../models/fwis')
const AWS = require('aws-sdk')

module.exports.handler = async (event, context) => {
  try {
    // Get all warnings and alerts

    const db = new Db()
    const services = new Services(db)
    await services.clearDownNoLongerInForce()
    const { rows } = await services.getAllMessages()
    await db.end()

    const fwis = new Fwis(rows)

    const s3 = new AWS.S3()

    const s3Params = {
      ACL: 'bucket-owner-full-control',
      Bucket: process.env.FWS_S3_WARNINGS_BUCKET,
      Key: 'fws/warnings-alerts.json',
      Body: fwis.getJson()
    }

    return s3.putObject(s3Params).promise()
  } catch (err) {
    return err.message
  }
}
