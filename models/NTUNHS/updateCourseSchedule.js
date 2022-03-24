const { updateCourseMain } = require('./updateCourse');
const schedule = require('node-schedule');
updateCourseMain();
let scheduleUpdateCourse = schedule.scheduleJob(
    { rule: '0 30 0 * * *' },
    function () {
        console.log('update course');
        updateCourseMain();
    }
);
