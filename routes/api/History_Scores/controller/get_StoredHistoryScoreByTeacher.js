const { MongoExe } = require('../../../../models/common/data');
const _ = require('lodash');

module.exports = async function (req , res) {
    let queryParams = req.query;
    Object.keys(queryParams).forEach(element => {
        if (!queryParams[element]) {
            delete queryParams[element];
        }
    });
    if (_.isUndefined(queryParams.courseTeacher) || _.isUndefined(queryParams.courseName)) {
        return res.status(400).send({
            code : 400 , 
            message : "Bad request"
        });
    }
    let courseTeachers = queryParams.courseTeacher.split(',');
    let teacherQuery = [];
    if (courseTeachers[0]!= "ALL") {
        for (let teacher of courseTeachers) {
            teacherQuery.push({
                courseTeacher : new RegExp(teacher , 'gim')
            });
        }
    }
    let conn  = await MongoExe();
    let db = conn.db('My_ntunhs');
    let collection = db.collection('storedHistoryScore');
    try {
        let queryString = {
            $and : [
                {
                    courseName : queryParams.courseName
                } , 
                {
                    $or : [
                        ...teacherQuery
                    ]
                }
            ]
        }
        if (courseTeachers == "ALL") {
            queryString = {
                $and : [
                    {
                        courseName : queryParams.courseName
                    } 
                ]
            }
        }
        let doc = await collection.find(queryString).toArray();
        await conn.close();
        return res.send(doc);
    } catch (e) {
        await conn.close();
        return res.status(500).send(e);
    }
}