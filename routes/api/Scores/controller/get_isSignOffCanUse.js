
module.exports = async function (req, res) {
    let config = require('../../../../models/NTUNHS/config');
    return res.send(config.isSignOffLess);
}
