const { EC2 } = require('@aws-sdk/client-ec2')
const { SNS } = require('@aws-sdk/client-sns')

const sns = new SNS()
const ec2 = new EC2()

module.exports = {
  email: {
    publishMessage: (messageLog) => {
      sns.publish({
        Subject: 'Failed FWIS warning message - ' + process.env.stage,
        Message: `Error: ${messageLog.errorMessage}, Date Created: ${messageLog.dateCreated}, Message: ${messageLog.fwsMessage}`,
        TopicArn: process.env.FWS_SNS_TOPIC
      })
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
      })
    }
  }
}
