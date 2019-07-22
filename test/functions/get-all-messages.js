'use strict'

const Lab = require('@hapi/lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const handler = require('../../lib/functions/get-all-messages').handler
const eventJson = require('../data/get-all-messages-json.json')
const eventXml = require('../data/get-all-messages-xml.json')
const Services = require('../../lib/helpers/services')

const sinon = require('sinon').createSandbox()

lab.experiment('functions/get-all-messages', () => {
  lab.beforeEach(() => {
    // setup mocks
    sinon.stub(Services.prototype, 'getAllMessages').callsFake(() => {
      return Promise.resolve({
        rows: []
      })
    })
    sinon.stub(Services.prototype, 'clearDownNoLongerInForce').callsFake(() => {
      return Promise.resolve({})
    })
  })

  lab.afterEach(() => {
    sinon.restore()
  })

  lab.test('get all messages json function', async () => {
    const response = await handler(eventJson)
    Code.expect(response.statusCode).to.equal(200)
    Code.expect(response.headers['Content-Type']).to.equal('application/json')
    Code.expect(response.body).to.equal('{"warnings":[]}')
  })

  lab.test('get all messages xml function', async () => {
    const response = await handler(eventXml)
    Code.expect(response.statusCode).to.equal(200)
    Code.expect(response.headers['Content-Type']).to.equal('application/xml')
    Code.expect(response.body).to.equal('<?xml version="1.0" encoding="utf-8"?><warningreport/>')
  })

  lab.test('get all messages throw error', async () => {
    Services.prototype.getAllMessages.restore()
    sinon.stub(Services.prototype, 'getAllMessages').callsFake(() => {
      return Promise.reject(new Error('test error'))
    })
    const err = await Code.expect(handler(eventJson)).to.reject()
    Code.expect(err.message).to.equal('[500] test error')
  })
})
