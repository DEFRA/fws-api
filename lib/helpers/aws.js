const AWS = require('aws-sdk')
const HttpsProxyAgent = require('https-proxy-agent')
let sns
if (process.env.FWS_HTTP_PROXY && process.env.FWS_HTTP_PROXY !== 'undefined') {
  sns = new AWS.SNS({
    httpOptions: {
      agent: new HttpsProxyAgent(process.env.FWS_HTTP_PROXY)
    }
  })
} else {
  sns = new AWS.SNS()
}

class AwsEmail {
  publishMessage (messageLog) {
    return new Promise((resolve, reject) => {
      sns.publish({
        Subject: 'Failed warning message - ' + process.env.FWS_ENV_NAME,
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

module.exports = AwsEmail
