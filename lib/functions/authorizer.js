const Db = require('../helpers/db')
const Services = require('../helpers/services')

module.exports.handler = async (event) => {
  const accountKey = event.headers['x-api-key']

  if (!accountKey) {
    console.log('[401] Unauthorised: missing credentials')
    return generateDeny('me', event.methodArn)
  }

  const db = new Db()
  const services = new Services(db)
  const { rows } = await services.getApiKey(accountKey)

  const auth = rows[0]

  if (auth) {
    // if the end point is messageprocess then they need write access otherwise read access is needed
    if (!(auth.read || auth.write)) {
      console.log('[403] Forbidden')
      return generateDeny('me', event.methodArn)
    }
    switch (event.resource) {
      // These resources require write permissions
      case '/message':
      case '/activate-target-area':
      case '/deactivate-target-area':
        if (auth.write) {
          return generateAllow('me', event.methodArn)
        } else {
          console.log('[403] Forbidden')
          return generateDeny('me', event.methodArn)
        }
      // Historical and target areas require read and write as they're only to be used by the FWIS management console
      case '/historical-messages/{code}':
      case '/target-areas.json':
        if (auth.write && auth.read) {
          return generateAllow('me', event.methodArn)
        } else {
          console.log('[403] Forbidden')
          return generateDeny('me', event.methodArn)
        }
      default:
        // Other wise read permission is required
        if (auth.read) {
          return generateAllow('me', event.methodArn)
        } else {
          console.log('[403] Forbidden')
          return generateDeny('me', event.methodArn)
        }
    }
  } else {
    console.log('[401] Unauthorised: not found')
    return generateDeny('me', event.methodArn)
  }
}

// Help function to generate an IAM policy
const generatePolicy = function (principalId, effect, resource) {
  // Required output:
  return {
    principalId: principalId,
    policyDocument: {
      Version: '2012-10-17', // default version
      Statement: [
        {
          Action: 'execute-api:Invoke', // default action
          Effect: effect,
          Resource: resource
        }
      ]
    }
  }
}

const generateAllow = function (principalId, resource) {
  return generatePolicy(principalId, 'Allow', resource)
}

const generateDeny = function (principalId, resource) {
  return generatePolicy(principalId, 'Deny', resource)
}
