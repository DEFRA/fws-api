const Lab = require('@hapi/lab')
const lab = exports.lab = Lab.script()
const Code = require('@hapi/code')
const sinon = require('sinon')
const { mockClient } = require('aws-sdk-client-mock')
const { SNSClient, PublishCommand } = require('@aws-sdk/client-sns')
const { EC2Client, DescribeInstancesCommand } = require('@aws-sdk/client-ec2')

const { email, ec2 } = require('../../lib/helpers/aws')

lab.describe('AWS Helper Tests', () => {
  const snsMock = mockClient(SNSClient)
  const ec2Mock = mockClient(EC2Client)

  lab.beforeEach(() => {
    process.env.stage = 'test'
    process.env.FWS_SNS_TOPIC = 'arn:aws:sns:region:account:topic'
    snsMock.reset()
    ec2Mock.reset()
  })

  lab.afterEach(() => {
    sinon.restore()
    delete process.env.stage
    delete process.env.FWS_SNS_TOPIC
  })

  lab.describe('email.publishMessage', () => {
    lab.it('verifies SNS publish is called once with correct parameters', async () => {
      // Setup mock response
      snsMock.on(PublishCommand).resolves({
        MessageId: 'test-message-id'
      })

      const messageLog = {
        errorMessage: 'Test Error',
        dateCreated: '2024-01-01',
        fwsMessage: 'Test Message'
      }

      await email.publishMessage(messageLog)

      // Verify the mock was called
      const publishCalls = snsMock.commandCalls(PublishCommand)
      Code.expect(publishCalls).to.have.length(1)

      // Get the parameters passed to publish
      const publishParams = publishCalls[0].args[0].input

      // Verify parameters
      Code.expect(publishParams.TopicArn).to.equal(process.env.FWS_SNS_TOPIC)
      Code.expect(publishParams.Subject).to.equal('Failed warning message - test')
      Code.expect(publishParams.Message).to.contain('Test Error')
      Code.expect(publishParams.Message).to.contain('2024-01-01')
      Code.expect(publishParams.Message).to.contain('Test Message')
    })
  })

  lab.describe('ec2.describeInstances', () => {
    lab.it('should describe EC2 instances with specified tag', async () => {
      // Setup mock response
      const mockResponse = {
        Reservations: [{
          Instances: [{
            InstanceId: 'i-1234567890abcdef0',
            State: { Name: 'running' }
          }]
        }]
      }

      ec2Mock.on(DescribeInstancesCommand).resolves(mockResponse)

      const tagId = 'test-instance'

      // Execute
      const result = await ec2.describeInstances(tagId)

      // Verify the mock was called
      const describeCalls = ec2Mock.commandCalls(DescribeInstancesCommand)
      Code.expect(describeCalls).to.have.length(1)

      // Verify parameters
      const describeParams = describeCalls[0].args[0].input
      Code.expect(describeParams).to.equal({
        Filters: [{
          Name: 'tag:ID',
          Values: [tagId]
        }]
      })

      Code.expect(result).to.equal(mockResponse)
    })
  })
})
