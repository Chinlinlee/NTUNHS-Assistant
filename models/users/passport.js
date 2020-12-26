var LocalStrategy = require('passport-local').Strategy;
const fs = require('fs');
const DBdata = require('../common/data.js')
const School_Auth = require('./School_Auth.js');
const request = require('request');
const myFunc = require('../../routes/My_Func');
const cheerio = require('cheerio');
const nodeFetch = require('node-fetch');

async function getSTNO (req , iFetch)
{
  return new Promise (async (resolve)=> 
  {
    let j = myFunc.getJar(req);
    let option = 
    {
      method : "GET" , 
      uri : `http://system8.ntunhs.edu.tw/myNTUNHS_student/Modules/Profile/tab/Profile_tab_02.aspx` , 
      followRedirect: true ,
      jar : j
    }
    let fetchRes = await iFetch(option.uri , {method:"GET" , redirect : "follow" , follow: 100});
    let getStnoPageUri = await fetchRes.text();
    //let getStnoPageUri = await myFunc.Request_func(myReqObj  , option);
    let $ = cheerio.load(getStnoPageUri);
    let aTags = $("a")[0].attribs.href;
    option = 
    {
      method : "GET" , 
      uri : aTags , 
      followRedirect: true  ,
      jar : j
    }
    let getStnoPageRes = await iFetch(option.uri , {method:"GET" , redirect : "follow"});
    let getStnoPage = await getStnoPageRes.text();
    $ = cheerio.load(getStnoPage);
    let frameSrc = $("#DialogFrame")[0].attribs.src;
    let stno = frameSrc.substring(frameSrc.indexOf('stno=')+5);
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
      let myReqObj = request.defaults({jar : true});
      let loginresult = await School_Auth.Auth(username , password , req);
      //req.session.myJar = myReqObj.jar;
      let logingResultCode = loginresult.split('_');
      let j = myFunc.getJar(req);
      let signOffJar = myFunc.getSignOffJar(req);
      if (logingResultCode.length < 2)
      {
        console.log("error pwd");
        return done(null , false , req.flash('error',"帳號或密碼錯誤(Invalid user or password)"));
      }
      let loginHomeOption = 
      {
        method : 'GET' , 
        uri : `https://system8.ntunhs.edu.tw/myNTUNHS_student/Common/UserControls/loginModule.aspx?txtid=${username}&code=${logingResultCode[1]}&from=OVGfeJ71k85Va+5tUAkRpREuBeu/vj73Xq3Nr9sDoY5sDt38lS4gFsKrX0qYogYUVoxr8f++8G+yMZLEa9IDN5SWFS76zmop52j0OW69Fks=&select=student` , 
        jar : j
      }
      let fetch  = require('fetch-cookie')(nodeFetch , j , false );
      let homeFetchRes = await fetch(loginHomeOption.uri , {method:"GET" , redirect:"follow" , follow: 100});
      let homeBody = await homeFetchRes.text();

      //console.log(homeBody);
      //let homeBody = await myFunc.Request_func(myReqObj ,loginHomeOption);
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
      req.session.ntunhsApp = await j.getCookieString('http://system8.ntunhs.edu.tw');
      let loginSginOffResult = await School_Auth.signOffAuth(username , password , myReqObj);
      //req.session.myJar = myReqObj.jar;
      let loginSginOffResultCode = loginSginOffResult.split('_');
      let loginSignOffoPtion = 
      {
        method : 'GET' , 
        uri : `http://system10.ntunhs.edu.tw/Workflow/Common/UserControls/loginModule.aspx?txtid=${username}&code=${loginSginOffResultCode[1]}&from=RSj5Im20848gChj8rkdWGJFBlYl/7U1mZ4gJDdbJ5OM3j763Vu+cjUoqjRZXBp6GvBdG3Ya2QodhSYM88vhcFw==&select=student` , 
        jar : signOffJar , 
        followRedirect : true
      }
      //console.log(loginSignOffoPtion.uri);
      await myFunc.Request_func(myReqObj , loginSignOffoPtion);
      req.session.ntunhsSignOff = signOffJar.getCookieString('http://system10.ntunhs.edu.tw');
      req.session.Course = [];
      req.session.HistoryScore = [];
      req.session.Score = [];
      req.session.noPreRank = false;
      let STNO = await getSTNO(req , fetch);
      req.session.STNO = STNO;
      return done(null ,username);
  }));
};

function logCookies(jar){
  jar._jar.store.getAllCookies(function(err, cookieArray) {
      if(err) throw new Error("Failed to get cookies");
      console.log(JSON.stringify(cookieArray, null, 4));
  });
}


