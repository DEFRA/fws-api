'use strict'

const Lab = require('@hapi/lab')
const lab = exports.lab = Lab.script()
const Code = require('@hapi/code')
const handler = require('../../lib/functions/put-warnings-alerts').handler
const eventJson = require('../data/events/get-all-messages-json.json')
const Services = require('../../lib/helpers/services')
const AWS = require('aws-sdk')
const Db = require('../../lib/helpers/db')

const sinon = require('sinon').createSandbox()

lab.experiment('functions/store-warnings-alerts', () => {
  lab.beforeEach(() => {
    // setup mocks

    sinon.stub(Db.prototype, 'query').callsFake((query) => {
      return Promise.resolve({})
    })
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

  lab.test('store all warnings/alerts - success', async () => {
    const putObjectStub = AWS.S3.prototype.putObject = sinon.stub()
    putObjectStub.yields(null, 'Success')
    const response = await handler(eventJson)

    Code.expect(response).to.equal('Success')
  })

  lab.test('store all warnings/alerts - error', async () => {
    const putObjectStub = AWS.S3.prototype.putObject = sinon.stub()
    putObjectStub.yields('failure', null)
    let result
    try {
      result = await handler(eventJson)
    } catch (err) {
      result = err
    }

    // Code.expect(await handler(eventJson)).to.reject()
    Code.expect(result).to.equal('failure')
  })

  lab.test('store all warnings/alerts - catch error in putObject', async () => {
    const putObjectStub = AWS.S3.prototype.putObject = sinon.stub()
    putObjectStub.throws(new Error('Catch error'))
    let result
    try {
      result = await handler(eventJson)
    } catch (err) {
      result = err
    }
    Code.expect(result.message).to.equal('Catch error')
  })

  lab.test('store all warnings/alerts - catch error in handler', async () => {
    const awsStub = AWS.S3 = sinon.stub()
    awsStub.throws(new Error('Catch error'))
    let result
    try {
      result = await handler(eventJson)
    } catch (err) {
      result = err
    }
    Code.expect(result).to.equal('Catch error')
  })
})
