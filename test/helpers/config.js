const Lab = require('@hapi/lab')
const lab = exports.lab = Lab.script()
const Code = require('@hapi/code')
const sinon = require('sinon')
const Joi = require('joi')

lab.experiment('Config test', () => {
  lab.beforeEach(() => {
    process.env.FWS_ENV_NAME = 'tst'
  })

  lab.afterEach(() => {
    delete require.cache[require.resolve('../../lib/config')]
    sinon.restore()
  })

  lab.test('Check valid config passes', () => {
    Code.expect(() => { require('../../lib/config') }).not.to.throw()
  })

  lab.test('Check bad config fails', () => {
    process.env.FWS_ENV_NAME = 'unknown'
    Code.expect(() => { require('../../lib/config') }).to.throw()
  })

  lab.test('Legacy configuration is rejected', () => {
    // As configuration schema definition and validation are part of the same module,
    // validation of the schema returned by Joi.object is stubbed so that a legacy
    // configuration setting can be provided and tested for expected rejection.
    // Ideally, this test would be able to stub Joi validation directly without
    // needing to stub the validate method of the schema returned by Joi.object.
    // At the time of writing, a way to do this without refactoring the software under
    // test into two modules for stubbing purposes has not been found.
    sinon.stub(Joi, 'object').callsFake(function (...args) {
      // Call the original Joi.object function so that the validate method of the
      // returned schema object can be stubbed.
      const schema = Joi.object.wrappedMethod.apply(this, args)
      sinon.stub(schema, 'validate').callsFake(function (...innerArgs) {
        innerArgs[0].dbConnection = 'mock connection'
        return schema.validate.wrappedMethod.apply(this, innerArgs)
      })
      return schema
    })
    Code.expect(() => { require('../../lib/config') }).to.throw()
  })
})
