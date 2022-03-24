const data_log = require('../../../../models/common/data.js')

module.exports = async function (req, res) {
    Promise.all(await data_log.Getdata('All_Courses', {})).then((value) => {
        var Result = []
        value.forEach((item) => {
            if (item.Teacher != '') {
                if (item.Teacher.indexOf(',')) {
                    var muti_teacher = item.Teacher.split(',')
                    muti_teacher.forEach((teacher) => {
                        Result.push(teacher)
                    })
                } else {
                    Result.push(item.Teacher)
                }
            }
        })
        var output = Array.from(new Set(Result))
        res.send(output)
    })
}
