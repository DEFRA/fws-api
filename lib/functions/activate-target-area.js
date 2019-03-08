module.exports.handler = async (event) => {
  const response = {
    statusCode: 200,
    message: JSON.stringify('Message processed')
  }

  const S3 = require('../helpers/s3')
  const s3 = new S3()

  await s3.publishMessage()

  return response
}
