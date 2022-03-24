const myFunc = require('../../../My_Func')
const fetch = require('node-fetch')
const cheerio = require('cheerio')
const _ = require('lodash')
const { MongoExe } = require('../../../../models/common/data.js')
module.exports = async function (req, res) {
    let scoreItem = await getScore(req)
    if (!scoreItem.scores) {
        req.flash('error', '學校系統逾時，請重新登入')
        req.logout()
        return res.status(401).send()
    } else if (scoreItem.ranks == 'CTE') {
        return res.status(400).send()
    }
    return res.send(scoreItem)
}

const tdFunc = {
    7: (td, scores, ranks) => {
        //課程分數
        const tdItem = {
            Name: td.eq(1).text().trim(),
            Class: td.eq(2).text().trim(),
            Teacher: td.eq(3).text().trim(),
            Type: td.eq(4).text().trim(),
            Credit: td.eq(5).text().trim(),
            Score: td.eq(6).text().trim(),
        }
        scores.push(tdItem)
        return tdItem
    },
    2: (td, scores, ranks) => {
        //平均、排名
        const tdItem = {
            id: td.eq(0).text(),
            name: td.eq(1).text(),
        }
        ranks.push(tdItem)
        return tdItem
    },
    1: (td, scores, ranks) => {
        //查無成績資料
        return false
    },
}
function checkNeedWriteCTE(jq) {
    let webTxt = jq('body').text()
    if (webTxt.includes('本學期的教學評量')) {
        return true
    }
    return false
}
async function getScore(req) {
    let ScoreURL = `http://system8.ntunhs.edu.tw/myNTUNHS_student/Modules/Profile/qry/Profile_qry_24.aspx?stno=${req.session.STNO}`
    let j = myFunc.getJar(req)
    //console.log(ScoreURL);
    let reqOption = {
        method: 'GET',
        uri: ScoreURL,
    }
    let fetchCookie = require('fetch-cookie')(fetch, j)
    let ScorePageFetch = await fetchCookie(reqOption.uri, {
        method: reqOption.method,
    })
    let ScorePage = await ScorePageFetch.text()
    let $ = cheerio.load(ScorePage)
    if (checkNeedWriteCTE($)) {
        return [true, 'CTE']
    }
    let scoreTableTr = $('.FormView tr')
    if (scoreTableTr.length <= 0) {
        return [false]
    }
    let titleSemText = scoreTableTr.eq(0).find('td').eq(0).text()
    let sem = titleSemText.match(/[0-9]/gm).join('')
    _.set(req.session.stuInfo, 'nowSem', sem)
    //scoreTableTr = scoreTableTr.slice(2);
    let scores = [] //分數
    let ranks = [] //排名
    for (let i = 2; i < scoreTableTr.length; i++) {
        const td = scoreTableTr.eq(i).find('td')
        tdFunc[td.length](td, scores, ranks)
    }
    let conn = await MongoExe()
    for (let key in scores) {
        let courseScoreObj = scores[key]
        let courseName = courseScoreObj.Name.substring(8).trim()
        let teacher = courseScoreObj.Teacher.trim()
        let db = conn.db('My_ntunhs')
        let collection = db.collection('storedHistoryScore')
        try {
            let queryString = {
                $and: [
                    {
                        courseName: courseName,
                    },
                    {
                        courseTeacher: new RegExp(teacher, 'gi'),
                    },
                ],
            }
            let docCount = await collection.countDocuments(queryString)
            if (docCount > 0) {
                scores[key].haveStoredScore = true
            } else {
                scores[key].haveStoredScore = false
            }
        } catch (e) {
            console.error(e)
            return Promise.resolve(false)
        }
    }
    await conn.close()
    return {
        scores: scores,
        ranks: ranks,
    }
}

module.exports.getScore = getScore
