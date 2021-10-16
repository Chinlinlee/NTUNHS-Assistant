
module.exports = async function (req, res) {
    delete require.cache[require.resolve('../../../../models/NTUNHS/config')];
    let config = require('../../../../models/NTUNHS/config');
    return res.send(config.isSignOffLess);
}
