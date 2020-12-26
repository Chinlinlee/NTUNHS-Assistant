const db = require("../../../../models/common/data");
const myFunc = require("../../../My_Func");
const _ = require("lodash");

module.exports = async function(req , res) {
    let course =await myFunc.ntunhsApp.getCourse(req);
    if (!course) {
        req.logout();
        return res.status(401).send();
    }
    let Class_timearray=new Array('08:10~09:00','09:10~10:00','10:10~11:00','11:10~12:00','12:40~13:30','13:40~14:30','14:40~15:30','15:40~16:30','16:40~17:30','17:40~18:30','18:35~19:25','19:30~20:20','20:25~21:15','21:20~22:10');
    let Class_PeriodArray = [...Array(14).keys()].map(v=> v+1 );
    for (let i in course) {
        let item = course[i];
        if (isOnePeriod(item)) {
            item.Time = Class_timearray[item.Period-1];
        } else {
            let periodArr = item.Period.split("~");
            let start = periodArr[0];
            let end = periodArr[1];
            item.Time  = `${Class_timearray[start-1].split("~")[0]}~${Class_timearray[end-1].split("~")[1]}`;
        }
    }
    course = _.orderBy(course , ["Period"] ,["desc"]);
    console.log(course);
    let day = ["Mon" , "Tue" , "Wed" , "Thu" , "Fri" , "Sat" , "Sun"];
    let newItems = [];
    for (let i = 0  ; i < 14  ; i++) {
        newItems.push({
            "Period" : i+1 , 
            "Time" : Class_timearray[i] , 
            "Mon" : "" ,
            "Tue" : "" ,
            "Wed" : "" ,
            "Thu" : "" ,
            "Fri" : "" ,
            "Sat" : "" ,
            "Sun" : "" , 
            haveCode : []
        })
    }
    console.log(newItems);
    for (let key in course) {
        let nowCourse = course[key];
        let nowCoursePeriod = nowCourse.Period.split("~");
        if (nowCoursePeriod.length == 1) {
            nowCoursePeriod.push(nowCoursePeriod[0]);
        }
        for (let i = nowCoursePeriod[0] ; i<= nowCoursePeriod[nowCoursePeriod.length-1] ; i++) {
            let hitPeriod = _.find(newItems , v => v.Period==i);
            let courseDay = day[nowCourse.Day-1];
            hitPeriod[courseDay] = nowCourse.Name;
            hitPeriod.haveCode.push({
                Name : nowCourse.Name ,
                Code : nowCourse.Code
            });
        }
    }
    console.log(newItems);
    //var items = await db.Getdata("Schedule" , {"user": req.user});
    //var Result = [];
    //if (items.length >=1)
    //{
    //    items[0].Schedule.forEach(item=>
    //    {
    //        Result.push({"Period": item.節次 , "Time":item.時間 ,"Mon":item.星期一,"Tue":item.星期二,"Wed":item.星期三,"Thu":item.星期四,"Fri":item.星期五,"Sat":item.星期六,"Sun":item.星期日});
    //    });
    res.send([newItems,course]);
    //}
    //else
    //{
    //    res.send(null);
    //}
} 

function isOnePeriod (item) {
    return !(item.Period.includes("~"));
}