const myFunc = require('../../../My_Func');
const fetch = require('node-fetch');
const cheerio = require('cheerio');
const _ = require('lodash');
const { getScore } = require('./get_Scores');
module.exports = async function (req, res) {
    //用獲取成績來判斷登入的cookie是否有效
    let { scores, ranks } = await getScore(req);
    if (!scores) {
        req.flash('error', '學校系統逾時，請重新登入');
        req.logout();
        return res.status(401).send();
    }
    let preRank = await myFunc.ntunhsApp.signOff.getPreRank(req, res, '');
    if (!preRank) {
        return res.status(400).send('');
    }
    return res.send(preRank);
};
