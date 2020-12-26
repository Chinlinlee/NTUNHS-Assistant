const request = require("request");
const cheerio  = require("cheerio");
const myFunc = require("../../../My_Func");
const _ = require("lodash");
//const QueryParams = require("../../../models/common/httparams.js");


module.exports = async function(req, res)
{
    let result = await myFunc.ntunhsApp.getCourse(req);
    for (let i in result) {
        result[i].Teacher = result[i].Teacher.replace(/<br\/>/gi , "");
    }
    return res.send(result);
}