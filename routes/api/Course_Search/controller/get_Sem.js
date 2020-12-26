let mongo = require('../../../../models/common/data');


module.exports = async function (req , res) {
    let conn = await mongo.MongoExe();
    let All_Courses = conn.db("My_ntunhs").collection("All_Courses");
    All_Courses.distinct("Sem" , function(err , Sem) {
        if (err) return res.status(500).send(err);
        return res.json(Sem);
    });
}