var url = require('url');

module.exports.normalize = function (VariableString) {
    var NormalizeString;
    if (VariableString == undefined)
        NormalizeString = "";
    else {
        var resplaceEscape = VariableString.replace(/\+/g, '%20');
        NormalizeString = decodeURIComponent(resplaceEscape);
    }
    return NormalizeString;
};

module.exports.getQueryStringToJSON = function (queryString) {
    var j = {};
    var q = queryString.replace(/\?/, "").split("&");
    if (q == "") return j;
    q.forEach(function (value, i, array1) {
        value = value.split('=');
        return j[value[0]] = value[1];
    });
    return j;
};