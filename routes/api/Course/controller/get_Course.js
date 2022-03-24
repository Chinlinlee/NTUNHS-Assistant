const myFunc = require('../../../My_Func')
const fetch = require('node-fetch')
const _ = require('lodash')
const { isUndefined } = require('lodash')

//const QueryParams = require("../../../models/common/httparams.js");

module.exports = async function (req, res) {
    let result = await getCourse(req)
    if (!result) {
        req.flash('error', '學校系統逾時，請重新登入')
        req.logout()
        return res.status(401).send()
    }
    for (let i in result) {
        result[i].Teacher = result[i].Teacher.replace(/<br\/>/gi, '')
    }
    return res.send(result)
}

/**
 *
 * @param {import('express').Request} req
 * @returns
 */
async function getCourse(req) {
    let stuAllSemno = _.get(req.session, 'stuInfo.allSemno')
    let semno = req.query.semno
    let courseJson = await getCourseJson(req, semno)
    if (!courseJson) {
        return Promise.resolve(false)
    }
    req.session.Course = courseJson
    if (_.isArray(courseJson) && courseJson.length == 0) {
        courseJson = await getCourseJson(
            req,
            stuAllSemno[stuAllSemno.length - 2]
        )
    }
    return Promise.resolve(courseJson)
}

async function getCourseJson(req, semno) {
    if (isUndefined(semno)) {
        semno = _.get(req.session, 'stuInfo.lastSem')
    }
    let parameter = new URLSearchParams({
        st_no: req.session.STNO,
        sem_no: semno,
        size: 100,
        action: 'LoadJSon',
    })
    let courses_URL = new URL(
        'http://system8.ntunhs.edu.tw/myNTUNHS_student/Modules/Profile/qry/Profile_qry_14.aspx'
    )
    courses_URL.search = parameter
    let reqOption = {
        method: 'GET',
        uri: courses_URL.href,
    }
    let fetchCookie = require('fetch-cookie')(fetch, myFunc.getJar(req))
    let courseFetch = await fetchCookie(reqOption.uri, {
        method: reqOption.method,
    })
    let course = ''
    let courseJson = {}
    let courseText = await courseFetch.text()
    if (courseText == '查無符合條件資料') {
        course = []
        return Promise.resolve(course)
    }
    try {
        courseJson = JSON.parse(courseText)
    } catch (e) {
        console.error(e)
        return Promise.resolve(false)
    }
    _.unset(courseJson, '0')
    let result = []
    for (let i in courseJson) {
        let item = courseJson[i]
        //let courseCode = item.課程全碼與名稱_L.substr(0, 21);
        //let courseClassCode = item.上課班級_L.substr(3 ,2);
        let courseFullCode = item.課程全碼與名稱_L.substr(0, 14)
        result.push({
            Name: item.課程全碼與名稱_L.substr(19),
            //Code: courseCode ,
            FullCode: courseFullCode,
            Place: item.教室,
            Day: item.星期,
            Period: item.節次,
            Credit: item.學分,
            Type: item.課程性質,
            Teacher: item.任課教師_L.replace(/<br\/>/gi, ''),
            Other: item.備註_L,
            takeStatu: item.修業狀態,
            conflictStatu: item.衝堂狀態,
        })
    }
    course = result
    return Promise.resolve(course)
}

module.exports.getCourse = getCourse
module.exports.getCourseJson = getCourseJson
