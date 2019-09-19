'use strict'

const Lab = require('@hapi/lab')
const lab = exports.lab = Lab.script()
const Code = require('@hapi/code')
const handler = require('../../lib/functions/get-all-target-areas').handler
const event = require('../data/events/get-all-target-areas.json')
const Services = require('../../lib/helpers/services')

const sinon = require('sinon').createSandbox()

lab.experiment('functions/get-all-historical-messages', () => {
  lab.beforeEach(() => {
    // setup mocks
    sinon.stub(Services.prototype, 'getAllTargetAreas').callsFake(() => {
      return Promise.resolve({
        rows: require('../data/db-response/target-areas-db.json')
      })
    })
  })

  lab.afterEach(() => {
    sinon.restore()
  })

  lab.test('Happy: get all target areas', async () => {
    const response = await handler(event)
    Code.expect(response.statusCode).to.equal(200)
    Code.expect(response.headers['Content-Type']).to.equal('application/json')
    Code.expect(response.body).to.equal(JSON.stringify(require('../data/lambda-response/target-areas.json')))
  })

  lab.test('Sad: get all target areas error', async () => {
    Services.prototype.getAllTargetAreas.restore()
    sinon.stub(Services.prototype, 'getAllTargetAreas').callsFake(() => {
      return Promise.reject(new Error('Test error'))
    })

    const err = await Code.expect(handler(event)).to.reject()
    Code.expect(err.message).to.equal('[500] Test error')
  })
})
