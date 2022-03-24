const myFunc = require('../../../My_Func');
const fetch = require('node-fetch');
const cheerio = require('cheerio');
const {
    courseProgram,
} = require('../../../../models/NTUNHS/CourseProgram/CourseProgram');

const _ = require('lodash');

module.exports = async function (req, res) {
    try {
        let sessionLearnMap = req.session.learnMap;
        let sessionStuInfo = req.session.stuInfo;
        if (sessionLearnMap) {
            return res.send(sessionLearnMap);
        }
        let j = myFunc.getJar(req);
        let fetchCookie = require('fetch-cookie')(fetch, j);
        let htmlCreditRes = await fetchCookie(
            `https://system8.ntunhs.edu.tw/myNTUNHS_student/Modules/Map/qry/Map_qry_20.aspx?action=htmlCredit&group=${sessionStuInfo.groupno}&deptno=${sessionStuInfo.deptno}&year=${sessionStuInfo.entryYear}&semno=${sessionStuInfo.lastSem}&edutype=${sessionStuInfo.edutypeCode}`
        );
        let htmlCreditText = await htmlCreditRes.text();
        let $ = cheerio.load(htmlCreditText);
        /**
         * 應修畢業學分
         * 已修畢業學分
         * 共同必修
         * 專業必修
         * 選修
         */
        let creditTableTr3 = $('table tr:eq(3)').find('td');
        /**
         * 應修未修學分 total
         */
        let missingCreditsSummary = $('table tr:eq(4)').find('td').eq(0).text();
        let creditTableObj = {
            creditsRequirementForGraduation: creditTableTr3.eq(0).text(),
            tookCredits: creditTableTr3.eq(1).text(),
            missingCommonRequiredCredits: creditTableTr3.eq(2).text(),
            missingProfessionalRequiredCredits: creditTableTr3.eq(3).text(),
            missingElectiveCredits: creditTableTr3.eq(4).text(),
            missingCreditsSummary: missingCreditsSummary,
        };
        console.log(creditTableObj);
        $('table').addClass('table table-bordered table-sm static-color-white');
        $('table').attr('style', '');
        $('span').remove();
        let tablehtml = $.html();

        let htmlCreditHisRes = await fetchCookie(
            `https://system8.ntunhs.edu.tw/myNTUNHS_student/Modules/Map/qry/Map_qry_20.aspx?action=htmlCreditHis&group=${sessionStuInfo.groupno}&deptno=${sessionStuInfo.deptno}&year=${sessionStuInfo.entryYear}&semno=${sessionStuInfo.lastSem}&edutype=${sessionStuInfo.edutypeCode}`
        );

        let htmlCreditHisText = await htmlCreditHisRes.text();
        $ = cheerio.load(htmlCreditHisText);
        let creditHisTrList = $('table tr').slice(2);
        let creditHisObjectList = [];
        let creditHisSummaryObject = {};
        //學年度	共同必修(通識)	專業必修(系所)	選修課程(一般、專業)	學期總學分
        //          應修  已修	    應修  已修	  應修  已修	       應修  已修
        creditHisTrList.each((index, tr) => {
            let tdInTr = $(tr).find('td');
            if (index != creditHisTrList.length - 1) {
                let creditHisObject = {
                    semNo: tdInTr.eq(0).text().trim(),
                    commonRequiredShouldTake: tdInTr.eq(1).text().trim(),
                    commonRequiredTook: tdInTr.eq(2).text().trim(),
                    professionalRequiredShouldTake: tdInTr.eq(3).text().trim(),
                    professionalRequiredTook: tdInTr.eq(4).text().trim(),
                    electiveShouldTake: tdInTr.eq(5).text().trim(),
                    electiveTook: tdInTr.eq(6).text().trim(),
                    totalCreditsShouldTake: tdInTr.eq(7).text().trim(),
                    totalCreditsTook: tdInTr.eq(8).text().trim(),
                };
                creditHisObjectList.push(creditHisObject);
            } else {
                creditHisSummaryObject = {
                    semNo: tdInTr.eq(0).text().trim(),
                    commonRequiredShouldTake: tdInTr.eq(1).text().trim(),
                    commonRequiredTook: tdInTr.eq(2).text().trim(),
                    professionalRequiredShouldTake: tdInTr.eq(3).text().trim(),
                    professionalRequiredTook: tdInTr.eq(4).text().trim(),
                    electiveShouldTake: tdInTr.eq(5).text().trim(),
                    electiveTook: tdInTr.eq(6).text().trim(),
                    totalCreditsShouldTake: tdInTr.eq(7).text().trim(),
                    totalCreditsTook: tdInTr.eq(8).text().trim(),
                };
            }
        });

        //#region  獲取學習地圖修過的課
        let htmlCourseRes = await fetchCookie(
            `https://system8.ntunhs.edu.tw/myNTUNHS_student/Modules/Map/qry/Map_qry_20.aspx?action=htmlCourse&group=${sessionStuInfo.groupno}&deptno=${sessionStuInfo.deptno}&year=${sessionStuInfo.entryYear}&semno=${sessionStuInfo.lastSem}&edutype=${sessionStuInfo.edutypeCode}`
        );
        let htmlCourseText = await htmlCourseRes.text();
        $ = cheerio.load(htmlCourseText);
        let haveTdCourse = $('.tdCourse').length;
        if (!haveTdCourse) {
            req.flash('error', '學校系統逾時，請重新登入');
            req.logout();
            return res.status(401).send();
        }
        let passCourse = [];
        $('.tdCourse input').each(function (index, element) {
            let isChecked = $(element).attr('defaultchecked') == 'true';
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
                key: key,
                course: [],
                credit: 0,
            };
            let program = courseProgram[faculty][key].course;
            for (let i = 0; i < program.length; i++) {
                let course = program[i];
                if (passCourse.findIndex((v) => v == course.name) >= 0) {
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
            hitCredit: tablehtml,
            creditObject: creditTableObj,
            creditHisObjectList: creditHisObjectList,
            creditHisSummaryObject: creditHisSummaryObject,
            program: myProgram,
        };
        return res.send(req.session.learnMap);
    } catch (e) {
        console.error(e);
        return res.status(401).send();
    }
};
