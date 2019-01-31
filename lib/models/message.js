'use strict'

function Message (xmlResult) {
  let message = {
    TargetAreaCode: xmlResult.WarningMessage.TargetAreaCode[0],
    SeverityValue: xmlResult.WarningMessage.SeverityLevel[0],
    Situation: xmlResult.WarningMessage.InternetSituation[0],
    created: new Date().toISOString()
  }

  Object.defineProperties(this, {
    data: {
      value: message
    }
  })
}

module.exports = Message
