'use strict'

const Lab = require('@hapi/lab')
const lab = exports.lab = Lab.script()
const Db = require('../../lib/helpers/db')
const Services = require('../../lib/helpers/services')
const sinon = require('sinon').createSandbox()

lab.experiment('helpers/services', () => {
  lab.beforeEach(() => {
    // setup mocks
    sinon.stub(Db.prototype, 'query').callsFake(() => {
      return Promise.resolve({})
    })
  })

  lab.afterEach(() => {
    sinon.restore()
  })

  lab.test('Happy path: vanilla', async () => {
    const db = new Db()
    const services = new Services(db)

    await services.getLastMessage('sdgds')
    await services.putMessage({
      targetAreaCode: '',
      severity: '',
      severityValue: '',
      situation: '',
      situationChanged: '',
      severityChanged: '',
      created: ''
    })
    await services.getAllMessages()
    await services.clearDownNoLongerInForce()
    await services.getApiKey()
  })
})
