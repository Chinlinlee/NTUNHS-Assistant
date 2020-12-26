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
        else if (!Array.isArray(queryParams[element]) && typeof(queryParams[element]) == "string")
        {
            queryParams[element] = [queryParams[element]];
        }
    });
    if (queryParams['IsRootPart'] == undefined && queryParams['IsCityPart'] == undefined)
    {
        queryParams['IsRootPart']  = new Array("true");
        queryParams['IsCityPart']  = new Array("true");
    }
    if ((queryParams['IsRootPart'][0] == "true" && queryParams['IsCityPart'][0] == "true" ) || (queryParams['IsRootPart'][0] == "false" && queryParams['IsCityPart'][0] == "false"))
    {
        delete queryParams['IsRootPart'];
        delete queryParams['IsCityPart'];
    }
    else if (queryParams['IsRootPart'][0] == "true")
    {
        delete queryParams['IsRootPart'];
        delete queryParams['IsCityPart'];
        var City = new RegExp("城區");
        queryParams['Course_Other'] = {"$not":City};
    }
    else if (queryParams['IsCityPart'][0] == "true")
    {
        delete queryParams['IsRootPart'];
        delete queryParams['IsCityPart'];
        var City = new RegExp("城區");
        queryParams['Course_Other'] = {"$in":[City]};
    }
    Promise.all(await data_log.Getdata("All_Courses" , queryParams)).then(
    value=>
    {
        var Result = [];
        value.forEach(item=>
            {
                if (item.Course_Place !="")
                {
                    if (item.Course_Place.indexOf(",") >=0)
                    {
                        var multi_Place = item.Course_Place.split(",");
                        multi_Place.forEach((place)=>
                        {
                            Result.push(place);
                        })       
                    }
                    else
                    {
                        Result.push(item.Course_Place);
                    }
                } 
            });
        var output = Array.from(new Set(Result));
        res.send(output);
    });
}