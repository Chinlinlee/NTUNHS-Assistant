var LocalStrategy = require('passport-local').Strategy;
const School_Auth = require('./School_Auth.js');
const myFunc = require('../../routes/My_Func');
const { MongoExe } = require('../../models/common/data');
const cheerio = require('cheerio');
const nodeFetch = require('node-fetch');
require('tls').DEFAULT_MIN_VERSION = 'TLSv1';
const _ = require('lodash');

async function updateSTNOToDB(req, stno) {
    try {
        let mongoConn = await MongoExe();
        let db = mongoConn.db("My_ntunhs");
        let studentCollection = db.collection("Students");
        await studentCollection.findOneAndUpdate({
            username: req.body.username
        }, {
            $set: {
                stno: stno
            }
        }, {
            upsert: true
        });
        console.log(`update STNO of student ${req.body.username} successful`);
        return {
            status: true, 
            data: "update STNO successful"
        };
    } catch(e) {
        console.error(e);
        return {
            status: false, 
            data: e
        };
    }
}

async function getSTNOFromDB(req) {
    try {
        let mongoConn = await MongoExe();
        let db = mongoConn.db("My_ntunhs");
        let studentCollection = db.collection("Students");
        let stuInfo = await studentCollection.findOne({
            username: req.body.username
        });
        if (stuInfo) {
            return {
                status: true,
                isError: false,
                data: stuInfo.stno
            };
        }
        return {
            status: false,
            isError: false,
            data: "student info not exist"
        }
    } catch(e) {
        console.error(e);
        return {
            status: false,
            isError: true,
            data: e
        }
    }
}
async function getSTNO(req, iFetch) {
    let stnoInDB = await getSTNOFromDB(req);
    if (stnoInDB.status) return stnoInDB.data;
    else if (!stnoInDB.status && !stnoInDB.isError) {
        let option = {
            method: 'GET',
            uri: `http://system8.ntunhs.edu.tw/myNTUNHS_student/Modules/Profile/tab/Profile_tab_02.aspx`,
        };
        let fetchRes = await iFetch(option.uri);
        let getStnoPageUri = await fetchRes.text();
        //let getStnoPageUri = await myFunc.Request_func(myReqObj  , option);
        let $ = cheerio.load(getStnoPageUri);
        let aElement = $('a');
        let aTags = ''; //$("a")[0].attribs.href;
        for (let index in aElement) {
            let aHref = $(aElement[index]).attr('href') || '';
            if (aHref.includes('ShowModalDialog')) {
                aTags = aHref;
                break;
            }
        }
        option = {
            method: 'GET',
            uri: aTags,
        };
        let getStnoPageRes = await iFetch(option.uri, {
            method: 'GET',
            redirect: 'follow',
        });
        let getStnoPage = await getStnoPageRes.text();
        $ = cheerio.load(getStnoPage);
        let frame = $('iframe');
        let stno = '';
        try {
            for (let index in frame) {
                let frameSrc = $(frame[index]).attr('src') || '';
                console.log("found the stno frame URL:",frameSrc);
                if (frameSrc.includes('stno')) {
                    stno = frameSrc.substring(frameSrc.indexOf('stno=') + 5);
                    break;
                }
            }
        } catch (e) {
            console.error(e);
        }
        //let stno = frameSrc.substring(frameSrc.indexOf('stno=')+5);
        if (!stno) {
            console.error('stno 錯誤');
            console.error(req.session.stuInfo);
        }
        await updateSTNOToDB(req, stno);
        return stno;
    }
}

module.exports = async function (passport) {
    passport.serializeUser(function (user, done) {
        done(null, user);
    });
    passport.deserializeUser(function (id, done) {
        done(null, id);
    });
    passport.use(
        'local-login',
        new LocalStrategy(
            {
                usernameField: 'username',
                passwordField: 'password',
                session: true,
                passReqToCallback: true,
            },
            async function (req, username, password, done) {
                let loginResult = await School_Auth.Auth(
                    username,
                    password,
                    req
                );
                //req.session.myJar = myReqObj.jar;
                let loginResultCode = loginResult.split('_');
                let j = myFunc.getJar(req);
                if (!loginResultCode.includes('true')) {
                    console.log('error pwd');
                    return done(null, false, {
                        message: '帳號或密碼錯誤(Invalid user or password)',
                    });
                }
                let fetch = require('fetch-cookie')(nodeFetch, j, false);

                //獲取學生基本資料，即 e-portfolio 左邊的學生資訊
                let stuInfoResult = await getStudentBasicInfo(username, loginResultCode, fetch);
                req.session.stuInfo = stuInfoResult;

                let sessionStuInfo = _.get(req.session, 'stuInfo');
                //獲取學生科系的代碼、科系的群組代碼、學制代碼，並暫存至 session
                await getStudentStudyCodeInfo(sessionStuInfo, fetch);

                //獲取學生待過的學年，並儲存至 session
                await setStudentStayedSem(sessionStuInfo, fetch);

                req.session.ntunhsApp = await j.getCookieString(
                    'http://system8.ntunhs.edu.tw'
                );
                req.session.Course = [];
                req.session.HistoryScore = [];
                req.session.noPreRank = false;
                let STNO = await getSTNO(req, fetch);
                req.session.STNO = STNO;
                if (!STNO) {
                    return done(
                        null,
                        false,
                        req.flash(
                            'error',
                            '無法取得資訊，請重新登入，若還是無法登入請聯繫作者。'
                        )
                    );
                }

                await School_Auth.ilmsAuth(username, password, req);
                return done(null, username);
            }
        )
    );
};

