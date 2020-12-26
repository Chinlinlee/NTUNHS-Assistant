const data_log = require("../../../../models/common/data.js");
const {ntunhsApp}  = require("../../../My_Func");
module.exports = async function(req, res)
{
    let crawlerHistoryScore = await ntunhsApp.historyScores.get(req ,res);
    if (!crawlerHistoryScore) {
        req.flash('error',"請重新登入");
        req.logout();
        return res.status(401).send();
    }
    return res.send(crawlerHistoryScore);
}