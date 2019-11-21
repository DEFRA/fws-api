const Joi = require('@hapi/joi')

// Script to check for the presence of environment variables before deploying the application
// Any variables added to fws-config project need to be added to here too.

const schema = Joi.object({
  env: Joi.string().valid('dev', 'tst', 'pre', 'prd', 'tra'),
  lambdaRole: Joi.string(),
  region: Joi.string(),
  bucket: Joi.string(),
  vpnSecGroup: Joi.string(),
  sub1: Joi.string(),
  sub2: Joi.string(),
  apiId: Joi.string(),
  rootId: Joi.string(),
  dbConnection: Joi.string(),
  snsTopic: Joi.string(),
  httpProxy: Joi.string(),
  feTag: Joi.string()
})

const result = schema.validate({
  env: process.env.FWS_ENV_NAME,
  lambdaRole: process.env.FWS_LAMBDA_ROLE,
  region: process.env.FWS_REGION,
  bucket: process.env.FWS_BUCKET,
  vpnSecGroup: process.env.FWS_VPN_SEC_GRP,
  sub1: process.env.FWS_SUB_1,
  sub2: process.env.FWS_SUB_2,
  apiId: process.env.FWS_API_ID,
  rootId: process.env.FWS_ROOT_ID,
  dbConnection: process.env.FWS_DB_CONNECTION,
  snsTopic: process.env.FWS_SNS_TOPIC,
  httpProxy: process.env.FWS_HTTP_PROXY,
  feTag: process.env.FWS_FE_TAG
})

if (result.error) {
  throw new Error('Config validation failed: ' + JSON.stringify(result.error))
}

console.log('Config is valid')
