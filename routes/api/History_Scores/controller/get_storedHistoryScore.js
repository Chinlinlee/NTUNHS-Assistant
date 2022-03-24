const { MongoExe } = require('../../../../models/common/data');
const _ = require('lodash');

module.exports = async function (req, res) {
    let queryParams = req.query;
    Object.keys(queryParams).forEach((element) => {
        if (!queryParams[element]) {
            delete queryParams[element];
        }
    });
    let conn = await MongoExe();
    let db = conn.db('My_ntunhs');
    let collection = db.collection('storedHistoryScore');
    try {
        let doc = await collection.findOne({
            $and: [
                {
                    courseNormalId: queryParams.courseNormalId,
                },
                {
                    courseSem: queryParams.courseSem,
                },
            ],
        });
        await conn.close();
        if (doc) {
            for (let scoreRange in doc.scoreCategory) {
                _.set(
                    doc.scoreCategory,
                    scoreRange,
                    doc.scoreCategory[scoreRange].length
                );
            }
        }
        return res.send(doc);
    } catch (e) {
        await conn.close();
        return res.status(500).send(e);
    }
};
