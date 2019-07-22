'use strict'

const Lab = require('@hapi/lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const handler = require('../../lib/functions/authorizer').handler
const event = require('../data/authorizer.json')

const Services = require('../../lib/helpers/services')

const sinon = require('sinon').createSandbox()

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
}]

lab.experiment('functions/get-all-messages', () => {
  lab.beforeEach(() => {
    // setup mocks
    sinon.stub(Services.prototype, 'getApiKey').callsFake((accountId, accountKey) => {
      return Promise.resolve({
        rows: []
      })
    })
  })

  lab.afterEach(() => {
    sinon.restore()
  })

  lab.test('run through permission tests', async () => {
    for (let i = 0; i < scenarios.length; i++) {
      for (let ii = 0; ii < scenarios[i].tests.length; ii++) {
        Services.prototype.getApiKey.restore()
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

        sinon.stub(Services.prototype, 'getApiKey').callsFake((accountId, accountKey) => {
          return Promise.resolve({
            rows: dbReturn
          })
        })

        const response = await handler(event)
        // do try .. catch around expect as need to concatenate the scenario to err message
        try {
          Code.expect(response.policyDocument.Statement[0].Effect).to.equal(test.result)
        } catch (err) {
          err.message = scenario.resource + ' | ' + JSON.stringify(test) + ' | ' + err.message
          throw err
        }
      }
    }
  })

  lab.test('missing keys', async () => {
    event.headers['x-api-account-id'] = 'test'
    delete event.headers['x-api-key']

    const response = await handler(event)
    Code.expect(response.policyDocument.Statement[0].Effect).to.equal('Deny')

    delete event.headers['x-api-account-id']
    event.headers['x-api-key'] = 'test'

    const response2 = await handler(event)
    Code.expect(response2.policyDocument.Statement[0].Effect).to.equal('Deny')
  })

  lab.test('thrown error from database', async () => {
    Services.prototype.getApiKey.restore()
    sinon.stub(Services.prototype, 'getApiKey').callsFake((accountId, accountKey) => {
      throw new Error('DB test error')
    })
    event.headers['x-api-account-id'] = 'test'
    event.headers['x-api-key'] = 'test'

    await Code.expect(handler(event)).to.reject()
  })
})
