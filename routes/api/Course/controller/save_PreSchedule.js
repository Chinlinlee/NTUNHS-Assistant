const mongodb = require('../../../../models/common/data.js');

module.exports = async function (req, res) {
    try {
        let username = req.user;
        let scheduleData = req.body;
        let existing = await mongodb.Getdata('PreSchedules', { username });
        if (existing.length > 0) {
            await mongodb.Updatedata(
                'PreSchedules',
                { username },
                { $set: { schedule: scheduleData, updateTime: new Date() } }
            );
        } else {
            await mongodb.Insertdata('PreSchedules', {
                username,
                schedule: scheduleData,
                updateTime: new Date(),
            });
        }
        res.send({ success: true, message: '預排課表暫存成功' });
    } catch (e) {
        console.error(e);
        res.status(500).send('server error');
    }
};
