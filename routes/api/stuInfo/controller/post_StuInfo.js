const mongodb = require('../../../../models/common/data')
const School_Auth = require('../../../../models/users/School_Auth')

module.exports = async function (req, res) {
    const param = req.param
    let loginResult = await School_Auth.Auth(param.username, param.password)
    let loginResultCode = loginResult.split('_')
    if (loginResultCode.length < 2) {
    }
}
