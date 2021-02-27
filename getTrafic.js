const fs = require('fs');
const path = require('path');
const moment = require('moment-timezone');
const _ = require('lodash');
const schedule = require('node-schedule');

let traficLog = fs.readFileSync(path.join(__dirname , "default.log") , {encoding : 'utf-8'});
traficLog = traficLog.replace(/ UTC -> IsLoggedIn:true /gim , "");
let lines = traficLog.split("\r\n");

let items = [];
for (line of lines) {
    let [date , time , account] = line.split(' ');
    date = date.replace("," , "");
    let obj = {
        datetime : `${date} ${time}` , 
        account : account
    }
    items.push(obj);
}
let hitItem = items.filter(v => {
    if (v.account == "UTC") return false;
    try {
        let taipeiTime = moment.utc(v.datetime , "YYYY.MM.DD HH:mm:ss.SSSS").tz("Asia/Taipei");
        let isoFormatTime = moment(taipeiTime , "YYYY.MM.DD").format('YYYY-MM-DD');
        let dateNow = moment(new Date()).format('YYYY-MM-DD');
        return moment(isoFormatTime , 'YYYY-MM-DD').isSameOrAfter(dateNow);
    } catch (e) {
        console.log(v.datetime);
        return false;
    }
})

hitItem = _.uniqBy(hitItem , 'account');
console.log(hitItem.length);

