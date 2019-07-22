'use strict'

const Lab = require('@hapi/lab')
const lab = exports.lab = Lab.script()
const Code = require('code')

lab.experiment('test', () => {
  lab.test('test1', () => {
    Code.expect(1).to.equal(1)
  })
})
