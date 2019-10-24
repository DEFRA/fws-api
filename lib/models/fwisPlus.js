'use strict'

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
          createdByID: item.created_by_id,
          createdByName: item.created_by_name,
          createdByEmail: item.created_by_email,
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
}

module.exports = fwis
