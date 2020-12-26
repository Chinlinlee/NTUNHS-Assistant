const data_log = require("../../../../models/common/data.js");
const myFunc = require("../../../My_Func");
module.exports = async function (req, res) {
    await myFunc.ntunhsApp.signOff.enter(req, res);
    let preRankObj = [];
    if (!req.session.noPreRank) {
        let csrf = await myFunc.ntunhsApp.signOff.getPreRankCsrf(req, res);
        if (csrf) {
            let preRank = await myFunc.ntunhsApp.signOff.getPreRank(req, res, csrf);
            //return res.status(401).send();
            preRankObj = [
                {
                    "name": preRank[0],
                    "value": preRank[1]
                },
                {
                    "name": preRank[2],
                    "value": preRank[3]
                }
            ]
            req.session.noPreRank = false;
        }
        else {
            req.session.noPreRank = true;
        }
    }
    let [Result, Result_all] = await myFunc.ntunhsApp.Score.get(req);
    if (!Result) {
        req.logout();
        return res.status(401).send();
    }
    return res.send([Result, Result_all, preRankObj]);
}

