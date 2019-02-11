module.exports.handler = async (event) => {
  const response = {
    statusCode: 200,
    headers: event
  }

  console.log(event)
  console.log(event['Content-Type'])

  if (event['Content-Type'] === 'application/xml') {
    response.body = JSON.stringify('<?xml version=\"1.0\" encoding=\"UTF-8\"?><test>true</test>')
  } else {
    response.body = JSON.stringify('{ "test": "true" }')
  }

  return response
}
