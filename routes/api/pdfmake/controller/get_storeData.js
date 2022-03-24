module.exports = function (req, res) {
    return res.json(getData(req))
}

function getData(req) {
    return req.session.storeData
}

module.exports.getData = getData
