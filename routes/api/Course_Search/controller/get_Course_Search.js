const data_log = require("../../../../models/common/data.js");
const {ToRegex}  = require("../../../My_Func");
const _ = require("lodash");

module.exports = async function (req, res) {
    let CourseTime = "";
    try {
        let data = await getSearchResult(req);
        for (let key in data[0]) {
            let nowData = data[0][key];
            let dataPeriods = nowData.Course_Time.split(",");
            nowData.startPeriod = dataPeriods[0];
            nowData.endPeriod = dataPeriods[dataPeriods.length-1];
        }
        return res.send(data);
    } catch (e) {
        console.error(e);
        return res.status(500).send("server error");
    }
    
   /* var queryParams = req.query;
    var Tempquery = Object.assign({}, queryParams);
    if (queryParams.Course_Time) {
        CourseTime = queryParams.Course_Time;
    }
    Object.keys(queryParams).forEach(element => {
        if (!queryParams[element]) {
            delete queryParams[element];
        }
        else if (!Array.isArray(queryParams[element]) && typeof (queryParams[element]) == "string") {
            queryParams[element] = [queryParams[element]];
        }
    });

    if (queryParams.IsOnly) {
        var Cregex = ToRegexText(queryParams, 'Course_Other'); //備註
        var Fregex = ToRegexText(queryParams, 'Faculty_Name'); //系所
        queryParams = {};
        queryParams['$or'] = new Array(
        { 
            $and: [
                { 
                    'Course_Other': Cregex[0] 
                }, 
                { 
                    'Faculty_Name': Fregex[0] 
                }
            ] 
        }, 
        { 
            'Course_Other': Cregex[1] 
        });
    }
    if (queryParams['Faculty'] && queryParams['EduType']) {
        var Fregex = ToRegexText(queryParams, 'Faculty');
        var Eregex = ToRegexText(queryParams, 'EduType');
        queryParams['$and'] = new Array({ "Faculty_Name": { "$in": Fregex } }, { "Faculty_Name": { "$in": Eregex } });
        delete queryParams['EduType'];
        delete queryParams['Faculty'];
    }
    else if (queryParams['Faculty']) {
        var Fregex = ToRegexText(queryParams, 'Faculty');
        queryParams['Faculty_Name'] = { "$in": Fregex };
        delete queryParams['Faculty'];
    }
    else if (queryParams['EduType']) {
        var Eregex = ToRegexText(queryParams, 'EduType');
        queryParams['Faculty_Name'] = { "$in": Eregex };
        delete queryParams['EduType'];
    }
    try {
        if ((queryParams['IsRootPart'][0] == "true" && queryParams['IsCityPart'][0] == "true") || (queryParams['IsRootPart'][0] == "false" && queryParams['IsCityPart'][0] == "false")) {
            delete queryParams['IsRootPart'];
            delete queryParams['IsCityPart'];
            if (queryParams['Course_Other'] != undefined) {
                var regex = ToRegexText(queryParams, 'Course_Other');
                queryParams['Course_Other'] = { "$in": regex };
            }
        }
        else if (queryParams['IsRootPart'][0] == "true") {
            delete queryParams['IsRootPart'];
            delete queryParams['IsCityPart'];
            var City = new RegExp("城區");
            if (queryParams['Course_Other'] != undefined) {
                var regex = ToRegexText(queryParams, 'Course_Other');
                queryParams['Course_Other'] = { "$in": regex, "$not": City };
            }
            else {
                queryParams['Course_Other'] = { "$not": City };
            }
        }
        else if (queryParams['IsCityPart'][0] == "true") {
            delete queryParams['IsRootPart'];
            delete queryParams['IsCityPart'];
            var City = new RegExp("城區");
            if (queryParams['Course_Other'] != undefined) {
                queryParams['Course_Other'].push("城區");
                var regex = ToRegexText(queryParams, 'Course_Other');
                if (queryParams['$and'] != undefined) {
                    queryParams['$and'].push({ "Course_Other": { "$in": [City] } })
                }
                else {
                    queryParams['$and'] = new Array({ "Course_Other": { "$in": [City] } })
                }
            }
            else {
                queryParams['Course_Other'] = { "$in": [City] };
            }
        }
    }
    catch
    {
    }
    Object.keys(queryParams).forEach(element => {
        if (element != "Faculty_Name" && element != "Course_Other" && element != "$and" && element != "$or") {
            var regex = ToRegexText(queryParams, element);
            queryParams[element] = { "$in": regex };
        }
    });
    Promise.all(await data_log.Getdata("All_Courses", queryParams)).then(
        value => {
            let Result = [];
            if (CourseTime != "") {
                for (var i = 0; i < value.length; i++) {
                    if (HaveTime(value[i] , CourseTime)) {
                        Result.push(value[i]);
                    }
                }
                res.send([Result, Tempquery]);
            }
            else {
                res.send([value, Tempquery]);
            }
        });*/
}

