'use strict'
const builder = require('xmlbuilder')
// TODO: format datetimes to iso utc format. using moment or whatever
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
          state: item.state,
          taCategory: item.ta_category,
          ownerArea: item.owner_area,
          createdDate: item.created_date,
          lastModifiedDate: item.last_modified_date,
          situationChanged: item.situation_changed,
          severityChanged: item.severity_changed,
          timeMessageReceived: item.message_received,
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
    const root = builder.create('warningreport')
    this.warnings.forEach(item => {
      root
        .ele('warning', item.attr)
        .ele('situation', item.situation)
    })
    return root.end()
  }
}

module.exports = fwis
