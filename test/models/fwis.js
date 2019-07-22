'use strict'

const Lab = require('@hapi/lab')
const lab = exports.lab = Lab.script()
const Code = require('code')
const xml2js = require('xml2js')
const Fwis = require('../../lib/models/fwis')
const getAllMessages = require('../data/get-all-messages.json')

lab.experiment('models/fwis', () => {
  lab.test('Happy path: vanilla', () => {
    const fwis = new Fwis(getAllMessages.rows)
    Code.expect(fwis.warnings.length).to.equal(1)
    Code.expect(fwis.warnings[0].situation).to.equal('test situation')
    Code.expect(fwis.warnings[0].attr.taCode).to.equal('111FWCECD022')
    Code.expect(fwis.warnings[0].attr.createdDate).to.equal('2019-02-12T13:33:41.040Z')
  })

  lab.test('Happy path: getJson', () => {
    const fwis = new Fwis(getAllMessages.rows)
    const string = fwis.getJson()
    const obj = JSON.parse(string)
    Code.expect(obj.warnings.length).to.equal(1)
    Code.expect(obj.warnings[0].attr.taCode).to.equal('111FWCECD022')
    Code.expect(obj.warnings[0].attr.createdDate).to.equal('2019-02-12T13:33:41.040Z')
  })

  lab.test('Happy path: get Xml', async () => {
    const fwis = new Fwis(getAllMessages.rows)
    const xml = fwis.getXml()
    // test for correct date formatting
    Code.expect(xml).to.contain('2019-02-12T13:33:41.040Z')
    const obj = await new Promise((resolve, reject) => {
      xml2js.parseString(xml, (err, value) => {
        if (err) reject(err)
        resolve(value)
      })
    })
    Code.expect(obj.warningreport.warning.length).to.equal(1)
    Code.expect(obj.warningreport.warning[0].$.taCode).to.equal('111FWCECD022')
    Code.expect(obj.warningreport.warning[0].$.createdDate).to.equal('2019-02-12T13:33:41.040Z')
  })

  lab.test('Happy path: no results', () => {
    const fwis = new Fwis([])
    Code.expect(fwis.warnings.length).to.equal(0)
  })
})
