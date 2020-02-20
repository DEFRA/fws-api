/**
 * Db class for querying
 */
const { Pool } = require('pg')

let pool

class Db {
  /** @constructor
   * @param test
   */
  constructor (test) {
    this.init(test)
  }

  /**
   * intialisation using connectionString parsed from
   * env. variable FWS_DB_CONNECTION
   * @param test
   */
  init (test) {
    if (!test && (!pool || pool.ending)) {
      pool = new Pool({
        connectionString: process.env.FWS_DB_CONNECTION
      })
    }
  }

  /**
   * function to query database using passed query param
   * @param query
   * @param vars
   * @returns {*}
   */
  query (query, vars) {
    this.init()
    return pool.query(query, vars)
  }

  /**
   * function to end created db pool
    * @returns {Promise<unknown>}
   */
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
