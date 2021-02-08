const data_log = require("../../../../models/common/data.js");
const {ntunhsApp}  = require("../../../My_Func");
const myFunc = require("../../../My_Func");
const cheerio = require('cheerio');
const _ = require('lodash');
const fetch = require('node-fetch');
const { getTookCourse } = require('../../learnMap/controller/get_tookCourse');
module.exports = async function(req, res)
{
    let crawlerHistoryScore = await getHistoryScores(req);
    if (!crawlerHistoryScore) {
        req.flash('error',"請重新登入");
        req.logout();
        return res.status(401).send();
    }
    return res.send(crawlerHistoryScore);
}

const tdFunc = {
    "7" : function (td , sem_no , sems, result ,result2) { //課程成績
        const tdSem = td.eq(0).text();
        (tdSem)? (() => {
            sem_no = tdSem;
            sems.push({Sem:sem_no});
        })() : undefined;
        const tdItem = {
            Sem:sem_no ,
            Type:td.eq(1).text(),
            Course:td.eq(2).text(),
            Up_Credit:td.eq(3).text(),
            Up_Score:td.eq(4).text() , 
            Down_Credit:td.eq(5).text() , 
            Down_Score:td.eq(6).text()
        }
        result.push(tdItem);
        return [tdItem , sem_no];
    } , 
    "5" : function (td , sem_no , sems , result ,result2) { //平均分數
        const tdItem = {
            title:td.eq(0).text() , 
            Up_Credit:td.eq(1).text() ,
            Up_Score:td.eq(2).text(),
            Down_Credit:td.eq(3).text() ,
            Down_Score:td.eq(4).text()
        }
        result2.push(tdItem);
        return [tdItem];
    } , 
    "2" : function (td, sem_no , sems , result ,result2) { //累計排名，累計平均
        const tdItem = {
            title:td.eq(0).text() , 
            Up_Credit:td.eq(1).text() ,
        }
        result2.push(tdItem);
        return [tdItem];
    }
}

async function getHistoryScores (req) {
    if (req.session.HistoryScore.length > 0) {
        return req.session.HistoryScore;
    }
    let j  = myFunc.getJar(req);
    let historyScoreURL = `http://system8.ntunhs.edu.tw/myNTUNHS_student/Modules/Profile/qry/Profile_qry_25.aspx?stno=${req.session.STNO}`;
    let reqOption = {
        method : "GET"  ,
        uri : historyScoreURL 
    }
    let fetchCookie = require("fetch-cookie")(fetch , j);
    let historyScorePageFetch = await fetchCookie(reqOption.uri , {
        method : reqOption.method
    });
    let historyScorePage = await historyScorePageFetch.text();
    let $ = cheerio.load(historyScorePage);
    let scoreTableTr = $('.FormView tr');
    let result = [];
    let result2 = [];
    let sems = [];
    let sem_no = "";
    scoreTableTr = scoreTableTr.slice(3);
    scoreTableTr = scoreTableTr.slice(0 ,-2);
    if (!scoreTableTr.length) {
        return Promise.resolve(false);
    }
    for (let i = 0 ; i < scoreTableTr.length ; i++) {
        const td = scoreTableTr.eq(i).find('td');
        let [item , newSem ] = tdFunc[td.length](td , sem_no , sems,result,result2);
        sem_no = newSem;
    }
    //res.cookie("test" , "123" , {signed: true});
    let historyScore = _.cloneDeep(result);
    for (let i in historyScore) {
        let v = historyScore[i];
        v.score = v.Up_Score | v.Down_Score;
        v.Course = v.Course.substring(9);
        if (v.Up_Score) {
            v.Sem = v.Sem + "1";
        } else if (v.Down_Score) {
            v.Sem = v.Sem + "2";
        }
    }
    let tookCourses = await getTookCourse(req);
    if (tookCourses) {
        for (let key in historyScore) {
            let data = historyScore[key];
            let hitCourse = _.find(tookCourses , v=> v.courseName.includes(data.Course) && v.courseSem == data.Sem);
            if (hitCourse) {
                result[key].courseNormalId = hitCourse.courseNormalId;
            }
        }
    }
    req.session.HistoryScore = [result , result2 , sems];
    return Promise.resolve([result , result2 , sems]);
}

module.exports.getHistoryScores = getHistoryScores;