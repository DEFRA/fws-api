/**
 * helper to interact with aws leveraging aws-sdk and httpsProxyAgent
 * services used from aws : sns, ec2
 */
const AWS = require('aws-sdk')
const HttpsProxyAgent = require('https-proxy-agent')
let sns, ec2
if (process.env.FWS_HTTP_PROXY && process.env.FWS_HTTP_PROXY !== 'undefined') {
  sns = new AWS.SNS({
    httpOptions: {
      agent: new HttpsProxyAgent(process.env.FWS_HTTP_PROXY)
    }
  })
  ec2 = new AWS.EC2({
    httpOptions: {
      agent: new HttpsProxyAgent(process.env.FWS_HTTP_PROXY)
    }
  })
} else {
  sns = new AWS.SNS()
  ec2 = new AWS.EC2()
}

module.exports = {
  email: {
    publishMessage: (messageLog) => {
      sns.publish({
        Subject: 'Failed warning message - ' + process.env.stage,
        Message: `Error: ${messageLog.errorMessage}, Date Created: ${messageLog.dateCreated}, Message: ${messageLog.fwsMessage}`,
        TopicArn: process.env.FWS_SNS_TOPIC
      }).promise()
    }
  },
  ec2: {
    describeInstances: (tag) => {
      return ec2.describeInstances({
        Filters: [
          {
            Name: 'tag:ID',
            Values: [
              tag
            ]
          }
        ]
      }).promise()
    }
  }
}
