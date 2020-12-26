const data_log = require("../../../../models/common/data.js");
const myFunc = require('../../../My_Func');
const _ = require("lodash");
module.exports = async function(req, res)
{
    var queryParams = req.query;
    Object.keys(queryParams).forEach(element=>
    {
       if (!queryParams[element])
       {
           delete queryParams[element];
       } 
    });
    let Result = [];
    let course =await myFunc.ntunhsApp.getCourse(req);
    if (!course) {
        req.logout();
        return res.status(401).send();
    }
    let Class_timearray=new Array('08:10~09:00','09:10~10:00','10:10~11:00','11:10~12:00','12:40~13:30','13:40~14:30','14:40~15:30','15:40~16:30','16:40~17:30','17:40~18:30','18:35~19:25','19:30~20:20','20:25~21:15','21:20~22:10');
    course = await Promise.all(_.filter(course , v=> v.Day == queryParams.day));
    for (let i = 0 ; i < course.length ; i++) 
    {
        let item = course[i];

        let Period = item.Period.split('~');
        let class_Stime  ="" ;
        let class_Etime = "";
        if (Period.length == 1)
        {
            class_Stime = Class_timearray[Period[0]-1].substr(0,5);
            class_Etime = Class_timearray[Period[0]-1].substr(6);
        }
        else
        {
            class_Stime = Class_timearray[Period[0]-1].substr(0,5);
            class_Etime = Class_timearray[Period[1]-1].substr(6);
        }
        item.Teacher = item.Teacher.replace(/<br\/>/gi , "");
        let class_time = class_Stime + "~" + class_Etime;
        Result.push({"Name":item.Name,"Time":class_time,"Place":item.Place ,"Period":item.Period,"Teacher":item.Teacher});
    }
    Result = _.orderBy(Result , ["Period"] ,["desc"]);
    return res.send(Result);
}