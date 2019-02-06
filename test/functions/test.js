'use strict'

const Lab = require('lab')
const lab = exports.lab = Lab.script()
// const Code = require('code')
const handler = require('../../lib/functions/process-message').handler

const Db = require('../../lib/helpers/db')
const Services = require('../../lib/helpers/services')
// const Message = require('../../lib/models/message')
let event

const sinon = require('sinon').createSandbox()

lab.experiment('test', () => {
  lab.beforeEach(async () => {
    event = {
      pathParameters: {
        id: '4eb3b7350ab7aa443650fc9351f'
      }
    }
    // setup mocks
    sinon.stub(Db.prototype, 'getLastMessage').callsFake(() => {
      return Promise.resolve({})
    })
  })
  lab.afterEach(() => {
    // restore sinon sandbox
    sinon.restore()
  })
  lab.test('get last message', async () => {
    await handler(event)
  })
})
