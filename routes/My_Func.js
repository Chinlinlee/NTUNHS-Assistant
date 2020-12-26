const log  = require('log-to-file');
const mongodb = require('../models/common/data')
const request  = require('request');
const fetch = require('node-fetch');
const fakeUa = require('fake-useragent');
const cheerio = require('cheerio');
const auth = require("../models/users/School_Auth");
const moment = require('moment');
const tough =  require('tough-cookie');
module.exports.IsLoggedIn = function(req ,res , next)
{  
    if (req.isAuthenticated())
    {
        log("IsLoggedIn:" + req.isAuthenticated() +"  帳號:" +req.user  + "   IP" + req.connection.remoteAddress);
        return next();
    }
    log("Not Login" + "   IP:" + req.connection.remoteAddress);
    res.writeHead(401,{"Content-Type" : "text/html;charset=utf8"});
    res.write("Unauthorized <br/>未登入(2秒後跳轉) <br/><a href='/'>Go to Login Page<a/><meta http-equiv='refresh' content='2; url='/' />");
    res.end();
}

module.exports.IsLoggedInHome = function(req ,res , next)
{  
    if (req.isAuthenticated())
    {
        res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0 ');
        res.redirect('/Today_Schedule');
    }
    else
    {
        return next();
    }
}

module.exports.ToRegex = async function (i_Item) {
    return new Promise(async (resolve) => {
        let keys = Object.keys(i_Item);
        for (let i = 0; i < keys.length; i++) {
            if (typeof (i_Item[keys[i]]) == "string") {
                i_Item[keys[i]] = i_Item[keys[i]].replace(/[\\(\\)\\-\\_\\+\\=\\\/\\.]/g, '\\$&');
                i_Item[keys[i]] = i_Item[keys[i]].replace(/[\*]/g, '\\.$&');
                i_Item[keys[i]] = new RegExp(i_Item[keys[i]], 'gi');
            } else if (_.isObject(i_Item[keys[i]])) {
                await exports.ToRegex(i_Item[keys[i]]);
            }
        }
        return resolve(i_Item);
    });
}

module.exports.stuInfo = 
{
    getStu : async function (stuNumber) 
    {
        return new Promise(async (resolve) =>
        {
            let query = 
            {
                "username" :  stuNumber
            }
            let result = await mongodb.Getdata('Students' , query);
            if (result.length <= 0 )
            {
                return resolve(false);
            }
            return resolve(result);
        });
    } , 
    isExpired : async function (stu)
    {
        return new Promise (async (resolve) =>
        {
            if (stu.lastUpTime)
            {
                let 
            }
            else
            {
                return resolve(false);
            }
        });
    }
}

module.exports.Request_func= async function(req_obj  , i_option) 
{
    return new Promise ((resolve)=>
    {
        req_obj(i_option , function (err,  response , body)
        {
            if (err) 
            {
                resolve('error');
            } 
            //console.log(i_option.uri);
            //console.log("%j", response['request']['redirects'])
            resolve(body);
        });
    });
}

module.exports.getJar = function  (req) { //system8
    /*let jar = request.jar();
    if (req && req.session.ntunhsApp) {
        req.session.ntunhsApp.split(";").map(function (value) {
            jar.setCookie(request.cookie(value) , "http://system8.ntunhs.edu.tw");
        })
    }
    return jar;*/
    let jar = new tough.CookieJar();
    if (req && req.session.ntunhsApp) {
        req.session.ntunhsApp.split(";").map(function (value) {
            jar.setCookieSync(value, "http://system8.ntunhs.edu.tw");
        })
    }
    return jar;
}

module.exports.getSignOffJar = function (req) {
    let jar = request.jar();
    if (req && req.session.ntunhsSignOff) {
        req.session.ntunhsSignOff.split(";").map(function (value) {
            jar.setCookie(request.cookie(value) , "http://system10.ntunhs.edu.tw");
        });
    }
    return jar;
}


