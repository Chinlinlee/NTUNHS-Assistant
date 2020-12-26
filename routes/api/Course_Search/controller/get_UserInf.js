const data_log = require("../../../../models/common/data.js");

module.exports = async function(req ,res)
{
    var queryParams = req.query;
    Object.keys(queryParams).forEach(element => 
    {
        if (!queryParams[element])
        {
            delete queryParams[element];
        }    
    });
    if (req.user == null || req.user !=queryParams.user)
    {
        res.send("no Access");
        return;
    }
    Promise.all(await data_log.Getdata("Students" , {username : req.user})).then(
    value=>
    {
        var Inf = value[0].Inf;
        var Result = { system : Inf[3].學制 , faculty : Inf[2].系所};
        res.send(Result);
    });
    
}