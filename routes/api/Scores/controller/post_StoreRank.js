
const mongoFunc = require('../../../../models/common/data');


module.exports = async function (req , res) {
    let data = req.body.data.data;
    let stuNum = req.session.stuInfo.stuNum;
    let nowSem = req.session.stuInfo.nowSem;
    let newData = {};
    let title = ["takeCredit" , "passCredit" , "avgScore" , "rank" , "rankPercentInClass"]
    for (let i in data) {
        let nowData = data[i];
        newData[title[i]] = nowData.name;
    }
    newData['sem'] = nowSem;
    newData['stuNum'] = stuNum;
    let conn = await mongoFunc.MongoExe();
    let db = conn.db('My_ntunhs');
    let collection = db.collection('Scores');
    collection.findOneAndUpdate(
    {
        $and : [
            {
                stuNum : stuNum 
            } ,
            {
                sem : nowSem
            }
        ]
    } , 
    {
        $set : newData
    } , 
    {
        upsert : true
    } , function (err , docs) {
        if (err) {
            console.error(err);
            return res.status(500).json({
                code : 500  , 
                message : err
            });
        }
        return res.status(200).json({
            code : 200 , 
            message : "store success"
        })
    });
}