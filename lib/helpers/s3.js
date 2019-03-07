const AWS = require('aws-sdk')
const sns = new AWS.SNS()

class S3 {
  publishMessage () {
    return new Promise((resolve, reject) => {
      sns.publish({
        Message: 'this is a test message from fws-api',
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
