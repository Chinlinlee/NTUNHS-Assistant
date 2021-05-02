var LocalStrategy = require('passport-local').Strategy;
const fs = require('fs');
const DBdata = require('../common/data.js')
const School_Auth = require('./School_Auth.js');
const request = require('request');
const myFunc = require('../../routes/My_Func');
const cheerio = require('cheerio');
const nodeFetch = require('node-fetch');
require('tls').DEFAULT_MIN_VERSION = 'TLSv1'

async function getSTNO (req , iFetch)
{
  return new Promise (async (resolve)=> 
  {
    let option = 
    {
      method : "GET" , 
      uri : `http://system8.ntunhs.edu.tw/myNTUNHS_student/Modules/Profile/tab/Profile_tab_02.aspx` , 
    }
    let fetchRes = await iFetch(option.uri);
    let getStnoPageUri = await fetchRes.text();
    //let getStnoPageUri = await myFunc.Request_func(myReqObj  , option);
    let $ = cheerio.load(getStnoPageUri);
    let aElement = $('a');
    let aTags = "";//$("a")[0].attribs.href;
    for (let index in aElement) {
      let aHref = $(aElement[index]).attr('href') || "";
      if (aHref.includes('ShowModalDialog')) {
        aTags = aHref;
        break;
      }
    }
    option = 
    {
      method : "GET" , 
      uri : aTags
    }
    let getStnoPageRes = await iFetch(option.uri , {
      method:"GET" , 
      redirect : "follow"
    });
    let getStnoPage = await getStnoPageRes.text();
    $ = cheerio.load(getStnoPage);
    let frame = $("iframe");
    let stno = "";
    try {
      for (let index in frame) {
        console.log(index);
        let frameSrc = $(frame[index]).attr('src') || "";
        console.log(frameSrc);
        if (frameSrc.includes('stno')) {
          stno = frameSrc.substring(frameSrc.indexOf('stno=')+5);
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
    return resolve(stno);
  });
}


module.exports = async function(passport)
{
  passport.serializeUser(function (user , done)
  {
    done(null , user);
  });
  passport.deserializeUser(function (id , done)
  {
    done(null , id);
  });
  passport.use('local-login' , new LocalStrategy(
  {
    usernameField : 'username' , 
    passwordField : 'password',
    session : true,
    passReqToCallback: true
  },
  async function (req , username , password , done)
  {
      let loginresult = await School_Auth.Auth(username , password , req);
      //req.session.myJar = myReqObj.jar;
      let logingResultCode = loginresult.split('_');
      let j = myFunc.getJar(req);
      let signOffJar = myFunc.getSignOffJar(req);
      if (!logingResultCode.includes("true"))
      {
        console.log("error pwd");
        return done(null , false , {message : "帳號或密碼錯誤(Invalid user or password)"});
      }
      let loginHomeOption = 
      {
        method : 'GET' , 
        uri : `https://system8.ntunhs.edu.tw/myNTUNHS_student/Common/UserControls/loginModule.aspx?txtid=${username}&code=${logingResultCode[1]}&from=OVGfeJ71k85Va+5tUAkRpREuBeu/vj73Xq3Nr9sDoY5sDt38lS4gFsKrX0qYogYUVoxr8f++8G+yMZLEa9IDN5SWFS76zmop52j0OW69Fks=&select=student`
      }
      let fetch  = require('fetch-cookie')(nodeFetch , j , false );
      let homeFetchRes = await fetch(loginHomeOption.uri , 
      {
          method:"GET" , 
      });
      let homeBody = await homeFetchRes.text();
      let $ = cheerio.load(homeBody);
      let Profile = $("#ctl00_tableProfile tr");


      let stuInfo = [];
      for (let i = 0 ; i < Profile.length ; i++) 
      {
        let td = Profile.eq(i).find("td");
        let tdText= td.eq(1).text().trim();
        if (tdText) 
        {
          stuInfo.push(tdText);
        }
      }
      let stuInfoObj = 
      {
        "stuNum" : stuInfo[0] , 
        "stuName" : stuInfo[1] , 
        "stuFaculty" : stuInfo[2] ,
        "stuType" : stuInfo[3] ,
        "stuClass" : stuInfo[4] , 
        "stuClassTeacher" : stuInfo[5] , 
        "stuStatu" : stuInfo[6]
      }
      req.session.stuInfo = stuInfoObj;
      let sessionStuInfo = _.get(req.session , "stuInfo");
      let stuDeptRes = await fetch("https://system8.ntunhs.edu.tw/myNTUNHS_student/Modules/Map/UserControls/ajaxCallback.aspx?type=StudAllDept" , {
          method : 'POST'
      });
      let stuDeptText = await stuDeptRes.text();
      $  = cheerio.load(stuDeptText);
      let firstOption = $("option").eq(0);
      let mainDeptno = firstOption.attr('deptno');
      let mainGroupno = firstOption.attr('groupno');
      let mainEdutype = firstOption.attr('edutype');
      sessionStuInfo.deptno = mainDeptno;
      sessionStuInfo.groupno = mainGroupno;
      sessionStuInfo.edutypeCode = mainEdutype;
      let semInfoRes = await fetch(`https://system8.ntunhs.edu.tw/myNTUNHS_student/Modules/Map/UserControls/ajaxCallback.aspx?type=StudAllSemno&value=${mainDeptno}` , {
          method : 'POST'
      });
      let semInfoText = await semInfoRes.text();
      $ = cheerio.load(semInfoText);
      let entryYear = $("input").first().attr('enteryear');
      let lastSem = $("input").last().attr('semno');
      sessionStuInfo.entryYear = entryYear;
      sessionStuInfo.lastSem = lastSem;
      let entryYearInt = parseInt(sessionStuInfo.entryYear);
      let semno = sessionStuInfo.lastSem.substr(0 , 3);
      let lastSemInt = parseInt(semno);
      let allSemno = [];
      for (let i = entryYearInt ; i <= lastSemInt ; i++) {
          allSemno.push(`${i}1`);
          allSemno.push(`${i}2`);
      }
      sessionStuInfo.allSemno = allSemno;
      
      req.session.ntunhsApp = await j.getCookieString('http://system8.ntunhs.edu.tw');
      req.session.Course = [];
      req.session.HistoryScore = [];
      req.session.noPreRank = false;
      let STNO = await getSTNO(req , fetch);
      req.session.STNO = STNO;
      if (!STNO) {
        return done(null , false , req.flash('error',"無法取得資訊，請重新登入，若還是無法登入請聯繫作者。"));
      }
      await School_Auth.ilmsAuth(username , password , req);
      return done(null ,username);
  }));
};

function logCookies(jar){
  jar._jar.store.getAllCookies(function(err, cookieArray) {
      if(err) throw new Error("Failed to get cookies");
      console.log(JSON.stringify(cookieArray, null, 4));
  });
}


