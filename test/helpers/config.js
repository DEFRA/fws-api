const Lab = require('@hapi/lab')
const lab = exports.lab = Lab.script()
const Code = require('@hapi/code')

lab.experiment('Config test', () => {
  lab.beforeEach(() => {
    process.env.FWS_ENV_NAME = 'tst'
  })

  lab.afterEach(() => {
    delete require.cache[require.resolve('../../lib/config')]
  })

  lab.test('Check valid config passes', () => {
    Code.expect(() => { require('../../lib/config') }).not.to.throw()
  })

  lab.test('Check bad config fails', () => {
    process.env.FWS_ENV_NAME = 'unknown'
    Code.expect(() => { require('../../lib/config') }).to.throw()
  })
})
