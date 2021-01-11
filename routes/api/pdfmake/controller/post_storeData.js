module.exports = function (req , res) {
    req.session.storeData = req.body.data;
    res.end();
}