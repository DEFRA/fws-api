'use strict'

const xml2js = require('xml2js')
const Fwis = require('../../lib/models/fwis')
const getAllMessages = require('../data/get-all-messages.json')

describe('models/fwis', () => {
  it('Happy path: vanilla', () => {
    const fwis = new Fwis(getAllMessages.rows)
    expect(fwis.warnings).toBeArrayOfSize(1)
    expect(fwis.warnings[0].situation).toEqual('test situation')
    expect(fwis.warnings[0].attr.taCode).toEqual('111FWCECD022')
    expect(fwis.warnings[0].attr.createdDate).toEqual('2019-02-12T13:33:41.040Z')
  })

  it('Happy path: getJson', () => {
    const fwis = new Fwis(getAllMessages.rows)
    const string = fwis.getJson()
    const obj = JSON.parse(string)
    expect(obj.warnings).toBeArrayOfSize(1)
    expect(obj.warnings[0].attr.taCode).toEqual('111FWCECD022')
    expect(obj.warnings[0].attr.createdDate).toEqual('2019-02-12T13:33:41.040Z')
  })

  it('Happy path: get Xml', async () => {
    const fwis = new Fwis(getAllMessages.rows)
    const xml = fwis.getXml()
    // test for correct date formatting
    expect(xml).toInclude('2019-02-12T13:33:41.040Z')
    const obj = await new Promise((resolve, reject) => {
      xml2js.parseString(xml, (err, value) => {
        if (err) reject(err)
        resolve(value)
      })
    })
    expect(obj.warningreport.warning).toBeArrayOfSize(1)
    expect(obj.warningreport.warning[0].$.taCode).toEqual('111FWCECD022')
    expect(obj.warningreport.warning[0].$.createdDate).toEqual('2019-02-12T13:33:41.040Z')
  })

  it('Happy path: no results', () => {
    const fwis = new Fwis([])
    expect(fwis.warnings).toBeArrayOfSize(0)
  })
})
