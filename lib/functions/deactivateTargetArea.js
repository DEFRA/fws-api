module.exports.handler = async (event) => {
  const response = {
    statusCode: 200,
    message: JSON.stringify('Message processed'),
    body: event.bodyXml.substring(0, 100) + '...'
  }

  console.log(event)

  return response
}
