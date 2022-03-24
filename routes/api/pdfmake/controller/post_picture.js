const pdfmake_func = require('./pdfmake_func.js')
const fs = require('fs')

module.exports = async function (req, res) {
    var imgdata = req.body.imgdata
    var buff = new Buffer.from(imgdata, 'base64')
    var rndName = await pdfmake_func.CreateFileName(
        process.cwd() + '/picture/',
        '.png'
    )
    var filename = rndName
    fs.writeFileSync(filename, buff)
    var file = filename.split('/')
    file =
        '1081New_Project/nodejs_mongo/myExpressApp/' +
        file[file.length - 2] +
        '/' +
        file[file.length - 1]
    res.send(file)
}
