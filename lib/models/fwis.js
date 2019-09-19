'use strict'
const builder = require('xmlbuilder')

class fwis {
  constructor (rows) {
    this.warnings = rows.map(item => {
      return {
        situation: item.situation,
        attr: {
          taId: item.ta_id,
          taCode: item.ta_code,
          taName: item.ta_name,
          taDescription: item.ta_description,
          quickDial: item.quick_dial,
          version: item.version,
          taCategory: item.ta_category,
          ownerArea: item.owner_area,
          createdDate: new Date(item.created_date).toISOString(),
          lastModifiedDate: new Date(item.last_modified_date).toISOString(),
          situationChanged: new Date(item.situation_changed).toISOString(),
          severityChanged: new Date(item.severity_changed).toISOString(),
          timeMessageReceived: new Date(item.message_received).toISOString(),
          severityValue: item.severity_value,
          severity: item.severity
        }
      }
    })
  }

  getJson () {
    return JSON.stringify({
      warnings: this.warnings
    })
  }

  getXml () {
    const root = builder.create('warningreport', { encoding: 'utf-8' })
    this.warnings.forEach(item => {
      root
        .ele('warning', item.attr)
        .ele('situation', item.situation)
    })
    return root.end()
  }
}

module.exports = fwis
