'use strict'

const handler = require('../../lib/functions/authorizer').handler
const event = require('../data/events/authorizer.json')

const Services = require('../../lib/helpers/services')

const scenarios = [{
  resource: '/message',
  tests: [{
    keys: false,
    keysMatch: false,
    result: 'Deny'
  }, {
    keys: true,
    keysMatch: false,
    result: 'Deny'
  }, {
    keys: true,
    keysMatch: true,
    read: true,
    write: false,
    result: 'Deny'
  }, {
    keys: true,
    keysMatch: true,
    read: true,
    write: true,
    result: 'Allow'
  }, {
    keys: true,
    keysMatch: true,
    read: false,
    write: false,
    result: 'Deny'
  }, {
    keys: true,
    keysMatch: true,
    read: false,
    write: true,
    result: 'Allow'
  }]
}, {
  resource: '/activate-target-area',
  tests: [{
    keys: false,
    keysMatch: false,
    result: 'Deny'
  }, {
    keys: true,
    keysMatch: false,
    result: 'Deny'
  }, {
    keys: true,
    keysMatch: true,
    read: true,
    write: false,
    result: 'Deny'
  }, {
    keys: true,
    keysMatch: true,
    read: true,
    write: true,
    result: 'Allow'
  }, {
    keys: true,
    keysMatch: true,
    read: false,
    write: false,
    result: 'Deny'
  }, {
    keys: true,
    keysMatch: true,
    read: false,
    write: true,
    result: 'Allow'
  }]
}, {
  resource: '/deactivate-target-area',
  tests: [{
    keys: false,
    keysMatch: false,
    result: 'Deny'
  }, {
    keys: true,
    keysMatch: false,
    result: 'Deny'
  }, {
    keys: true,
    keysMatch: true,
    read: true,
    write: false,
    result: 'Deny'
  }, {
    keys: true,
    keysMatch: true,
    read: true,
    write: true,
    result: 'Allow'
  }, {
    keys: true,
    keysMatch: true,
    read: false,
    write: false,
    result: 'Deny'
  }, {
    keys: true,
    keysMatch: true,
    read: false,
    write: true,
    result: 'Allow'
  }]
}, {
  resource: '/fwis.json',
  tests: [{
    keys: false,
    keysMatch: false,
    result: 'Deny'
  }, {
    keys: true,
    keysMatch: false,
    result: 'Deny'
  }, {
    keys: true,
    keysMatch: true,
    read: true,
    write: false,
    result: 'Allow'
  }, {
    keys: true,
    keysMatch: true,
    read: true,
    write: true,
    result: 'Allow'
  }, {
    keys: true,
    keysMatch: true,
    read: false,
    write: false,
    result: 'Deny'
  }, {
    keys: true,
    keysMatch: true,
    read: false,
    write: true,
    result: 'Deny'
  }]
}, {
  resource: '/fwis.xml',
  tests: [{
    keys: false,
    keysMatch: false,
    result: 'Deny'
  }, {
    keys: true,
    keysMatch: false,
    result: 'Deny'
  }, {
    keys: true,
    keysMatch: true,
    read: true,
    write: false,
    result: 'Allow'
  }, {
    keys: true,
    keysMatch: true,
    read: true,
    write: true,
    result: 'Allow'
  }, {
    keys: true,
    keysMatch: true,
    read: false,
    write: false,
    result: 'Deny'
  }, {
    keys: true,
    keysMatch: true,
    read: false,
    write: true,
    result: 'Deny'
  }]
}, {
  resource: '/target-areas.json',
  tests: [{
    keys: false,
    keysMatch: false,
    result: 'Deny'
  }, {
    keys: true,
    keysMatch: false,
    result: 'Deny'
  }, {
    keys: true,
    keysMatch: true,
    read: true,
    write: false,
    result: 'Deny'
  }, {
    keys: true,
    keysMatch: true,
    read: true,
    write: true,
    result: 'Allow'
  }, {
    keys: true,
    keysMatch: true,
    read: false,
    write: false,
    result: 'Deny'
  }, {
    keys: true,
    keysMatch: true,
    read: false,
    write: true,
    result: 'Deny'
  }]
}, {
  resource: '/historical-messages/{code}',
  tests: [{
    keys: false,
    keysMatch: false,
    result: 'Deny'
  }, {
    keys: true,
    keysMatch: false,
    result: 'Deny'
  }, {
    keys: true,
    keysMatch: true,
    read: true,
    write: false,
    result: 'Deny'
  }, {
    keys: true,
    keysMatch: true,
    read: true,
    write: true,
    result: 'Allow'
  }, {
    keys: true,
    keysMatch: true,
    read: false,
    write: false,
    result: 'Deny'
  }, {
    keys: true,
    keysMatch: true,
    read: false,
    write: true,
    result: 'Deny'
  }]
}]

