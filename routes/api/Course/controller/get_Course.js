const myFunc = require("../../../My_Func");
const fetch = require('node-fetch');
const _ = require("lodash");
//const QueryParams = require("../../../models/common/httparams.js");


module.exports = async function (req, res) {
    let result = await getCourse(req);
    if (!result) {
        req.logout();
        return res.status(401).send();
    }
    for (let i in result) {
        result[i].Teacher = result[i].Teacher.replace(/<br\/>/gi, "");
    }
    return res.send(result);
}
async function getCourse(req) {
    if (req.session.Course.length > 0) {
        return Promise.resolve(req.session.Course);
    }
    let courses_URL = `http://system8.ntunhs.edu.tw/myNTUNHS_student/Modules/Profile/qry/Profile_qry_14.aspx?stno=undefined&size=100&action=LoadJSon`;
    let reqOption = {
        method: "GET",
        uri: courses_URL,
    }
    let fetchCookie = require('fetch-cookie')(fetch, myFunc.getJar(req));
    let courseFetch = await fetchCookie(reqOption.uri, { 
        method: reqOption.method 
    });
    let course = await courseFetch.text();
    let courseJson = "";
    try {
        courseJson = JSON.parse(course);
    } catch (e) {
        return Promise.resolve(false);
    }
    _.unset(courseJson, "0");
    let result = [];
    for (let i in courseJson) {
        let item = courseJson[i]
        result.push({
            Name: item.課程代碼與名稱_L.substr(11),
            Code: item.課程代碼與名稱_L.substr(0, 10),
            Place: item.教室,
            Day: item.星期,
            Period: item.節次,
            Credit: item.學分,
            Type: item.課程性質,
            Teacher: item.任課教師_L.replace(/<br\/>/gi, ""),
            Other: item.備註_L
        });
    }
    req.session.Course = result;
    return Promise.resolve(result);
}

module.exports.getCourse = getCourse;