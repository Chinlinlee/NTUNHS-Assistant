const mkdirp = require('mkdirp');
const { updateCourseMain } = require('./models/NTUNHS/updateCourse');

const needFolder = ['xlsx', 'docx', 'pdf', 'picture'];
for (let item of needFolder) {
    mkdirp.sync(`./${item}`);
}

(async () => {
    await updateCourseMain();
})();
