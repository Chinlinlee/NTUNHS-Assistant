const schedule = require('node-schedule');

let { checkSignOffLessTake } = require('./checkSignOffLessTake');

let scheduleCheckSignOffLessTake = schedule.scheduleJob({rule :'0 30 17 * * *'} , async function () {
    await checkSignOffLessTake();
});