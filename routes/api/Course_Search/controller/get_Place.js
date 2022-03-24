const _ = require('lodash');
const data_log = require('../../../../models/common/data.js');

module.exports = async function (req, res) {
    let queryParams = req.query;
    Object.keys(queryParams).forEach((element) => {
        if (!queryParams[element]) {
            delete queryParams[element];
        } else if (
            !Array.isArray(queryParams[element]) &&
            typeof queryParams[element] == 'string'
        ) {
            queryParams[element] = [queryParams[element]];
        }
    });
    if (
        !_.get(queryParams, 'IsRootPart') &&
        !_.get(queryParams, 'IsCityPart')
    ) {
        queryParams['IsRootPart'] = new Array('true');
        queryParams['IsCityPart'] = new Array('true');
    }
    if (
        _.get(queryParams, 'IsRootPart.0') == _.get(queryParams, 'IsCityPart.0')
    ) {
        delete queryParams['IsRootPart'];
        delete queryParams['IsCityPart'];
    } else if (_.get(queryParams, 'IsRootPart.0') == 'true') {
        delete queryParams['IsRootPart'];
        delete queryParams['IsCityPart'];
        let City = new RegExp('城區');
        queryParams['Course_Other'] = { $not: City };
    } else if (_.get(queryParams, 'IsCityPart.0') == 'true') {
        delete queryParams['IsRootPart'];
        delete queryParams['IsCityPart'];
        let City = new RegExp('城區');
        queryParams['Course_Other'] = { $in: [City] };
    }
    Promise.all(await data_log.Getdata('All_Courses', queryParams)).then(
        (value) => {
            let Result = [];
            value.forEach((item) => {
                if (item.Course_Place != '') {
                    if (item.Course_Place.indexOf(',') >= 0) {
                        var multi_Place = item.Course_Place.split(',');
                        multi_Place.forEach((place) => {
                            Result.push(place);
                        });
                    } else {
                        Result.push(item.Course_Place);
                    }
                }
            });
            let output = Array.from(new Set(Result));
            res.send(output);
        }
    );
};