function getIsOnlyQs(queryParams) {
    if (queryParams.IsOnly) {
        let CourseOtherQs = queryParams['Course_Other']; //備註
        let FacultyNameQs = queryParams['Faculty_Name']; //系所
        CourseOtherQs = _.isArray(CourseOtherQs) ? CourseOtherQs : [CourseOtherQs];
        FacultyNameQs = _.isArray(FacultyNameQs) ? FacultyNameQs : [FacultyNameQs];
        let OnlyQs = new Array(
            { 
                $and: [
                    { 
                        'Course_Other': CourseOtherQs[0]
                    }, 
                    { 
                        'Faculty_Name': FacultyNameQs
                    }
                ] 
            }, 
            { 
                'Course_Other': CourseOtherQs[1]
            });
        if (queryParams["$or"]) {
            queryParams["$or"].push(OnlyQs);
        } else {
            queryParams['$or'] =  OnlyQs;
        }
        delete queryParams['IsOnly'];
        delete queryParams['Course_Other'];
        delete queryParams['Faculty_Name'];
    }
}

async function getSearchResult(req) {
    return new Promise (async (resolve , reject)=> {
        let CourseTime = "";
        let queryParams = _.cloneDeep(req.query);
        let queryCourseTime = _.get(queryParams , "Course_Time");
        if (queryCourseTime) {
            CourseTime = _.cloneDeep(queryParams.Course_Time);
            if (!_.isArray(CourseTime)) {
                CourseTime = [CourseTime];
            }
        }
        let tempQuery = _.cloneDeep(queryParams);
        Object.keys(queryParams).forEach(element => {
            if (!queryParams[element]) {
                delete queryParams[element];
            }
        });
        getFacultyAndEduTypeQs(queryParams);
        getPartQs(queryParams);
        getIsOnlyQs(queryParams);
        await ToRegex(queryParams);
        if (!queryParams["$and"]) queryParams["$and"] = [];
        Object.keys(queryParams).forEach(element => {
            if (element != "$and" && element != "$or") {
                if (!queryParams[element]["$in"] && !_.isPlainObject(queryParams[element])) {
                    queryParams[element] = _.isArray(queryParams[element]) ? queryParams[element] : [queryParams[element]];
                    queryParams[element] = { "$in": queryParams[element] };
                } 
                let newQs = {
                    [element] : queryParams[element]
                }
                queryParams["$and"].push(newQs);
                delete queryParams[element];
            }
        });
        console.log(queryParams);
        Promise.all(await data_log.Getdata("All_Courses", queryParams))
        .then(value => {
            for (let i = 0 ; i < value.length ; i++) {
                let nowItem = value[i];
                let periodSplit = nowItem.Course_Time.split(",");
                let periodStart = periodSplit[0];
                let periodEnd = periodSplit[periodSplit.length-1];
                nowItem.Period = `${periodStart}~${periodEnd}`;
            }
            let Result = [];
            if (CourseTime != "") {
                for (var i = 0; i < value.length; i++) {
                    if (HaveTime(value[i] , CourseTime)) {
                        Result.push(value[i]);
                    }
                }
                return resolve([Result , tempQuery]);
            }
            else {
                return resolve([value , tempQuery]);
            }
        })
        .catch((err)=> {
            console.error(err);
            return reject(new Error(err));
        });;
    });
}

