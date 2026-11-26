'use strict'

const Db = require('../../lib/helpers/db')
const Services = require('../../lib/helpers/services')

describe('helpers/services', () => {
  beforeEach(() => {
    // setup mocks
    jest.spyOn(Db.prototype, 'query').mockImplementation(() => {
      return Promise.resolve({})
    })
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('Happy path: vanilla', async () => {
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
    await services.getAllHistoricalMessages()
    await services.getAllTargetAreas()
    await services.errorLog('test')
  })
})
