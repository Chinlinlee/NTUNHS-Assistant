const { MongoExe } = require('../../../../models/common/data');
const _ = require('lodash');


module.exports = async function (req , res) {
    try {
        let conn = await MongoExe();
        let db = conn.db('My_ntunhs');
        let collection = db.collection('Scores');
        let stuNum = req.session.stuInfo.stuNum;
        let storedScoreList = await collection.find({stuNum : stuNum}).toArray();
        storedScoreList = _.orderBy(storedScoreList , ["sem"] , ['asc']);
        res.status(200).send(storedScoreList);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}