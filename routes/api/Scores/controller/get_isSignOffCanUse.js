const config = require('../../../../models/NTUNHS/config');
module.exports = async function (req, res) {
    return res.send(config.isSignOffLess);
}
