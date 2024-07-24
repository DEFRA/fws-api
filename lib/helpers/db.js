const { Pool } = require('pg')

let pool

class Db {
  constructor (test) {
    this.init(test)
  }

  init (test) {
    if (!test && (!pool || pool.ending)) {
      const dbUser = process.env.FWS_DB_USERNAME
      const dbHost = process.env.FWS_DB_HOST
      const dbName = process.env.FWS_DB_NAME
      const dbPassword = process.env.FWS_DB_PASSWORD
      const connectionString = `postgresql://${dbUser}:${dbPassword}@${dbHost}:5432/${dbName}`
      pool = new Pool({
        connectionString
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