function getFacultyAndEduTypeQs (queryParams) {
    let FacultyQs = queryParams['Faculty'];
    let EduTypeQs = queryParams['EduType'];
    if (FacultyQs && EduTypeQs) {
        FacultyQs = _.isArray(FacultyQs) ? FacultyQs : [FacultyQs];
        EduTypeQs = _.isArray(EduTypeQs) ? EduTypeQs : [EduTypeQs];
        queryParams['$and'] = new Array({ "Faculty_Name": { "$in": FacultyQs } }, { "Faculty_Name": { "$in": EduTypeQs } });
        delete queryParams['EduType'];
        delete queryParams['Faculty'];
    }
    else if (FacultyQs) {
        FacultyQs = _.isArray(FacultyQs) ? FacultyQs : [FacultyQs];
        queryParams['Faculty_Name'] = { "$in": FacultyQs };
        delete queryParams['Faculty'];
    }
    else if (EduTypeQs) {
        EduTypeQs = _.isArray(EduTypeQs) ? EduTypeQs : [EduTypeQs];
        queryParams['Faculty_Name'] = { "$in":  EduTypeQs};
        delete queryParams['EduType'];
    }
}

function getPartQs (queryParams) {
    if ((queryParams['IsRootPart'] == "true" && queryParams['IsCityPart'] == "true") || (queryParams['IsRootPart'] == "false" && queryParams['IsCityPart'] == "false")) {
        delete queryParams['IsRootPart'];
        delete queryParams['IsCityPart'];
        if (queryParams['Course_Other'] != undefined) {
            queryParams['Course_Other'] = _.isArray(queryParams['Course_Other']) ? queryParams['Course_Other'] : [queryParams['Course_Other']];
            //var regex = ToRegexText(queryParams, 'Course_Other');
            queryParams['Course_Other'] = { "$in": queryParams['Course_Other'] };
        }
    }
    else if (queryParams['IsRootPart'] == "true") {
        delete queryParams['IsRootPart'];
        delete queryParams['IsCityPart'];
        var City = new RegExp("城區");
        if (queryParams['Course_Other']) {
            queryParams['Course_Other'] = _.isArray(queryParams['Course_Other']) ? queryParams['Course_Other'] : [queryParams['Course_Other']];
            //var regex = ToRegexText(queryParams, 'Course_Other');
            queryParams['Course_Other'] = { "$in": queryParams['Course_Other'], "$not": "城區" };
        }
        else {
            queryParams['Course_Other'] = { "$not": City };
        }
    }
    else if (queryParams['IsCityPart'] == "true") {
        delete queryParams['IsRootPart'];
        delete queryParams['IsCityPart'];
        var City = "城區";
        if (queryParams['Course_Other'] != undefined) {
            queryParams['Course_Other'] = _.isArray(queryParams['Course_Other']) ? queryParams['Course_Other'] : [queryParams['Course_Other']];
            queryParams['Course_Other'].push("城區");
            //var regex = ToRegexText(queryParams, 'Course_Other');
            if (queryParams['$and'] != undefined) {
                queryParams['$and'].push({ "Course_Other": { "$in": [City] } })
            }
            else {
                queryParams['$and'] = new Array({ "Course_Other": { "$in": [City] } })
            }
        }
        else {
            queryParams['Course_Other'] = { "$in": [City] };
        }
    }
}

module.exports.getCourseSearch = async function (req) {
    try {
        let data = await getSearchResult(req);
        for (let key in data[0]) {
            let nowData = data[0][key];
            let dataPeriods = nowData.Course_Time.split(",");
            nowData.startPeriod = dataPeriods[0];
            nowData.endPeriod = dataPeriods[dataPeriods.length-1];
        }
        return data;
    } catch (e) {
        console.error(e);
        return false;
    }
}
function ToRegexText(i_item, i_key) {
    var result = i_item[i_key].map(e => {
        return new RegExp(e);
    });
    return result;
}



function HaveTime(Item , CourseTime) {
    let alltimes = Item.Course_Time.split(',');
    for (let x = 0; x < alltimes.length; x++) {
        for (let i = 0; i < CourseTime.length; i++) {
            if (alltimes[x] == CourseTime[i]) {
                return true;
            }
        }
    }
    return false;
}