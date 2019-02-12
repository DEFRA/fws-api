const Db = require('../helpers/db')
const Services = require('../helpers/services')

module.exports.handler = async (event) => {
  try {
    const response = {
      statusCode: 200,
      headers: {
        'Content-Type': event.resource
      }
    }

    const db = new Db()
    const services = new Services(db)
    // let messages = await services.getAllMessages().rows
    let { rows } = await services.getAllMessages()
    await db.end()

    const builder = require('xmlbuilder')
    const root = builder.create('warningreport')
    rows.forEach(item => {
      root
        .ele('warning', {
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
        })
        .ele('situation', item.situation)
    })
    console.log(root.end())

    // Convert to XML or send out as json
    if (event.resource.indexOf('xml') > -1) {
      response.body = root.end()
      response.headers['Content-Type'] = 'application/xml'
    } else {
      response.body = JSON.stringify(rows)
    }

    return response
  } catch (err) {
    throw err
  }
}
