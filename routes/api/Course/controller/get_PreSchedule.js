const mongodb = require('../../../../models/common/data.js');

module.exports = async function (req, res) {
    try {
        let username = req.user;
        let result = await mongodb.Getdata('PreSchedules', { username });
        if (result.length > 0) {
            res.send({ success: true, data: result[0].schedule });
        } else {
            res.send({ success: true, data: null });
        }
    } catch (e) {
        console.error(e);
        res.status(500).send('server error');
    }
};
