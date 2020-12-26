const data_log = require("../../../../models/common/data.js");
//const QueryParams = require("../../../models/common/httparams.js");


module.exports = async function(req, res)
{
    var queryParams = req.query;
    Object.keys(queryParams).forEach(element => 
    {
        if (!queryParams[element])
        {
            delete queryParams[element];
        }    
    });
    if (req.user == null || req.user !=queryParams.User)
    {
        res.send("no Access");
        return;
    }
    Promise.all(await data_log.Getdata("Courses" , {user : req.user})).then(
    value=>
    {
        var Result=[];
        value[0].Courses.splice(0,1);
        value[0].Courses.forEach(item=>
            {
               Result.push({Name:item.課程代碼與名稱_L.substr(11) , Place:item.教室,Day:item.星期,Period:item.節次,Credit:item.學分 , Type:item.課程性質 , Teacher:item.任課教師_L}) ;
            });
        res.send(Result);
    });
}