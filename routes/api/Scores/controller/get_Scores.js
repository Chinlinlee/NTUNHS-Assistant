const myFunc = require('../../../My_Func');
const fetch = require('node-fetch');
const cheerio = require('cheerio');
const _ = require('lodash');
module.exports = async function (req, res) {
    let preRankObj = [];
    //暫時將以前的排名方法去掉
    /*await myFunc.ntunhsApp.signOff.enter(req, res);
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
    }*/
    let [Result, Result_all] = await getScore(req);
    if (!Result) {
        req.flash('error' , '學校系統逾時，請重新登入');
        req.logout();
        return res.status(401).send();
    }
    return res.send([Result, Result_all, preRankObj]);
}

const tdFunc = {
    "7" : (td , result  , result2) => {  //課程分數
        const tdItem = {
            Name:td.eq(1).text() ,
            Class:td.eq(2).text(),
            Teacher:td.eq(3).text(),
            Type:td.eq(4).text(),
            Credit:td.eq(5).text() , 
            Score:td.eq(6).text() , 
        }
        result.push(tdItem);
        return tdItem;
    } , 
    "2" : (td , result , result2) => { //平均、排名
        const tdItem = {
            id:td.eq(0).text() ,
            name:td.eq(1).text(),
        }
        result2.push(tdItem);
        return tdItem;
    }
}

async function getScore(req) {
    let ScoreURL = `http://system8.ntunhs.edu.tw/myNTUNHS_student/Modules/Profile/qry/Profile_qry_24.aspx?stno=${req.session.STNO}`;
    let j = myFunc.getJar(req);
    //console.log(ScoreURL);
    let reqOption = {
        method : "GET"  ,
        uri : ScoreURL
    }
    let fetchCookie = require("fetch-cookie")(fetch , j);
    let ScorePageFetch = await fetchCookie( reqOption.uri , {
        method: reqOption.method
    });
    let ScorePage = await ScorePageFetch.text();
    let $ = cheerio.load(ScorePage);
    let scoreTableTr = $('.FormView tr');
    if (scoreTableTr.length <= 0) {
        return [false];
    }
    let titleSemText = scoreTableTr.eq(0).find('td').eq(0).text();
    let sem = titleSemText.match(/[0-9]/gm).join('');
    _.set(req.session.stuInfo , "nowSem" , sem);
    //scoreTableTr = scoreTableTr.slice(2);
    let scores = []; //分數
    let ranks = []; //排名
    for (let i = 2 ; i < scoreTableTr.length ; i++) {
        const td = scoreTableTr.eq(i).find('td');
        tdFunc[td.length](td , scores , ranks);
    }
    req.session.Score = [scores , ranks];
    return [scores , ranks];
}

module.exports.getScore = getScore;
