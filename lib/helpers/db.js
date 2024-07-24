const { Pool } = require('pg')
const AWS = require('aws-sdk')
const secretsManager = new AWS.SecretsManager()

let pool

function getSecretValue (secretName, callback) {
  const params = {
    SecretId: secretName
  }

  secretsManager.getSecretValue(params, (err, data) => {
    if (err) {
      callback(err)
    } else {
      if ('SecretString' in data) {
        callback(null, data.SecretString)
      } else {
        const buff = new Buffer(data.SecretBinary, 'base64')
        callback(null, buff.toString('ascii'))
      }
    }
  })
}

class Db {
  constructor (test) {
    this.init(test)
  }

  init (test) {
    if (!test && (!pool || pool.ending)) {
      const dbUser = process.env.FWS_DB_USERNAME
      const dbHost = process.env.FWS_DB_HOST
      const dbName = process.env.FWS_DB_NAME
      const dbSecretName = process.env.FWS_DB_PASSWORD_SECRET_NAME

      getSecretValue(dbSecretName, (err, dbPassword) => {
        if (err) {
          console.error('Error retrieving secret:', err)
          return
        }

        const connectionString = `postgresql://${dbUser}:${dbPassword}@${dbHost}/${dbName}`
        pool = new Pool({
          connectionString
        })
      })
    }
  }

  query (query, vars) {
    this.init()
    return pool.query(query, vars)
  }

  async end () {
    return new Promise((resolve) => {
      if (pool && !pool.ending) {
        pool.end(() => {
          console.log('pool ended')
          return resolve()
        })
      } else {
        return resolve()
      }
    })
  }
}

module.exports = Db
