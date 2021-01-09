const url = require('url');
const data_log = require('../models/common/data.js');
const QueryParams = require("../models/common/httparams.js")
const fs = require('fs');
const Cryptjs = require('crypto-js');
const My_Func = require('./My_Func.js');
const request = require("request");
module.exports = 
/**
 * 
 * @param {*} app 
 * @param {passport} passport 
 */
    function (app  , passport)
    {
        
        app.use('/api/Course' , require('./api/Course'));
        app.use('/api/Today_Schedule' , require('./api/Today_Schedule'));
        app.use('/api/Scores' , require('./api/Scores'));
        app.use('/api/History_Scores' , require('./api/History_Scores'));
        app.use('/api/Course_Search' , require('./api/Course_Search'));
        app.use('/api/pdfmake'  , require('./api/pdfmake'));
        app.use('/api/CTE_BOT' , require('./api/CTE_BOT'));
        app.use('/api/stuInfo' , require('./api/stuInfo'))
        app.use('/api/Schedule' , require('./api/Schedule')) ;
        //HTTP轉址HTTPS
       /* app.use (function (req, res, next) {
            if (req.secure) 
            {
                    // request was via https, so do no special handling
                next();
            } else 
            {
                    // request was via http, so redirect to https
                res.redirect('https://' + req.headers.host + req.url);
            }
         });*/
        //HOME PAGE (login page)
        app.get('/' ,My_Func.IsLoggedInHome, function(req  , res)
        {
            res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0 ');
            res.render('index_login.html', {messages:req.flash('error')[0]} );
        });

        //login authenticate page
        app.post('/login' , passport.authenticate('local-login' ,
        {
            failureRedirect : '/',
            failureFlash : true,
            session : true,
        }), function(res , req)
        {
            if (req.req.headers['referer']!= undefined && req.req.headers['referer'].includes('Course_Search'))
            {
                req.redirect('/Course_Search');
            }
            else
            {
                req.redirect('/Today_Schedule');
            }
        });

        app.get('/logout', function(req, res){
            req.logout();
            req.session.destroy();
            res.redirect('/');
          });

        app.get('/Schedule' , My_Func.IsLoggedIn,function (req , res)
        {
            res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
           // res.locals.CurrentUser = req.user;
            res.render('./atm/Schedule.html' , {
                user : req.user.toString() , IsUpdate:false
            });
        });

        app.get('/Course' , My_Func.IsLoggedIn , function(req, res)
        {
            res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
            res.render('./atm/Course.html' , {user : req.user.toString()});
        });
        
        app.get('/Today_Schedule' , My_Func.IsLoggedIn , function(req, res)
        {
            res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
            res.render('./atm/TS.html' , {user : req.user.toString(), IsUpdate:false});
        });

        app.get('/Scores' , My_Func.IsLoggedIn , function(req, res)
        {
            res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
            res.render('./atm/Scores.html' , {user : req.user.toString()});
        });

        app.get('/History_Scores' , My_Func.IsLoggedIn , function(req, res)
        {
            res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
            res.render('./atm/History_Scores.html' , {user : req.user.toString()});
        });

        app.get('/Course_Search'  , function(req, res)
        {
            res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
            res.set('Cache-Control', 'public, max-age=0');
            res.render('./atm/Course_Search.html');
        });

        app.get('/CTE_BOT'  , function(req, res)
        {
            res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
            res.set('Cache-Control', 'public, max-age=0');
            res.render('./atm/CTE_BOT.html');
        });

        app.get('/api/user' , My_Func.IsLoggedIn , function(req, res)
        {
            res.send(req.user);
        });

        app.post('/api/lineid' ,async function(req , res)
        {
            var urlStr = QueryParams.normalize(url.parse(req.url,false).query);
            var instance = QueryParams.getQueryStringToJSON(urlStr);
            var item = await data_log.Getdata('Students' , {"lineid" : instance.id});
            if (item.length <1)
            {
                res.send("no lineid");
            }
            else
            {
                res.send({ username:item[0].username , lineid: item[0].lineid});
            }
        });
        app.get('/updatedata' , function(req , res)
        {
            res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
           // res.locals.CurrentUser = req.user;
            res.render('./atm/TS.html' , {
                user : req.user.toString(), IsUpdate : true
            });
        })
        app.route('/api/log' , My_Func.IsLoggedIn).all(async function(req ,res ,next)        
        {
            var urlStr = QueryParams.normalize(url.parse(req.url,false).query);
            var instance = QueryParams.getQueryStringToJSON(urlStr);
            switch(req.method)
            {
                case "GET":
                    if (req.user == null || req.user !=instance.User)
                    {
                        res.send("no Access or not login");
                    }
                    var items = await data_log.Getdata("Schedule" , {"user": instance.User });
                    var Result = [];
                    if (items.length >=1)
                    {
                        items[0].Schedule.forEach(item=>
                        {
                            Result.push({"Period": item.節次 , "Time":item.時間 ,"Mon":item.星期一,"Tue":item.星期二,"Wed":item.星期三,"Thu":item.星期四,"Fri":item.星期五,"Sat":item.星期六,"Sun":item.星期日});
                        });
                        res.send(Result);
                    }
                    else
                    {
                        res.send(null);
                    }
                    break;
                case "POST":
                    if (instance.method ==="getnewdata")
                    {
                        var result ="";
                        //讀取檔案
                        //將讀取的資料轉成Json
                        ////將Json前面加入擁有者的學號
                        var Schedule_jsondata =fs.readFileSync("../../Schedule/" + instance.User + ".json",'utf8');
                        var Schedule = JSON.parse(Schedule_jsondata);
                        var Schedule_json = {user : instance.User , Schedule};
                        var Courses_jsondata = fs.readFileSync("../../Courses/" + instance.User + ".json" , "utf8");
                        delete Courses_jsondata[0];
                        var Courses = JSON.parse(Courses_jsondata);
                        var Courses_json = {user : instance.User , Courses};
                        var Score_jsondata = fs.readFileSync("../../Scores/" + instance.User + ".json" , "utf8");
                        var Scores = JSON.parse(Score_jsondata);
                        var Score_json = {user : instance.User , Scores};
                        var HS_jsondata = fs.readFileSync("../../AllScores/" + instance.User + ".json" , "utf8");
                        var History_Con_Scores = JSON.parse(HS_jsondata);
                        var HS_All_jsondata = fs.readFileSync("../../AllScores/" + instance.User + "_All.json" , "utf8");
                        var History_Scores = JSON.parse(HS_All_jsondata);
                        var History_Scores_json = {user : instance.User , History_Scores,History_Con_Scores};
                        var Stu_Inf_jsondata = fs.readFileSync("../../Stu_Num/" + instance.User + "_inf.json" ,"utf8");
                        var Stu_Inf =  JSON.parse(Stu_Inf_jsondata);
                        var Stu_Inf_json = Stu_Inf;
                        //檢查是否有資料了
                        //有:更新
                        //沒有:插入
                        var IsExist = await data_log.Getdata("Schedule" , {"user": instance.User});
                        if (IsExist.length >=1)
                        {
                            result = await data_log.Updatedata("Schedule" , {"user" : instance.User} , {$set :{"Schedule" : Schedule_json.Schedule}});
                            result = await data_log.Updatedata("Courses" , {"user" : instance.User} , {$set :{"Courses" : Courses_json.Courses}});
                            result = await data_log.Updatedata("Scores" , {"user" : instance.User} , {$set :{"Scores" : Score_json.Scores}});
                            result = await data_log.Updatedata("History_Scores" , {"user" : instance.User} ,{$set:{"History_Scores":History_Scores_json.History_Scores ,"History_Con_Scores" : History_Scores_json.History_Con_Scores}});
                        }
                        else
                        {
                            result = await data_log.Insertdata("Schedule" , Schedule_json);
                            result = await data_log.Insertdata("Courses" , Courses_json);
                            result = await data_log.Insertdata("Scores" , Score_json);
                            result = await data_log.Insertdata("History_Scores" , History_Scores_json);
                        } 
                        result = await data_log.Updatedata("Students" , {"username": instance.User} , {$set:{"Inf" : Stu_Inf_json }});
                        var UpDay =await Get_Date_YYYYMM();
                        result = await data_log.Updatedata("Students" , {"username" : instance.User} , {$set: {"Last_Up_Time" : UpDay}});
                        (result === "fail") ?　res.send('fail') : res.send('success');
                    }
                    else if (instance.method =="updatedata")
                    {
                        var userpwd = "";
                        if (req.session.userpwd !=null || req.session.userpwd != undefined)
                        {
                            userpwd  =  req.session.userpwd ;
                        }
                        else if (instance.userpwd)
                        {
                            var mypromise = () => 
                            {
                              return new Promise ((resolve)=>
                              {
                                request(
                                {
                                  url : 'http://system8.ntunhs.edu.tw/myNTUNHS_student/Common/UserControls/loginModule.aspx',
                                  qs : {txtid : instance.User , txtpwd : instance.userpwd , select : "student"}
                                } , function (err  , response , body)
                                {
                                  resolve(body);
                                });
                              });
                            };
                            var loginresult = await mypromise();
                            if (loginresult.split('_').length < 2)
                            {
                              res.send('error pwd');
                              return;
                            }
                            userpwd = instance.userpwd;
                        }
                        var cryptpwd = Cryptjs.AES.encrypt(userpwd , "jhytjtrfewfwfrehtergwe");
                        var cryptpwd_2 = Cryptjs.AES.encrypt(cryptpwd.toString() , "jkyro0gkeprof,ewopf,owep");
                        var cryptpwd_3 =  Cryptjs.AES.encrypt(cryptpwd_2.toString() , "yureoqrueiwqrieowqprwep");
                        var cryptpwd_4 = Cryptjs.AES.encrypt(cryptpwd_3.toString() , "hotropwgjreiognehoie");
                        let encData = Cryptjs.enc.Base64.stringify(Cryptjs.enc.Utf8.parse(cryptpwd_4));
                        res.send({user :instance.User , pwd: encData});
                    }
                    break;
                default:
                    break;
            }
        });
        app.route('/*').get((req, res) => {
            res.status(404).json({
              status: 404,
              message: "not found"
            });
        });
    };

async function Get_Date_YYYYMM()
{
    return new Promise((resolve)=>
    {
        var year = new Date().getFullYear();
        var month = new Date().getUTCMonth() +1;
        var yyyymm = year.toString() + month.toString();
        return resolve(yyyymm); 
    });
}
