const AWS = require('aws-sdk')
const sns = new AWS.SNS()

class S3 {
  publishMessage (messageLog) {
    return new Promise((resolve, reject) => {
      sns.publish({
        Subject: `Failed warning message - ${messageLog.errorMessage}`,
        Message: `Target Area Code: ${messageLog.targetAreaCode}, Approved: ${messageLog.approved}, Severity: ${messageLog.severity}, Situation: ${messageLog.situation} `,
        TopicArn: 'arn:aws:sns:eu-west-1:410384406042:devfws-topic'
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