module.exports.ntunhsApp = {
    getCourse : async (req) => {
        if (req.session.Course.length > 0) {
            return req.session.Course;
        }
        let courses_URL = `http://system8.ntunhs.edu.tw/myNTUNHS_student/Modules/Profile/qry/Profile_qry_14.aspx?stno=undefined&size=100&action=LoadJSon`;
        let reqOption = {
            method : "GET"  ,
            uri : courses_URL , 
            jar : exports.getJar(req)
        }
        let fetchCookie = require('fetch-cookie')(fetch , exports.getJar(req));
        fetchCookie
        let courseFetch = await fetchCookie(reqOption.uri , {method : reqOption.method});
        let course = await courseFetch.text();
        let courseJson = "";
        try {
            courseJson = JSON.parse(course);
        } catch (e) {
            return Promise.resolve(false);
        }
        _.unset(courseJson , "0");
        let result = [];
        for (let i  in courseJson) {
            let item = courseJson[i]
            result.push({
                Name:item.課程代碼與名稱_L.substr(11) , 
                Code : item.課程代碼與名稱_L.substr(0,10) ,
                Place:item.教室,
                Day:item.星期,
                Period:item.節次,
                Credit:item.學分 , 
                Type:item.課程性質 , 
                Teacher:item.任課教師_L.replace(/<br\/>/gi , "") ,
                Other : item.備註_L
            });
        }
        req.session.Course = result;
        return Promise.resolve(result);
    } , 
    Score : {
        tdFunc : {
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
        } ,
        get : async function (req)  {
            if (req.session.Score.length >0) {
                return req.session.Score;
            }
            let ScoreURL = `http://system8.ntunhs.edu.tw/myNTUNHS_student/Modules/Profile/qry/Profile_qry_24.aspx?stno=${req.session.STNO}`;
            let j = exports.getJar(req);
            console.log(ScoreURL);
            let reqOption = {
                method : "GET"  ,
                uri : ScoreURL , 
                jar : exports.getJar(req)
            }
            let fetchCookie = require("fetch-cookie")(fetch , j);
            let ScorePageFetch = await fetchCookie( reqOption.uri , {method: reqOption.method4});
            let ScorePage = await ScorePageFetch.text();
            let $ = cheerio.load(ScorePage);
            let scoreTableTr = $('.FormView tr');
            if (scoreTableTr.length <= 0) {
                return [false];
            }
            scoreTableTr = scoreTableTr.slice(2);
            let result = []; //分數
            let result2 = []; //排名
            for (let i = 0 ; i < scoreTableTr.length ; i++) {
                const td = scoreTableTr.eq(i).find('td');
                this.tdFunc[td.length](td , result , result2);
            }
            req.session.Score = [result , result2];
            return [result , result2];
        }
    } ,
    historyScores : {
        tdFunc : {
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
        },
        get : async function (req , res) {
            if (req.session.HistoryScore.length > 0) {
                return req.session.HistoryScore;
            }
            let historyScoreURL = `http://system8.ntunhs.edu.tw/myNTUNHS_student/Modules/Profile/qry/Profile_qry_25.aspx?stno=${req.session.STNO}`;
            let reqOption = {
                method : "GET"  ,
                uri : historyScoreURL , 
                jar : exports.getJar(req)
            }
            let fetchCookie = require("fetch-cookie")(fetch , reqOption.jar);
            let historyScorePageFetch = await fetchCookie(reqOption.uri , {method : reqOption.method});
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
                let [item , newSem ] = this.tdFunc[td.length](td , sem_no , sems,result,result2);
                sem_no = newSem;
            }
            //res.cookie("test" , "123" , {signed: true});
            req.session.HistoryScore = [result , result2 , sems];
            return Promise.resolve([result , result2 , sems]);
        }
    } ,
    signOff : {
        enter : async (req , res) => {
            let j = exports.getSignOffJar(req);
            let enterURL = `http://system10.ntunhs.edu.tw/Workflow/Modules/Main/login.aspx?first=true&action=&info=`;
            let reqOption = {
                method : "GET"  ,
                uri : enterURL , 
                jar : j , 
                followRedirect : true
            }
            let body =await exports.Request_func(request , reqOption);
            req.session.ntunhsSignOff = j.getCookieString('http://system10.ntunhs.edu.tw');
        } , 
        getPreRankCsrf : async (req , res) => {
            return new Promise (async (resolve)=> {
                let j = exports.getSignOffJar(req);
                let firstBody =await exports.Request_func(request , {
                    uri : "http://system10.ntunhs.edu.tw/Workflow/Modules/Main/WFdocumentView.aspx" , 
                    method : "GET" , 
                    jar : j
                });
                let  $ = cheerio.load(firstBody);
                let __VIEWSTATE = $("#__VIEWSTATE").val();
                let __VIEWSTATEGENERATOR = $("#__VIEWSTATEGENERATOR").val();
                let __EVENTVALIDATION = $("#__EVENTVALIDATION").val();
                let form = {
                    "ScriptManager1" : "UpdatePanel1|ddlWFName" , 
                    "__EVENTTARGET" : "ddlWFName" , 
                    "__EVENTARGUMENT" : "" ,
                    "__LASTFOCUS" : "" ,
                    "__VIEWSTATE" : __VIEWSTATE ,
                    "__VIEWSTATEGENERATOR" : __VIEWSTATEGENERATOR ,
                    "__VIEWSTATEENCRYPTED" : ""   ,
                    "__EVENTVALIDATION" : __EVENTVALIDATION ,
                    "ddlWFName" : "修課-少修申請" , 
                    "WCalApplyFrom" : "2020/07/08" ,
                    "WCalApplyTo" : "2020/09/20" ,
                    "rdoApplyType" : "ALL" , 
                    "hidBrowserAlert" : "true" ,
                    "__ASYNCPOST" : "true"
                }
                let getCsrfOption = {
                    url : "http://system10.ntunhs.edu.tw/Workflow/Modules/Main/WFdocumentView.aspx" , 
                    form : form , 
                    jar : j , 
                    method : "POST" , 
                    headers : {
                        "Content-Type" : "multipart/form-data;" ,
                        "Accept" : "*/*" ,
                        "User-Agent" : "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.83 Safari/537.36"
                    }
                };
                let csrfBody = await exports.Request_func(request ,getCsrfOption);
                $ = cheerio.load(csrfBody);
                let addFormBtnClick = $("#ImageNew").attr("onclick"); //新增表單按鈕 onclick事件
                if (!addFormBtnClick) {
                    return resolve(false);
                }
                addFormBtnClick = addFormBtnClick.split(/[\'|,]/);
                addFormBtnClick = addFormBtnClick[addFormBtnClick.length-2];
                return resolve(addFormBtnClick);
            });
        } , 
        getPreRank : async  (req , res , csrf) => {
            return new Promise (async (resolve)=> {
                let j = exports.getSignOffJar(req);
                let timestamp = moment(new Date()).format("YYYYMMDDkkmmss");
                let url =`http://system10.ntunhs.edu.tw/Workflow/Modules/Workflow/%e4%bf%ae%e8%aa%b2%e5%8b%95%e6%85%8b%e7%94%b3%e8%ab%8b/apply_form.aspx?id=&workflowname=%e4%bf%ae%e8%aa%b2-%e5%b0%91%e4%bf%ae%e7%94%b3%e8%ab%8b&userid=${req.user}&timestamp=${timestamp}&csrf=${csrf}`;
                console.log(url);
                let reqOption = {
                    method : "GET"  ,
                    uri : url , 
                    jar : j 
                }
                let body = await exports.Request_func(request , reqOption);
                $ = cheerio.load(body);
                let tableTr = $("table tr");
                for (let i = 0 ; i< tableTr.length ; i++) {
                    let text =$("table tr").eq(i).text();
                    if (text.includes("前學期名次")) {
                        text =text.replace(/[ |]/gi , "");
                        text = text.split("\n");
                        text = _.compact(text);
                        text = await Promise.all(_.filter(text , v=> v.replace(/\s/gi , "").length));
                        console.log(text);
                        return resolve(text);
                    }
                }
                return resolve(false);
            });
        }
        /**
         * http://system10.ntunhs.edu.tw/Workflow/Modules/Workflow/%e4%bf%ae%e8%aa%b2%e5%8b%95%e6%85%8b%e7%94%b3%e8%ab%8b/apply_form.aspx?id=&workflowname=%e4%bf%ae%e8%aa%b2-%e5%b0%91%e4%bf%ae%e7%94%b3%e8%ab%8b&userid=062214204&timestamp=20200904233748&csrf=pVFZMl4cNqlVl1wUCWPgTxyDq%2bKtV0S2RlCyvF8BBZK6LRjCP3%2bCuQJp8IHXmpxB
         * id=
         * workflowname=修課-少修申請
         * userid = userid
         * timestamp = 20200904233748
         * csrf=pVFZMl4cNqlVl1wUCWPgTxyDq+KtV0S2RlCyvF8BBZK6LRjCP3+CuQJp8IHXmpxB
         */
    }
}