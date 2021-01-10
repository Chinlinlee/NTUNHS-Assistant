const _ = require('lodash');

module.exports = async function(req ,res)
{
    let sessionStuInfo = _.get(req.session , "stuInfo");
    if (sessionStuInfo) {
        let result = {
            system : sessionStuInfo.stuType , 
            faculty : sessionStuInfo.stuFaculty ,
            stuName : sessionStuInfo.stuName
        }
        return res.send(result);
    }
    return res.status(204).send("");
}