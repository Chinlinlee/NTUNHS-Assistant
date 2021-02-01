const myFunc = require('../../../My_Func');
const fetch = require('node-fetch');
const cheerio = require('cheerio');
const _ = require('lodash');
const { getScore } = require('./get_Scores');
module.exports = async function (req, res) {
    let [Result, Result_all] = await getScore(req);
    if (!Result) {
        req.flash('error' , '學校系統逾時，請重新登入');
        req.logout();
        return res.status(401).send();
    }
    let preRank = await myFunc.ntunhsApp.signOff.getPreRank(req, res, "");
    return res.send(preRank);
}
