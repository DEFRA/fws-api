const { mockClient } = require('aws-sdk-client-mock')
const { SNSClient, PublishCommand } = require('@aws-sdk/client-sns')
const { EC2Client, DescribeInstancesCommand } = require('@aws-sdk/client-ec2')

const { email, ec2 } = require('../../lib/helpers/aws')

describe('AWS Helper Tests', () => {
  const snsMock = mockClient(SNSClient)
  const ec2Mock = mockClient(EC2Client)

  beforeEach(() => {
    process.env.stage = 'test'
    process.env.FWS_SNS_TOPIC = 'arn:aws:sns:region:account:topic'
    snsMock.reset()
    ec2Mock.reset()
  })

  afterEach(() => {
    jest.restoreAllMocks()
    delete process.env.stage
    delete process.env.FWS_SNS_TOPIC
  })

  describe('email.publishMessage', () => {
    it('verifies SNS publish is called once with correct parameters', async () => {
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
      expect(publishCalls).toBeArrayOfSize(1)

      // Get the parameters passed to publish
      const publishParams = publishCalls[0].args[0].input

      // Verify parameters
      expect(publishParams.TopicArn).toEqual(process.env.FWS_SNS_TOPIC)
      expect(publishParams.Subject).toEqual('Failed FWIS warning message - test')
      expect(publishParams.Message).toInclude('Test Error')
      expect(publishParams.Message).toInclude('2024-01-01')
      expect(publishParams.Message).toInclude('Test Message')
    })
  })

  describe('ec2.describeInstances', () => {
    it('should describe EC2 instances with specified tag', async () => {
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
      expect(describeCalls).toBeArrayOfSize(1)

      // Verify parameters
      const describeParams = describeCalls[0].args[0].input
      expect(describeParams).toEqual({
        Filters: [{
          Name: 'tag:ID',
          Values: [tagId]
        }]
      })

      expect(result).toEqual(mockResponse)
    })
  })
})
