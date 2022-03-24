const {
    courseProgram,
} = require('../../../../models/NTUNHS/CourseProgram/CourseProgram')

const _ = require('lodash')

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
module.exports = async function (req, res) {}
function getCourseProgram() {
    let faculty = req.session.stuInfo.stuFaculty
    let myProgram = []

    for (let key in courseProgram[faculty]) {
        programObj = {
            key: key,
            course: [],
            credit: 0,
        }
        let program = courseProgram[faculty][key].course
        for (let i = 0; i < program.length; i++) {
            let course = program[i]
            if (passCourse.findIndex((v) => v == course.name) >= 0) {
                programObj.credit += course.credit
                programObj.course.push(course)
            }
        }
        myProgram.push(programObj)
    }
    return myProgram
}

module.exports.getCourseProgram = getCourseProgram
