const myFunc = require("../../../My_Func");
const fetch = require('node-fetch');
const _ = require("lodash");

//const QueryParams = require("../../../models/common/httparams.js");


module.exports = async function (req, res) {
    let result = await getCourse(req);
    if (!result) {
        req.flash('error' , '學校系統逾時，請重新登入');
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
    let courseJson = await getCourseJson(req);
    if (!courseJson) {
        return Promise.resolve(false);
    }
    req.session.Course = courseJson;
    return Promise.resolve(courseJson);
}

async function getCourseJson (req , semno) {
    let parameter = new URLSearchParams({
        st_no : req.session.STNO ,
        sem_no : semno ,
        size : 100 ,
        action : "LoadJSon"
    });
    if (!semno) {
        parameter.delete('sem_no');
    }
    let courses_URL = new URL("http://system8.ntunhs.edu.tw/myNTUNHS_student/Modules/Profile/qry/Profile_qry_14.aspx");
    courses_URL.search = parameter;
    let reqOption = {
        method: "GET",
        uri: courses_URL.href,
    }
    let fetchCookie = require('fetch-cookie')(fetch, myFunc.getJar(req));
    let courseFetch = await fetchCookie(reqOption.uri, { 
        method: reqOption.method 
    });
    let course = "";
    try {
        let courseJson = await courseFetch.json();
        _.unset(courseJson, "0");
        let result = [];
        for (let i in courseJson) {
            let item = courseJson[i];
            let courseCode = item.課程代碼與名稱_L.substr(0, 10);
            let courseClassCode = item.上課班級_L.substr(3 ,2);
            let courseFullCode = courseCode + courseClassCode;
            result.push({
                Name: item.課程代碼與名稱_L.substr(11),
                Code: courseCode ,
                FullCode : courseFullCode ,
                Place: item.教室,
                Day: item.星期,
                Period: item.節次 ,
                Credit: item.學分,
                Type: item.課程性質,
                Teacher: item.任課教師_L.replace(/<br\/>/gi, ""),
                Other: item.備註_L ,
                takeStatu : item.修業狀態 ,
                conflictStatu : item.衝堂狀態
            });
        }
        course = result;
    } catch (e) {
        course = [];
    }
    try {
        return Promise.resolve(course); 
    } catch (e) {
        console.error(e);
        return Promise.resolve(false);
    }
}

module.exports.getCourse = getCourse;
module.exports.getCourseJson = getCourseJson;