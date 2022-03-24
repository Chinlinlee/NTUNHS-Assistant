const { MongoExe } = require('../../../../models/common/data.js');
const { ntunhsApp } = require('../../../My_Func');
const myFunc = require('../../../My_Func');
const cheerio = require('cheerio');
const _ = require('lodash');
const fetch = require('node-fetch');
const { getTookCourse } = require('../../learnMap/controller/get_tookCourse');
module.exports = async function (req, res) {
    let crawlerHistoryScore = await getHistoryScores(req);
    if (!crawlerHistoryScore) {
        req.flash('error', '請重新登入');
        req.logout();
        return res.status(401).send();
    }
    return res.send(crawlerHistoryScore);
};

const tdFunc = {
    7: function (td, sem_no, sems, historyScores, historyScoresRanks) {
        //課程成績
        const tdSem = td.eq(0).text();
        tdSem
            ? (() => {
                  sem_no = tdSem;
                  sems.push({ Sem: sem_no });
              })()
            : undefined;
        const tdItem = {
            Sem: sem_no,
            Type: td.eq(1).text(),
            Course: td.eq(2).text(),
            Up_Credit: td.eq(3).text(),
            Up_Score: td.eq(4).text(),
            Down_Credit: td.eq(5).text(),
            Down_Score: td.eq(6).text(),
        };
        historyScores.push(tdItem);
        return [tdItem, sem_no];
    },
    5: function (td, sem_no, sems, historyScores, historyScoresRanks) {
        //平均分數
        const tdItem = {
            title: td.eq(0).text(),
            Up_Credit: td.eq(1).text(),
            Up_Score: td.eq(2).text(),
            Down_Credit: td.eq(3).text(),
            Down_Score: td.eq(4).text(),
        };
        historyScoresRanks.push(tdItem);
        return [tdItem];
    },
    2: function (td, sem_no, sems, historyScores, historyScoresRanks) {
        //累計排名，累計平均
        const tdItem = {
            title: td.eq(0).text(),
            Up_Credit: td.eq(1).text(),
        };
        historyScoresRanks.push(tdItem);
        return [tdItem];
    },
};

async function getHistoryScores(req) {
    let j = myFunc.getJar(req);
    let historyScoreURL = `http://system8.ntunhs.edu.tw/myNTUNHS_student/Modules/Profile/qry/Profile_qry_25.aspx?stno=${req.session.STNO}`;
    let reqOption = {
        method: 'GET',
        uri: historyScoreURL,
    };
    let fetchCookie = require('fetch-cookie')(fetch, j);
    let historyScorePageFetch = await fetchCookie(reqOption.uri, {
        method: reqOption.method,
    });
    let historyScorePage = await historyScorePageFetch.text();
    let $ = cheerio.load(historyScorePage);
    let scoreTableTr = $('.FormView tr');
    let historyScores = [];
    let historyScoresRanks = [];
    let sems = [];
    let sem_no = '';
    scoreTableTr = scoreTableTr.slice(3);
    scoreTableTr = scoreTableTr.slice(0, -2);
    if (!scoreTableTr.length) {
        return Promise.resolve(false);
    }
    for (let i = 0; i < scoreTableTr.length; i++) {
        const td = scoreTableTr.eq(i).find('td');
        let [item, newSem] = tdFunc[td.length](
            td,
            sem_no,
            sems,
            historyScores,
            historyScoresRanks
        );
        sem_no = newSem;
    }
    //res.cookie("test" , "123" , {signed: true});
    let historyScoresClone = _.cloneDeep(historyScores);
    for (let i in historyScoresClone) {
        let v = historyScoresClone[i];
        v.score = v.Up_Score | v.Down_Score;
        v.Course = v.Course.substring(9);
        if (v.Up_Score) {
            v.Sem = v.Sem + '1';
        } else if (v.Down_Score) {
            v.Sem = v.Sem + '2';
        }
    }
    let tookCourses = await getTookCourse(req);
    if (tookCourses) {
        for (let key in historyScoresClone) {
            let data = historyScoresClone[key];
            let hitCourse = _.find(
                tookCourses,
                (v) =>
                    v.courseName.includes(data.Course) &&
                    v.courseSem == data.Sem
            );
            if (hitCourse) {
                historyScores[key].courseNormalId = hitCourse.courseNormalId;
                historyScores[key].courseTeacher = hitCourse.courseTeacher;
            }
        }
    } else {
        return false;
    }
    let conn = await MongoExe();
    for (let key in historyScores) {
        let historyCourseScoreObj = historyScores[key];
        let courseName = historyCourseScoreObj.Course.substring(9);

        let db = conn.db('My_ntunhs');
        let collection = db.collection('storedHistoryScore');
        try {
            let queryString = {
                $and: [
                    {
                        courseName: courseName,
                    },
                    {
                        courseTeacher: new RegExp(
                            historyCourseScoreObj.courseTeacher,
                            'gi'
                        ),
                    },
                ],
            };
            let docCount = await collection.countDocuments(queryString);
            if (docCount > 0) {
                historyScores[key].haveStoredScore = true;
            } else {
                historyScores[key].haveStoredScore = false;
            }
        } catch (e) {
            console.error(e);
            return Promise.resolve(false);
        }
    }
    await conn.close();
    //result -> 歷年成績
    //result2 -> 平均分數 , 累計學分、排名...
    //sems -> 所有學年
    let scoresItem = _.compact(
        historyScores.map((v) => {
            if (Number(v.Up_Score)) {
                let score = Number(v.Up_Score.trim());
                let semCredit = Number(v.Up_Credit.trim());
                let obj = {
                    score: score,
                    credit: semCredit,
                };
                return obj;
            } else if (Number(v.Down_Score)) {
                let score = Number(v.Down_Score.trim());
                let semCredit = Number(v.Down_Credit.trim());
                let obj = {
                    score: score,
                    credit: semCredit,
                };
                return obj;
            }
        })
    );
    let creditSum = _.sumBy(scoresItem, 'credit');
    let sumOfCreditMulPoint = 0;
    scoresItem.map((v) => {
        if (v.score >= 80 && v.score <= 100) {
            sumOfCreditMulPoint += v.credit * 4;
        } else if (v.score >= 70 && v.score <= 79) {
            sumOfCreditMulPoint += v.credit * 3;
        } else if (v.score >= 60 && v.score <= 69) {
            sumOfCreditMulPoint += v.credit * 2;
        } else if (v.score >= 50 && v.score <= 59) {
            sumOfCreditMulPoint += v.credit * 1;
        } else if (v.score >= 0 && v.score <= 49) {
            sumOfCreditMulPoint += v.credit * 0;
        }
    });
    const GPA = (sumOfCreditMulPoint / creditSum).toFixed(2);
    //return Promise.resolve([historyScores, historyScoresRanks, sems, GPA]);
    return Promise.resolve({
        historyScores: historyScores,
        historyScoresRanks: historyScoresRanks,
        sems: sems,
        GPA: GPA,
    });
}

module.exports.getHistoryScores = getHistoryScores;
