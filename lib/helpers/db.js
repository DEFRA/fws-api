const { Pool } = require('pg')

let pool

class Db {
  constructor (test) {
    this.init(test)
  }

  init (test) {
    if (!test && (!pool || pool.ending)) {
      pool = new Pool({
        connectionString: process.env.FWS_DB_CONNECTION
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
