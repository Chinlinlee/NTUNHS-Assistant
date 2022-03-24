const _ = require('lodash');
const { getScore } = require('../../Scores/controller/get_Scores');
module.exports = async function (req, res) {
    let { scores, ranks } = await getScore(req);
    if (!scores) {
        req.flash('error', '學校系統逾時，請重新登入');
        req.logout();
        return res.status(401).send();
    }
    return res.status(200).send();
};
