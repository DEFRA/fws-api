const AWS = require('aws-sdk')
const sns = new AWS.SNS()

class S3 {
  publishMessage (messageLog) {
    return new Promise((resolve, reject) => {
      sns.publish({
        Subject: `Failed warning message`,
        Message: `Error: ${messageLog.errorMessage}, Date Created: ${messageLog.dateCreated}, Message: ${messageLog.fwsMessage}`,
        TopicArn: process.env.FWS_SNS_TOPIC
      }, (err, data) => {
        if (err) {
          return reject(err)
        }
        return resolve(data)
      })
    })
  }
}

module.exports = S3
