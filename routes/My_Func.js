const log = require('log-to-file');
const mongodb = require('../models/common/data');
const request = require('request');
const fetch = require('node-fetch');
const FormData = require('form-data');
const fakeUa = require('fake-useragent');
const cheerio = require('cheerio');
const auth = require('../models/users/School_Auth');
const moment = require('moment');
const tough = require('tough-cookie');
const chrome = require('selenium-webdriver/chrome');
const webdriver = require('selenium-webdriver');
const getPort = require('get-port');
const _ = require('lodash');

module.exports.IsLoggedIn = function (req, res, next) {
    let userIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    if (req.isAuthenticated()) {
        log(
            'IsLoggedIn:' +
                req.isAuthenticated() +
                '  帳號:' +
                req.user +
                '   IP' +
                userIP
        );
        return next();
    }
    log('Not Login' + '   IP:' + userIP);
    res.status(401);
    res.render('./error/401.html');
    res.end();
};

module.exports.IsLoggedInHome = function (req, res, next) {
    if (req.isAuthenticated()) {
        res.header(
            'Cache-Control',
            'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0 '
        );
        res.redirect('/Today_Schedule');
    } else {
        return next();
    }
};

module.exports.ToRegex = async function (i_Item) {
    return new Promise(async (resolve) => {
        let keys = Object.keys(i_Item);
        for (let i = 0; i < keys.length; i++) {
            if (typeof i_Item[keys[i]] == 'string') {
                i_Item[keys[i]] = i_Item[keys[i]].replace(
                    /[\\(\\)\\-\\_\\+\\=\\\/\\.]/g,
                    '\\$&'
                );
                i_Item[keys[i]] = i_Item[keys[i]].replace(/[\*]/g, '\\.$&');
                i_Item[keys[i]] = new RegExp(i_Item[keys[i]], 'gi');
            } else if (_.isObject(i_Item[keys[i]])) {
                await exports.ToRegex(i_Item[keys[i]]);
            }
        }
        return resolve(i_Item);
    });
};

module.exports.stuInfo = {
    getStu: async function (stuNumber) {
        return new Promise(async (resolve) => {
            let query = {
                username: stuNumber,
            };
            let result = await mongodb.Getdata('Students', query);
            if (result.length <= 0) {
                return resolve(false);
            }
            return resolve(result);
        });
    },
    isExpired: async function (stu) {
        return new Promise(async (resolve) => {
            if (stu.lastUpTime) {
                let;
            } else {
                return resolve(false);
            }
        });
    },
};

module.exports.Request_func = async function (req_obj, i_option) {
    return new Promise((resolve) => {
        req_obj(i_option, function (err, response, body) {
            if (err) {
                resolve('error');
            }
            //console.log(i_option.uri);
            //console.log("%j", response['request']['redirects'])
            resolve(body);
        });
    });
};

module.exports.getILMSJar = function (req) {
    //system8
    let jar = new tough.CookieJar();
    let sessionntunhsILMS = _.get(req.session, 'ntunhsILMS');
    if (req && sessionntunhsILMS) {
        req.session.ntunhsILMS.split(';').map(function (value) {
            jar.setCookieSync(value, 'http://ilms.ntunhs.edu.tw');
        });
    }
    return jar;
};

module.exports.getJar = function (req) {
    //system8
    let jar = new tough.CookieJar();
    let sessionntunhsApp = _.get(req.session, 'ntunhsApp');
    if (req && sessionntunhsApp) {
        req.session.ntunhsApp.split(';').map(function (value) {
            jar.setCookieSync(value, 'http://system8.ntunhs.edu.tw');
        });
    }
    return jar;
};

module.exports.getSignOffJar = function (req) {
    let jar = new tough.CookieJar();
    let sessionntunhsSignOff = _.get(req.session, 'ntunhsSignOff');
    if (req && sessionntunhsSignOff) {
        req.session.ntunhsSignOff.split(';').map(function (value) {
            jar.setCookieSync(value, 'http://system10.ntunhs.edu.tw');
        });
    }
    return jar;
};

