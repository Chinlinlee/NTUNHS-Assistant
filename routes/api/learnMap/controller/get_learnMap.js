const myFunc = require("../../../My_Func");
const fetch = require('node-fetch');
const cheerio = require('cheerio');
const { courseProgram } = require('../../../../models/NTUNHS/CourseProgram/CourseProgram');
const { getCourseJson } = require('../../Course/controller/get_Course');
const _ = require('lodash');

module.exports = async function (req, res) {
    let sessionLearnMap = req.session.learnMap;
    let sessionStuInfo = req.session.stuInfo;
    if (sessionLearnMap) {
        return res.send(sessionLearnMap);
    }
    let j = myFunc.getJar(req);
    let fetchCookie = require('fetch-cookie')(fetch , j);
    let htmlCreditRes = await fetchCookie(`https://system8.ntunhs.edu.tw/myNTUNHS_student/Modules/Map/qry/Map_qry_20.aspx?action=htmlCredit&group=${sessionStuInfo.groupno}&deptno=${sessionStuInfo.deptno}&year=${sessionStuInfo.entryYear}&semno=${sessionStuInfo.lastSem}&edutype=${sessionStuInfo.edutypeCode}`);
    let htmlCreditText = await htmlCreditRes.text();
    let $ = cheerio.load(htmlCreditText);
    $("table").addClass("table table-bordered table-sm");
    $("table").attr('style', '');
    $("span").remove();
    let tablehtml = $.html();

    //#region  獲取學習地圖修過的課
    let htmlCourseRes = await fetchCookie(`https://system8.ntunhs.edu.tw/myNTUNHS_student/Modules/Map/qry/Map_qry_20.aspx?action=htmlCourse&group=${sessionStuInfo.groupno}&deptno=${sessionStuInfo.deptno}&year=${sessionStuInfo.entryYear}&semno=${sessionStuInfo.lastSem}&edutype=${sessionStuInfo.edutypeCode}`);
    let htmlCourseText =  await htmlCourseRes.text();
    $ = cheerio.load(htmlCourseText);
    let passCourse = [];
        $(".tdCourse input").each(function (index, element) {
            let isChecked = $(element).attr("defaultchecked") == "true";
            if (isChecked) {
                //first is input's parent (td)
                //second is td's parnet tr
                //get only text in trCourse
                let course = $(element).parent().parent().children().text();
                passCourse.push(course);
            }
    });
    let faculty = req.session.stuInfo.stuFaculty;
    let myProgram = [];

    for (let key in courseProgram[faculty]) {
        programObj = {
            key : key , 
            course : [] ,
            credit : 0
        };
        let program = courseProgram[faculty][key].course;
        for (let i = 0 ; i < program.length ; i++) {
            let course = program[i];
            if (passCourse.findIndex(v => v == course.name) >=0 ) {
                programObj.credit += course.credit;
                programObj.course.push(course);
            }
        }
        myProgram.push(programObj);
    }
    //#endregion

    //獲取所有修課明細
    /*let allSemno = [];
    let entryYearInt = parseInt(sessionStuInfo.entryYear);
    let semno = sessionStuInfo.lastSem.substr(0 , 3);
    let lastSemInt = parseInt(semno);
    for (let i = entryYearInt ; i <= lastSemInt ; i++) {
        allSemno.push(`${i}1`);
        allSemno.push(`${i}2`);
    }
    let allOverCourse = [];
    for (sem of allSemno) {
        let nowCourse = await getCourseJson(req , sem);
        allOverCourse.push(nowCourse);
    }
    console.log(allOverCourse);*/
    req.session.learnMap = {
        hitCredit : tablehtml ,
        program : myProgram
    };
    return res.send(req.session.learnMap);
}


