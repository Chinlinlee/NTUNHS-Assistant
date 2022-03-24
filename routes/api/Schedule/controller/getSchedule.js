const { getCourse } = require('../../Course/controller/get_Course');
const db = require('../../../../models/common/data');
const myFunc = require('../../../My_Func');
const _ = require('lodash');

module.exports = async function (req, res) {
    let course = await getCourse(req);
    if (!course) {
        req.flash('error', '學校系統逾時，請重新登入');
        req.logout();
        return res.status(401).send();
    }
    let Class_timearray = new Array(
        '08:10~09:00',
        '09:10~10:00',
        '10:10~11:00',
        '11:10~12:00',
        '12:40~13:30',
        '13:40~14:30',
        '14:40~15:30',
        '15:40~16:30',
        '16:40~17:30',
        '17:40~18:30',
        '18:35~19:25',
        '19:30~20:20',
        '20:25~21:15',
        '21:20~22:10'
    );
    //let Class_PeriodArray = [...Array(14).keys()].map(v=> v+1 );
    for (let i in course) {
        let item = course[i];
        if (isOnePeriod(item)) {
            item.Time = Class_timearray[item.Period - 1];
        } else {
            let periodArr = item.Period.split('~');
            let start = periodArr[0];
            let end = periodArr[1];
            item.Time = `${Class_timearray[start - 1].split('~')[0]}~${
                Class_timearray[end - 1].split('~')[1]
            }`;
        }
        item.startPeriod = parseInt(item.Period.split('~')[0]);
    }
    course = _.orderBy(course, ['Day', 'startPeriod'], ['asc', 'asc']);
    let day = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    let scheduleList = [];
    for (let i = 0; i < 14; i++) {
        scheduleList.push({
            Period: i + 1,
            Time: Class_timearray[i],
            Mon: '',
            Tue: '',
            Wed: '',
            Thu: '',
            Fri: '',
            Sat: '',
            Sun: '',
        });
    }
    for (let key in course) {
        let nowCourse = course[key];
        let nowCoursePeriod = nowCourse.Period.split('~');
        nowCoursePeriod = nowCoursePeriod.map(function (item) {
            return parseInt(item);
        });
        if (nowCoursePeriod.length == 1) {
            nowCoursePeriod.push(nowCoursePeriod[0]);
        }
        for (
            let i = nowCoursePeriod[0];
            i <= nowCoursePeriod[nowCoursePeriod.length - 1];
            i++
        ) {
            let hitPeriod = _.find(scheduleList, (v) => v.Period == i);
            let courseDay = day[nowCourse.Day - 1];
            hitPeriod[courseDay] = nowCourse.Name;
            hitPeriod['detail'] = nowCourse;
        }
    }
    res.send({
        schedule: scheduleList,
        courses: course,
    });
};

function isOnePeriod(item) {
    return !item.Period.includes('~');
}
