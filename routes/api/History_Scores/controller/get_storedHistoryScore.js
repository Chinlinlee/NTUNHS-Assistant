const { getTookCourse } = require('../../learnMap/controller/get_tookCourse');
const { MongoExe } = require('../../../../models/common/data');
const _ = require('lodash');

module.exports = async function (req , res) {
    let queryParams = req.query;
    Object.keys(queryParams).forEach(element => {
        if (!queryParams[element]) {
            delete queryParams[element];
        }
    });
    let conn  = await MongoExe();
    let db = conn.db('My_ntunhs');
    let collection = db.collection('storedHistoryScore');
    try {
        let doc = await collection.findOne({
            courseNormalId : queryParams.courseNormalId
        });
        return res.send(doc);
    } catch (e) {
        return res.status(500).send(e);
    }
}