module.exports.handler = async (event) => {
  const response = {
    statusCode: 200,
    message: JSON.stringify('Message processed')
  }

  const AwsEmail = require('../helpers/aws')
  const aws = new AwsEmail()

  await aws.publishMessage()

  return response
}