module.exports.ntunhsApp = {
    signOff: {
        enter: async (req, res) => {
            return new Promise(async (resolve) => {
                let j = exports.getSignOffJar(req);
                let enterURL = `http://system10.ntunhs.edu.tw/Workflow/Modules/Main/login.aspx?first=true&action=&info=`;
                console.log(
                    await j.getCookieString('http://system10.ntunhs.edu.tw')
                );
                let fetchCookie = require('fetch-cookie')(fetch, j);
                let fetchRes = await fetchCookie(enterURL, {
                    method: 'GET',
                });
                let txt = await fetchRes.text();
                if (txt.includes('簽核系統')) {
                    req.session.ntunhsSignOff = await j.getCookieString(
                        'http://system10.ntunhs.edu.tw'
                    );
                    return resolve(true);
                }
            });
        },
        getPreRankCsrf: async (req, res) => {
            return new Promise(async (resolve) => {
                let j = exports.getSignOffJar(req);
                let fetchCookie = require('fetch-cookie')(fetch, j);
                let firstBodyFetch = await fetchCookie(
                    'http://system10.ntunhs.edu.tw/Workflow/Modules/Main/WFdocumentView.aspx',
                    {
                        method: 'GET',
                    }
                );
                let firstBody = await firstBodyFetch.text();
                // console.log(firstBody);
                let $ = cheerio.load(firstBody);
                let __VIEWSTATE = $('#__VIEWSTATE').val();
                let __VIEWSTATEGENERATOR = $('#__VIEWSTATEGENERATOR').val();
                let __EVENTVALIDATION = $('#__EVENTVALIDATION').val();
                let today = moment(new Date()).format('YYYY/MM/DD');
                let form = {
                    ScriptManager1: 'UpdatePanel1|ddlWFName',
                    __EVENTTARGET: 'ddlWFName',
                    __EVENTARGUMENT: '',
                    __LASTFOCUS: '',
                    __VIEWSTATE: __VIEWSTATE,
                    __VIEWSTATEGENERATOR: __VIEWSTATEGENERATOR,
                    __VIEWSTATEENCRYPTED: '',
                    __EVENTVALIDATION: __EVENTVALIDATION,
                    ddlWFName: '修課-少修申請',
                    WCalApplyFrom: '2020/07/08',
                    WCalApplyTo: today,
                    rdoApplyType: 'ALL',
                    hidBrowserAlert: 'true',
                    __ASYNCPOST: 'true',
                };
                myForm = new FormData();
                myForm.append('ScriptManager1', 'UpdatePanel1|ddlWFName');
                myForm.append('__EVENTTARGET', 'ddlWFName');
                myForm.append('__EVENTARGUMENT', '');
                myForm.append('__LASTFOCUS', '');
                myForm.append('__VIEWSTATE', __VIEWSTATE);
                myForm.append('__VIEWSTATEGENERATOR', __VIEWSTATEGENERATOR);
                myForm.append('__VIEWSTATEENCRYPTED', '');
                myForm.append('__EVENTVALIDATION', __EVENTVALIDATION);
                myForm.append('ddlWFName', '修課-少修申請');
                myForm.append('WCalApplyFrom', '2020/07/08');
                myForm.append('WCalApplyTo', today);
                myForm.append('rdoApplyType', 'ALL');
                myForm.append('hidBrowserAlert', 'true');
                myForm.append('__ASYNCPOST', 'true');
                let getCsrfOption = {
                    url: 'http://system10.ntunhs.edu.tw/Workflow/Modules/Main/WFdocumentView.aspx',
                    form: form,
                    jar: j,
                    method: 'POST',
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        Accept: '*/*',
                        'User-Agent':
                            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.83 Safari/537.36',
                    },
                };
                //let csrfBody = await exports.Request_func(request ,getCsrfOption);
                let csrfBodyFetch = await fetchCookie(getCsrfOption.url, {
                    method: 'POST',
                    data: myForm,
                    headers: myForm.getHeaders(),
                });
                let csrfBody = await csrfBodyFetch.text();
                $ = cheerio.load(csrfBody);
                let addFormBtnClick = $('#ImageNew').attr('onclick'); //新增表單按鈕 onclick事件
                if (!addFormBtnClick) {
                    return resolve(false);
                }
                addFormBtnClick = addFormBtnClick.split(/[\'|,]/);
                addFormBtnClick = addFormBtnClick[addFormBtnClick.length - 2];
                return resolve(addFormBtnClick);
            });
        },
        getPreRank: async (req, res, csrf) => {
            return new Promise(async (resolve) => {
                let opt = new chrome.Options();
                let debugPort = await getPort();
                opt.addArguments('--incognito');
                opt.addArguments(`--remote-debugging-port=${debugPort}`);
                opt.addArguments('--no-sandbox');
                opt.addArguments('--disable-dev-shm-usage');
                opt.addArguments('--headless');
                opt.addArguments('--disable-gpu');
                opt.set('unhandledPromptBehavior', 'accept');
                opt.setUserPreferences({
                    'download.default_directory': __dirname,
                });
                let driver = await new webdriver.Builder()
                    .forBrowser('chrome')
                    .setChromeOptions(opt)
                    .build();
                let j = exports.getJar(req);
                let cookieStr = j.getCookieStringSync(
                    'http://system8.ntunhs.edu.tw'
                );
                let aspSessionID = cookieStr.split('=')[1];
                await driver.navigate().to('http://system8.ntunhs.edu.tw/');
                await driver.manage().addCookie({
                    name: 'ASP.NET_SessionId',
                    value: aspSessionID,
                });
                console.log('go to siginoff');
                await driver
                    .navigate()
                    .to(
                        'https://system8.ntunhs.edu.tw/myNTUNHS_student/Modules/Main/TransUrlAutoLogin.aspx?type=workflow'
                    );
                try {
                    await driver.wait(webdriver.until.alertIsPresent());
                    let alert = await driver.switchTo().alert();
                    //Press the OK button
                    await alert.accept();
                } catch (e) {}
                //await driver.navigate().to("http://system10.ntunhs.edu.tw/Workflow/Modules/Main/login.aspx?first=true&action=&info=");
                //driver.quit();
                //$ = cheerio.load(await driver.getPageSource());

                await driver.wait(
                    webdriver.until.elementLocated({
                        id: 'ContentPlaceHolderQuery_QueryFrame',
                    }),
                    15000
                );
                let queryFrame = await driver.findElement({
                    id: 'ContentPlaceHolderQuery_QueryFrame',
                });

                await driver.switchTo().frame(queryFrame);
                let $ = cheerio.load(await driver.getPageSource());
                let optionLen = $('#ddlWFName option').length;
                for (let i = 0; i < optionLen; i++) {
                    let element = $('#ddlWFName option').eq(i);
                    let eText = $(element).text().trim();
                    if (eText.includes('少修申請')) {
                        break;
                    } else if (optionLen - 1 == i) {
                        driver.quit();
                        return resolve(false);
                    }
                }
                await driver.executeScript(
                    `$("#ddlWFName").val("修課-少修申請").change();`
                );
                console.log('select 少修');
                await driver.sleep(871);
                await driver.executeScript(`$("#ImageNew").click();`);
                await driver.switchTo().window(driver.getWindowHandle());
                await driver.sleep(871);
                let applyFrame = await driver.findElement({
                    id: 'iframeApplyFormContent',
                });
                console.log('open applyform');
                await driver.switchTo().frame(applyFrame);
                $ = cheerio.load(await driver.getPageSource());
                let semnoOption = $('#ddlSemNo option');
                let formRank = [];
                let allSemno = req.session.stuInfo.allSemno;
                for (let index in semnoOption) {
                    let optionVal = semnoOption.eq(index).val();
                    if (optionVal) {
                        await driver.executeScript(
                            `$("#ddlSemNo").val(${optionVal}).change();`
                        );
                        await driver.sleep(187);
                        $ = cheerio.load(await driver.getPageSource());
                        let semIndexInStuInfo = allSemno.findIndex(function (
                            value,
                            index
                        ) {
                            return value == optionVal;
                        });
                        semIndexInStuInfo -= 1;
                        if (semIndexInStuInfo < 0)
                            semIndexInStuInfo = allSemno.length - 1;
                        formRank.push({
                            sem: allSemno[semIndexInStuInfo],
                            rank: $('#lblRANK').text(),
                            rankPercentInClass: $('#lblRANKPERCENTILE').text(),
                        });
                    }
                }
                console.log(formRank);
                driver.quit();
                return resolve(formRank);
            });
        },
        /**
         * http://system10.ntunhs.edu.tw/Workflow/Modules/Workflow/%e4%bf%ae%e8%aa%b2%e5%8b%95%e6%85%8b%e7%94%b3%e8%ab%8b/apply_form.aspx?id=&workflowname=%e4%bf%ae%e8%aa%b2-%e5%b0%91%e4%bf%ae%e7%94%b3%e8%ab%8b&userid=062214204&timestamp=20200904233748&csrf=pVFZMl4cNqlVl1wUCWPgTxyDq%2bKtV0S2RlCyvF8BBZK6LRjCP3%2bCuQJp8IHXmpxB
         * id=
         * workflowname=修課-少修申請
         * userid = userid
         * timestamp = 20200904233748
         * csrf=pVFZMl4cNqlVl1wUCWPgTxyDq+KtV0S2RlCyvF8BBZK6LRjCP3+CuQJp8IHXmpxB
         */
    },
};
