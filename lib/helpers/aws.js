const AWS = require('aws-sdk')

const sns = new AWS.SNS()
const ec2 = new AWS.EC2()

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
