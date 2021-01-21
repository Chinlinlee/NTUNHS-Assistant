const mkdirp = require('mkdirp');
const { updateCourseMain } = require('./models/NTUNHS/updateCourse');

const needFolder = ['xlsx' , 'docx' , 'pdf' , 'picture'];
for (let item of needFolder) {
    mkdirp.sync(`./${item}`);
}

updateCourseMain().then(function (res) {
    console.log("success");
});
