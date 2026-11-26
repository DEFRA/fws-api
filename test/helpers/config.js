describe('Config test', () => {
  beforeEach(() => {
    process.env.FWS_ENV_NAME = 'tst'
  })

  afterEach(() => {
    jest.resetModules()
    jest.restoreAllMocks()
  })

  it('Check valid config passes', () => {
    expect(() => { require('../../lib/config') }).not.toThrow()
  })

  it('Check bad config fails', () => {
    process.env.FWS_ENV_NAME = 'unknown'
    expect(() => { require('../../lib/config') }).toThrow()
  })

  it('Legacy configuration is rejected', () => {
    // As configuration schema definition and validation are part of the same module,
    // validation of the schema returned by Joi.object is stubbed so that a legacy
    // configuration setting can be provided and tested for expected rejection.
    // Ideally, this test would be able to stub Joi validation directly without
    // needing to stub the validate method of the schema returned by Joi.object.
    // At the time of writing, a way to do this without refactoring the software under
    // test into two modules for stubbing purposes has not been found.
    // Required here so the stub applies to the same Joi instance that config loads after resetModules
    const Joi = require('joi')
    const originalObject = Joi.object
    jest.spyOn(Joi, 'object').mockImplementation(function (...args) {
      // Call the original Joi.object function so that the validate method of the
      // returned schema object can be stubbed.
      const schema = originalObject.apply(this, args)
      const originalValidate = schema.validate
      jest.spyOn(schema, 'validate').mockImplementation(function (...innerArgs) {
        innerArgs[0].dbConnection = 'mock connection'
        return originalValidate.apply(this, innerArgs)
      })
      return schema
    })
    expect(() => { require('../../lib/config') }).toThrow()
  })
})
