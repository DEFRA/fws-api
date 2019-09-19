'use strict'

const Lab = require('@hapi/lab')
const lab = exports.lab = Lab.script()
const Code = require('@hapi/code')
const handler = require('../../lib/functions/get-all-historical-messages').handler
const event = require('../data/events/get-all-historical-messages.json')
const Services = require('../../lib/helpers/services')

const sinon = require('sinon').createSandbox()

lab.experiment('functions/get-all-historical-messages', () => {
  lab.beforeEach(() => {
    // setup mocks
    sinon.stub(Services.prototype, 'getAllHistoricalMessages').callsFake(() => {
      return Promise.resolve({
        rows: require('../data/db-response/messages-db.json')
      })
    })
  })

  lab.afterEach(() => {
    sinon.restore()
  })

  lab.test('Happy: get all historical messages', async () => {
    const response = await handler(event)
    Code.expect(response.statusCode).to.equal(200)
    Code.expect(response.headers['Content-Type']).to.equal('application/json')
    Code.expect(response.body).to.equal(JSON.stringify(require('../data/lambda-response/fwis.json')))
  })

  lab.test('Sad: get all historical messages error', async () => {
    Services.prototype.getAllHistoricalMessages.restore()
    sinon.stub(Services.prototype, 'getAllHistoricalMessages').callsFake(() => {
      return Promise.resolve({
        rows: 'sdgfdfshdhndf'
      })
    })

    const err = await Code.expect(handler(event)).to.reject()
    Code.expect(err.message).to.equal('[500] rows.map is not a function')
  })

  lab.test('Sad: get historical messages throw error', async () => {
    Services.prototype.getAllHistoricalMessages.restore()
    sinon.stub(Services.prototype, 'getAllHistoricalMessages').callsFake(() => {
      return Promise.reject(new Error('test error'))
    })
    const err = await Code.expect(handler(event)).to.reject()
    Code.expect(err.message).to.equal('[500] test error')
  })

  lab.test('Sad: get historical messages bad request throw error', async () => {
    event.pathParameters = undefined
    const err = await Code.expect(handler(event)).to.reject()
    Code.expect(err.message).to.equal('[500] Cannot read property \'code\' of undefined')
  })
})
