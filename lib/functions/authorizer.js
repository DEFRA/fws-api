<<<<<<< HEAD
module.exports.handler = (event, context, callback) => {        
  console.log('Received event:', JSON.stringify(event, null, 2));

  // Retrieve request parameters from the Lambda function input:
  var headers = event.headers;
  var queryStringParameters = event.queryStringParameters;
  var pathParameters = event.pathParameters;
  var stageVariables = event.stageVariables;
  var requestContext = event.requestContext;
      
  // Parse the input for the parameter values
  var tmp = event.methodArn.split(':');
  var apiGatewayArnTmp = tmp[5].split('/');
  var awsAccountId = tmp[4];
  var region = tmp[3];
  var restApiId = apiGatewayArnTmp[0];
  var stage = apiGatewayArnTmp[1];
  var method = apiGatewayArnTmp[2];
  var resource = '/'; // root resource
  if (apiGatewayArnTmp[3]) {
      resource += apiGatewayArnTmp[3];
  }
      
  // Perform authorization to return the Allow policy for correct parameters and 
  // the 'Unauthorized' error, otherwise.
  var authResponse = {};
  var condition = {};
  condition.IpAddress = {};
   
  if (headers.HeaderAuth1 === "headerValue1"
      && queryStringParameters.QueryString1 === "queryValue1"
      && stageVariables.StageVar1 === "stageValue1"
      && requestContext.accountId === "123456789012") {
      callback(null, generateAllow('me', event.methodArn));
  }  else {
      callback("Unauthorized");
  }
}
   
// Help function to generate an IAM policy
var generatePolicy = function(principalId, effect, resource) {
  // Required output:
  var authResponse = {};
  authResponse.principalId = principalId;
  if (effect && resource) {
      var policyDocument = {};
      policyDocument.Version = '2012-10-17'; // default version
      policyDocument.Statement = [];
      var statementOne = {};
      statementOne.Action = 'execute-api:Invoke'; // default action
      statementOne.Effect = effect;
      statementOne.Resource = resource;
      policyDocument.Statement[0] = statementOne;
      authResponse.policyDocument = policyDocument;
  }
  // Optional output with custom properties of the String, Number or Boolean type.
  authResponse.context = {
      "stringKey": "stringval",
      "numberKey": 123,
      "booleanKey": true
  };
  return authResponse;
}
   
var generateAllow = function(principalId, resource) {
  return generatePolicy(principalId, 'Allow', resource);
}
   
var generateDeny = function(principalId, resource) {
  return generatePolicy(principalId, 'Deny', resource);
=======
module.exports.handler = (event, context, callback) => {
  console.log('Received event:', JSON.stringify(event, null, 2))
  console.log(event.headers)
  return callback(null, generateAllow('me', event.methodArn))

  // Retrieve request parameters from the Lambda function input:
  // var headers = event.headers
  // var queryStringParameters = event.queryStringParameters
  // var pathParameters = event.pathParameters
  // var stageVariables = event.stageVariables
  // var requestContext = event.requestContext

  // // Parse the input for the parameter values
  // var tmp = event.methodArn.split(':')
  // var apiGatewayArnTmp = tmp[5].split('/')
  // var awsAccountId = tmp[4]
  // var region = tmp[3]
  // var restApiId = apiGatewayArnTmp[0]
  // var stage = apiGatewayArnTmp[1]
  // var method = apiGatewayArnTmp[2]
  // var resource = '/' // root resource
  // if (apiGatewayArnTmp[3]) {
  //   resource += apiGatewayArnTmp[3]
  // }

  // // Perform authorization to return the Allow policy for correct parameters and 
  // // the 'Unauthorized' error, otherwise.
  // var authResponse = {}
  // var condition = {}
  // condition.IpAddress = {}

  // // if (headers.HeaderAuth1 === "headerValue1"
  // //   && queryStringParameters.QueryString1 === "queryValue1"
  // //   && stageVariables.StageVar1 === "stageValue1"
  // //   && requestContext.accountId === "123456789012") {
  //   callback(null, generateAllow('me', event.methodArn))
  // // } else {
  // //   callback("Unauthorized")
  // // }
}

// Help function to generate an IAM policy
var generatePolicy = function (principalId, effect, resource) {
  // Required output:
  var authResponse = {}
  authResponse.principalId = principalId
  if (effect && resource) {
    var policyDocument = {}
    policyDocument.Version = '2012-10-17' // default version
    policyDocument.Statement = []
    var statementOne = {}
    statementOne.Action = 'execute-api:Invoke' // default action
    statementOne.Effect = effect
    statementOne.Resource = resource
    policyDocument.Statement[0] = statementOne
    authResponse.policyDocument = policyDocument
  }
  // Optional output with custom properties of the String, Number or Boolean type.
  authResponse.context = {
    "stringKey": "stringval",
    "numberKey": 123,
    "booleanKey": true
  }
  return authResponse
}

var generateAllow = function (principalId, resource) {
  return generatePolicy(principalId, 'Allow', resource)
}

var generateDeny = function (principalId, resource) {
  return generatePolicy(principalId, 'Deny', resource)
>>>>>>> ba27c86a8ba34fc3425f2d0ad69d98d5021cc3f9
}