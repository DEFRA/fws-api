const mockQuery = jest.fn()
const mockEnd = jest.fn()
const MockPool = jest.fn(() => ({ query: mockQuery, end: mockEnd }))

jest.mock('pg', () => ({ Pool: MockPool }))

describe('helpers/db', () => {
  let Db

  beforeEach(() => {
    jest.resetModules()
    jest.clearAllMocks()
    process.env.FWS_DB_USERNAME = 'user'
    process.env.FWS_DB_HOST = 'host'
    process.env.FWS_DB_NAME = 'name'
    process.env.FWS_DB_PASSWORD = 'password'
    Db = require('../../lib/helpers/db')
  })

  afterEach(() => {
    delete process.env.FWS_DB_USERNAME
    delete process.env.FWS_DB_HOST
    delete process.env.FWS_DB_NAME
    delete process.env.FWS_DB_PASSWORD
  })

  it('constructor in test mode does not create a pool', () => {
    new Db(true) // eslint-disable-line no-new
    expect(MockPool).not.toHaveBeenCalled()
  })

  it('query creates a pool from environment and delegates to it', async () => {
    mockQuery.mockResolvedValue({ rows: [1] })
    const db = new Db()
    const result = await db.query('select $1', ['a'])

    expect(MockPool).toHaveBeenCalledWith({ connectionString: 'postgresql://user:password@host:5432/name' })
    expect(mockQuery).toHaveBeenCalledWith('select $1', ['a'])
    expect(result).toEqual({ rows: [1] })
  })

  it('pool is shared between instances', () => {
    new Db() // eslint-disable-line no-new
    new Db() // eslint-disable-line no-new
    expect(MockPool).toHaveBeenCalledTimes(1)
  })

  it('end resolves immediately when there is no pool', async () => {
    await expect(new Db(true).end()).resolves.toBeUndefined()
    expect(mockEnd).not.toHaveBeenCalled()
  })

  it('end closes the pool', async () => {
    mockEnd.mockImplementation((cb) => cb())
    jest.spyOn(console, 'log').mockImplementation(() => { })
    await new Db().end()
    expect(mockEnd).toHaveBeenCalledTimes(1)
  })

  it('a new pool is created if the existing pool is ending', () => {
    const db = new Db()
    expect(MockPool).toHaveBeenCalledTimes(1)
    MockPool.mock.results[0].value.ending = true
    db.init()
    expect(MockPool).toHaveBeenCalledTimes(2)
  })
})