async function updateStudentInfoToDB(username, stuInfoObj) {
    try {
        let mongoConn = await MongoExe();
        let db = mongoConn.db("My_ntunhs");
        let studentCollection = db.collection("Students");
        await studentCollection.findOneAndUpdate({
            username: username
        }, {
            $set: stuInfoObj
        }, {
            upsert: true
        });
        console.log(`update student info of student ${username} successful`);
        return {
            status: true, 
            data: "update student info successful"
        };
    } catch(e) {
        console.error(e);
        return {
            status: false, 
            data: e
        };
    }
}
async function getStudentBasicInfoFromDB(username) {
    try {
        let mongoConn = await MongoExe();
        let db = mongoConn.db("My_ntunhs");
        let studentCollection = db.collection("Students");
        let stuInfo = await studentCollection.findOne({
            username: username
        });
        let stuFaculty = _.get(stuInfo, "stuFaculty", false);
        if (stuFaculty) {
            return {
                status: true,
                isError: false,
                data: stuInfo
            };
        }
        return {
            status: false,
            isError: false,
            data: "student info not exist"
        }
    } catch(e) {
        console.error(e);
        return {
            status: false,
            isError: true,
            data: e
        }
    }
}

/**
 * 獲取學生基本資料，即 e-portfolio 左邊的學生資訊
 * @param {string} username 
 * @param {Array<string>} loginResultCode 
 * @param {import('fetch-cookie')} fetch 
 * @returns 
 */
async function getStudentBasicInfo (username, loginResultCode, fetch) {
    let loginHomeOption = {
        method: 'GET',
        uri: `https://system8.ntunhs.edu.tw/myNTUNHS_student/Common/UserControls/loginModule.aspx?txtid=${username}&code=${loginResultCode[1]}&from=OVGfeJ71k85Va+5tUAkRpREuBeu/vj73Xq3Nr9sDoY5sDt38lS4gFsKrX0qYogYUVoxr8f++8G+yMZLEa9IDN5SWFS76zmop52j0OW69Fks=&select=student`,
    };
    let homeFetchRes = await fetch(loginHomeOption.uri, {
        method: 'GET',
    });
    let stuInfoInDB = await getStudentBasicInfoFromDB(username);
    if (stuInfoInDB.status) return stuInfoInDB.data;
    else if (!stuInfoInDB.status && !stuInfoInDB.isError) {
        let homeBody = await homeFetchRes.text();
        let $ = cheerio.load(homeBody);
        let Profile = $('#ctl00_tableProfile tr');
    
        let stuInfo = [];
        for (let i = 0; i < Profile.length; i++) {
            let td = Profile.eq(i).find('td');
            let tdText = td.eq(1).text().trim();
            if (tdText) {
                stuInfo.push(tdText);
            }
        }
        let stuInfoObj = {
            stuNum: stuInfo[0],
            // stuName: stuInfo[1],
            stuFaculty: stuInfo[2],
            // stuType: stuInfo[3],
            stuClass: stuInfo[4],
            // stuClassTeacher: stuInfo[5],
            // stuStatus: stuInfo[6],
        };
        await updateStudentInfoToDB(username, stuInfoObj);
        return stuInfoObj;
    }
}

/**
 * 獲取學生科系的代碼、科系的群組代碼、學制代碼，並暫存至 session
 * @param {Object} sessionStuInfo
 * @param {import('fetch-cookie')} fetch 
 */
async function getStudentStudyCodeInfo(sessionStuInfo, fetch) {
    let stuDeptRes = await fetch(
        'https://system8.ntunhs.edu.tw/myNTUNHS_student/Modules/Map/UserControls/ajaxCallback.aspx?type=StudAllDept',
        {
            method: 'POST',
        }
    );
    let stuDeptText = await stuDeptRes.text();
    $ = cheerio.load(stuDeptText);
    let firstOption = $('option').eq(0);
    let mainDeptno = firstOption.attr('deptno');
    let mainGroupno = firstOption.attr('groupno');
    let mainEdutype = firstOption.attr('edutype');
    _.set(sessionStuInfo, "deptno", mainDeptno);
    _.set(sessionStuInfo, "groupno", mainGroupno);
    _.set(sessionStuInfo, "edutypeCode", mainEdutype);
    return {
        mainDeptno: mainDeptno,
        mainGroupno: mainGroupno,
        mainEdutype: mainEdutype
    };
}
/**
 * 獲取學生待過的學年，並儲存至 session
 * @param {Object} sessionStuInfo 
 * @param {import('fetch-cookie')} fetch 
 */
async function setStudentStayedSem(sessionStuInfo, fetch) {
    let semInfoRes = await fetch(
        `https://system8.ntunhs.edu.tw/myNTUNHS_student/Modules/Map/UserControls/ajaxCallback.aspx?type=StudAllSemno&value=${sessionStuInfo.deptno}`,
        {
            method: 'POST',
        }
    );
    let semInfoText = await semInfoRes.text();
    $ = cheerio.load(semInfoText);
    let entryYear = $('input').first().attr('enteryear');
    let lastSem = $('input').last().attr('semno');
    sessionStuInfo.entryYear = entryYear;
    sessionStuInfo.lastSem = lastSem;
    let entryYearInt = parseInt(sessionStuInfo.entryYear);
    let semno = sessionStuInfo.lastSem.substr(0, 3);
    let lastSemInt = parseInt(semno);
    let allSemno = [];
    for (let i = entryYearInt; i <= lastSemInt; i++) {
        allSemno.push(`${i}1`);
        allSemno.push(`${i}2`);
    }
    sessionStuInfo.allSemno = allSemno;
}

function logCookies(jar) {
    jar._jar.store.getAllCookies(function (err, cookieArray) {
        if (err) throw new Error('Failed to get cookies');
        console.log(JSON.stringify(cookieArray, null, 4));
    });
}
