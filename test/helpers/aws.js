'use strict'

const Lab = require('@hapi/lab')
const lab = exports.lab = Lab.script()
// const Db = require('../../lib/helpers/db')
const sinon = require('sinon').createSandbox()

lab.experiment('helpers/services', () => {
  lab.beforeEach(() => {
    // setup mocks
    // sinon.stub(Db.prototype, 'query').callsFake(() => {
    //   return Promise.resolve({})
    // })
  })

  lab.afterEach(() => {
    sinon.restore()
  })

  lab.test('Happy path: vanilla', async () => {
    const proxy = process.env.FWS_HTTP_PROXY
    process.env.FWS_HTTP_PROXY = undefined
    delete require.cache[require.resolve('../../lib/helpers/aws')]
    require('../../lib/helpers/aws')
    process.env.FWS_HTTP_PROXY = proxy
  })
})