describe('functions/get-all-messages', () => {
  beforeEach(() => {
    // setup mocks
    jest.spyOn(Services.prototype, 'getApiKey').mockImplementation((accountId, accountKey) => {
      return Promise.resolve({
        rows: []
      })
    })
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('run through permission tests', async () => {
    for (let i = 0; i < scenarios.length; i++) {
      for (let ii = 0; ii < scenarios[i].tests.length; ii++) {
        const scenario = scenarios[i]
        const test = scenarios[i].tests[ii]
        console.log(scenario.resource + ' | ' + JSON.stringify(test))
        event.resource = scenario.resource
        // keys
        if (test.keys) {
          event.headers['x-api-account-id'] = 'test'
          event.headers['x-api-key'] = 'test-key'
        } else {
          delete event.headers['x-api-account-id']
          delete event.headers['x-api-key']
        }

        const dbReturn = []

        if (test.keysMatch) {
          dbReturn[0] = {
            read: test.read,
            write: test.write
          }
        }

        jest.spyOn(Services.prototype, 'getApiKey').mockImplementation((accountId, accountKey) => {
          return Promise.resolve({
            rows: dbReturn
          })
        })

        const response = await handler(event)
        // do try .. catch around expect as need to concatenate the scenario to err message
        try {
          expect(response.policyDocument.Statement[0].Effect).toEqual(test.result)
        } catch (err) {
          err.message = scenario.resource + ' | ' + JSON.stringify(test) + ' | ' + err.message
          throw err
        }
      }
    }
  })

  it('case insensitive headers', async () => {
    deleteApiEventProperties()
    event.headers['X-Api-Account-Id'] = 'test'
    event.headers['X-Api-Key'] = 'test'
    event.resource = '/message'
    jest.spyOn(Services.prototype, 'getApiKey').mockImplementation((accountId, accountKey) => {
      return Promise.resolve({
        rows: [{
          read: false,
          write: true
        }]
      })
    })

    const response = await handler(event)
    expect(response.policyDocument.Statement[0].Effect).toEqual('Allow')

    deleteApiEventProperties()
    event.headers['X-API-ACCOUNT-ID'] = 'test'
    event.headers['X-API-KEY'] = 'test'
    event.resource = '/message'

    const response2 = await handler(event)
    expect(response2.policyDocument.Statement[0].Effect).toEqual('Allow')
    deleteApiEventProperties()
  })

  it('missing keys', async () => {
    event.headers['x-api-account-id'] = 'test'
    delete event.headers['x-api-key']

    const response = await handler(event)
    expect(response.policyDocument.Statement[0].Effect).toEqual('Deny')

    delete event.headers['x-api-account-id']
    event.headers['x-api-key'] = 'test'

    const response2 = await handler(event)
    expect(response2.policyDocument.Statement[0].Effect).toEqual('Deny')
  })

  it('thrown error from database', async () => {
    jest.spyOn(Services.prototype, 'getApiKey').mockImplementation((accountId, accountKey) => {
      throw new Error('DB test error')
    })
    event.headers['x-api-account-id'] = 'test'
    event.headers['x-api-key'] = 'test'

    await expect(handler(event)).rejects.toThrow()
  })
})

function deleteApiEventProperties () {
  const xApiAccountIdHeaders = Object.keys(event.headers).filter(header => header.toLowerCase() === 'x-api-account-id-headers')
  const xApiKeyHeaders = Object.keys(event.headers).filter(header => header.toLowerCase() === 'x-api-key-headers')
  xApiAccountIdHeaders?.forEach(header => delete event.headers(header))
  xApiKeyHeaders?.forEach(header => delete event.headers(header))
  delete event.resource
}
