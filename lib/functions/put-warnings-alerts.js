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
      // Bucket: process.env.FWS_S3_WARNINGS_BUCKET,
      Bucket: 'devlfps3bkt001',
      // Key: process.env.FWS_S3_WARNINGS_FOLDER + process.env.FWS_S3_WARNINGS_FILE,
      Key: 'fwfidata/ENT_7005/warnings-alerts.json',
      Body: fwis.getJson()
    }

    return new Promise((resolve, reject) => {
      s3.putObject(s3Params, (err, data) => {
        if (err) {
          reject(err)
        } else {
          resolve(data)
        }
      })
    })
  } catch (err) {
    return err.message
  }
}
