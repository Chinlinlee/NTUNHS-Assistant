const log  = require('log-to-file');
const mongodb = require('../models/common/data')
const request  = require('request');
const fetch = require('node-fetch');
const FormData = require('form-data');
const fakeUa = require('fake-useragent');
const cheerio = require('cheerio');
const auth = require("../models/users/School_Auth");
const moment = require('moment');
const tough =  require('tough-cookie');
const chrome = require('selenium-webdriver/chrome');
const webdriver = require('selenium-webdriver');

module.exports.IsLoggedIn = function(req ,res , next)
{  
    if (req.isAuthenticated())
    {
        log("IsLoggedIn:" + req.isAuthenticated() +"  帳號:" +req.user  + "   IP" + req.connection.remoteAddress);
        return next();
    }
    log("Not Login" + "   IP:" + req.connection.remoteAddress);
    /*res.writeHead(401, {
        "Content-Type" : "text/html;charset=utf8"
    });*/
    /*res.write(`Unauthorized <br/>未登入(2秒後跳轉) <br/><a href='/'>Go to Login Page<a/><meta http-equiv='refresh' content='2; url='/' />
    <script>
        setTimeout(() => {
            window.location = "/";
        }, 2000);
    </script>
    `);*/
    res.status(401);
    res.render('./error/401.html');
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
    let sessionntunhsApp = _.get(req.session , "ntunhsApp");
    if (req && sessionntunhsApp) {
        req.session.ntunhsApp.split(";").map(function (value) {
            jar.setCookieSync(value, "http://system8.ntunhs.edu.tw");
        })
    }
    return jar;
}

module.exports.getSignOffJar = function (req) {
    let jar = new tough.CookieJar();
    let sessionntunhsSignOff = _.get(req.session , "ntunhsSignOff");
    if (req && sessionntunhsSignOff) {
        req.session.ntunhsSignOff.split(";").map(function (value) {
            jar.setCookieSync(value , "http://system10.ntunhs.edu.tw");
        });
    }
    return jar;
}




module.exports.ntunhsApp = {
    signOff : {
        enter : async (req , res) => {
            return new Promise (async (resolve) => {
                let j = exports.getSignOffJar(req);
                let enterURL = `http://system10.ntunhs.edu.tw/Workflow/Modules/Main/login.aspx?first=true&action=&info=`;
                console.log( await j.getCookieString('http://system10.ntunhs.edu.tw'));
                let fetchCookie = require('fetch-cookie')(fetch ,j);
                let fetchRes = await fetchCookie(enterURL , {
                    method : "GET"
                });
                let txt = await fetchRes.text();
                req.session.ntunhsSignOff = await j.getCookieString('http://system10.ntunhs.edu.tw');
                if (txt.includes('簽核系統')) {
                    return resolve(true);
                }
            });
        } , 
        getPreRankCsrf : async (req , res) => {
            return new Promise (async (resolve)=> {
                let j = exports.getSignOffJar(req);
                let fetchCookie = require('fetch-cookie')(fetch , j);
                let firstBodyFetch =await fetchCookie("http://system10.ntunhs.edu.tw/Workflow/Modules/Main/WFdocumentView.aspx" , {
                    method : "GET"
                });
                let firstBody = await firstBodyFetch.text();
               // console.log(firstBody);
                let  $ = cheerio.load(firstBody);
                let __VIEWSTATE = $("#__VIEWSTATE").val();
                let __VIEWSTATEGENERATOR = $("#__VIEWSTATEGENERATOR").val();
                let __EVENTVALIDATION = $("#__EVENTVALIDATION").val();
                let today = moment(new Date()).format("YYYY/MM/DD");
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
                    "WCalApplyTo" : today ,
                    "rdoApplyType" : "ALL" , 
                    "hidBrowserAlert" : "true" ,
                    "__ASYNCPOST" : "true"
                }
                myForm = new FormData();
                myForm.append('ScriptManager1' , "UpdatePanel1|ddlWFName");
                myForm.append("__EVENTTARGET" , "ddlWFName" );
                myForm.append("__EVENTARGUMENT" , "" );
                myForm.append("__LASTFOCUS", "" );
                myForm.append("__VIEWSTATE" , __VIEWSTATE );
                myForm.append("__VIEWSTATEGENERATOR" , __VIEWSTATEGENERATOR);
                myForm.append("__VIEWSTATEENCRYPTED" , ""  );
                myForm.append("__EVENTVALIDATION" , __EVENTVALIDATION);
                myForm.append( "ddlWFName" , "修課-少修申請" );
                myForm.append("WCalApplyFrom" , "2020/07/08");
                myForm.append("WCalApplyTo" , today);
                myForm.append("rdoApplyType"  ,"ALL" );
                myForm.append("hidBrowserAlert" , "true");
                myForm.append("__ASYNCPOST" , "true");
                let getCsrfOption = {
                    url : "http://system10.ntunhs.edu.tw/Workflow/Modules/Main/WFdocumentView.aspx" , 
                    form : form , 
                    jar : j , 
                    method : "POST" , 
                    headers : {
                        "Content-Type" : "multipart/form-data" ,
                        "Accept" : "*/*" ,
                        "User-Agent" : "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.83 Safari/537.36"
                    }
                };
                //let csrfBody = await exports.Request_func(request ,getCsrfOption);
                let csrfBodyFetch = await fetchCookie(getCsrfOption.url , {
                    method : "POST" ,
                    data : myForm , 
                    headers : myForm.getHeaders()
                });
                let csrfBody = await csrfBodyFetch.text();
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
                let opt = new chrome.Options();
                opt.addArguments('--incognito');
                opt.setUserPreferences({ "download.default_directory": __dirname });
                let driver = await new webdriver.Builder().forBrowser('chrome').setChromeOptions(opt).build();
                let j = exports.getSignOffJar(req);
                let cookieStr =j.getCookieStringSync("http://system10.ntunhs.edu.tw");
                let aspSessionID = cookieStr.split("=")[1];
                await driver.navigate().to("http://system10.ntunhs.edu.tw/Workflow/Modules/Main/login.aspx?first=false&action=&info=");
                await driver.manage().addCookie({
                    name : "ASP.NET_SessionId" , 
                    value : aspSessionID
                });
                await driver.navigate().to("http://system10.ntunhs.edu.tw/Workflow/Modules/Main/login.aspx?first=true&action=&info=");
                driver.quit();
                let timestamp = moment(new Date()).format("YYYYMMDDkkmmss");
                let url =`http://system10.ntunhs.edu.tw/Workflow/Modules/Workflow/%e4%bf%ae%e8%aa%b2%e5%8b%95%e6%85%8b%e7%94%b3%e8%ab%8b/apply_form.aspx?id=&workflowname=%e4%bf%ae%e8%aa%b2-%e5%b0%91%e4%bf%ae%e7%94%b3%e8%ab%8b&userid=${req.user}&timestamp=${timestamp}&csrf=${csrf}`;
                let reqOption = {
                    method : "GET"  ,
                    uri : url , 
                    jar : j 
                }
                let fetchCookie = require('fetch-cookie')(fetch , j);
                let fetchRes = await fetchCookie(reqOption.uri , {
                    method : reqOption.method
                });
                let body = await fetchRes.text();
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