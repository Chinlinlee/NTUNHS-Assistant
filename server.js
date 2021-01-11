//import modules
const config = require('./config/config.js');
const http = require('http');
const express = require('express');
const cookieParser = require('cookie-parser');
const bodyPareser = require('body-parser');
const passport = require('passport');
const session = require('express-session');
const compression = require('compression');
const https = require('https');
const fs = require('fs');
const flash = require('connect-flash')
const schedule = require('node-schedule');
const cors = require('cors');
const mongodb = require('./models/common/data.js');
const MongoStore = require('connect-mongo')({session:session});
const path = require('path')
const { updateCourseMain } = require('./models/NTUNHS/updateCourse');
//End import modules
var app = express();
app.use(compression());
// view engine setup
//app.set('views', config.HTTPServer.viewsRoot);
app.use(express.static(config.HTTPServer.viewsRoot));
app.use(flash());
app.use(cors());
app.use(bodyPareser.urlencoded({extended: true , limit : '50mb'}));
app.use(bodyPareser.json({limit: '50mb'}));
app.use(cookieParser( "myNtunhsCookieSecret"));


let mongoUsername = `${config.MONGODB.username}:` || "";
let mongoPassword = config.MONGODB.password || "";
let at = (mongoUsername || mongoPassword) ? "@" : "";
let mongoConnectionURL =`mongodb://${mongoUsername}${mongoPassword}${at}${config.MONGODB.host}:${config.MONGODB.port}/${config.MONGODB.db}?ssl=${config.MONGODB.ssl}&authSource=${config.MONGODB.authDB}`;

app.use(session(
  {
    secret : 'ntunhsimsercret',
    resave : false,
    saveUninitialized : false , 
    store : new MongoStore({
      url : mongoConnectionURL
    }) ,
    cookie : {maxAge: 60 * 60* 24 * 1000} ,
    expires : new Date(Date.now() + (86400 * 1000))
  }
));
app.use(passport.initialize());
app.use(passport.session());

app.engine('html' , require('ejs').renderFile);
require('./models/users/passport.js')(passport );
require('./routes/routes.js')(app,passport );
  
http.createServer(app).on('connection' , function(socket)
{
  socket.setTimeout(config.HTTPServer.timeout);
}).listen(config.HTTPServer.httpPort , function()
{
  console.log("HTTP SERVER IS Listening on port :" +config.HTTPServer.httpPort);
});


//定時清console
/*var rule = new schedule.RecurrenceRule();
rule.second =0;
rule.minute = 30;
schedule.scheduleJob(rule , ()=>
{
  console.log('\033[2J');
});*/
//定時清檔案
var ruleClearFile = new schedule.RecurrenceRule();
ruleClearFile.second = 0;
ruleClearFile.minute = [0,15,30,45,55];
schedule.scheduleJob(ruleClearFile , ()=>
{
  Clear_Files();
});
//定時清產生出來的xlsx ,docx , pdf , picture
function Clear_Files()
{
  var paths = ['xlsx' , 'docx' , 'pdf' , 'picture'];
  for (var x = 0 ; x < paths.length ; x++)
  {
    fs.readdirSync(paths[x]).forEach((file)=>
    {
      fs.unlink(path.join(paths[x], file), err => {
        if (err) throw err;
      });
    })
  }
}

let scheduleUpdateCourse = schedule.scheduleJob({rule: '0 30 0 * * *'} ,function () {
  console.log("update course");
  updateCourseMain();
});

//updateCourseMain();