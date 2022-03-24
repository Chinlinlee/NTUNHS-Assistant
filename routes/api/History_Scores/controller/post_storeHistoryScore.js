const { getHistoryScores } = require('./get_History_Scores');
const { getTookCourse } = require('../../learnMap/controller/get_tookCourse');
const { MongoExe } = require('../../../../models/common/data');
const _ = require('lodash');

const staticScoreCategory = [
    '90~100',
    '80~90',
    '70~80',
    '60~70',
    '50~60',
    '40~50',
    '30~40',
    '20~30',
    '10~20',
    '0~10',
];
module.exports = async function (req, res) {
    let historyScoreData = await getHistoryScores(req);
    let stuNum = req.session.stuInfo.stuNum;
    if (historyScoreData) {
        let historyScore = _.cloneDeep(historyScoreData[0]);
        for (let i in historyScore) {
            let v = historyScore[i];
            v.score = v.Up_Score | v.Down_Score;
            v.Course = v.Course.substring(9);
            if (v.Up_Score) {
                v.Sem = v.Sem + '1';
            } else if (v.Down_Score) {
                v.Sem = v.Sem + '2';
            }
        }
        let tookCourses = await getTookCourse(req);
        if (tookCourses) {
            for (let key in historyScore) {
                let data = historyScore[key];
                let hitCourse = _.find(
                    tookCourses,
                    (v) =>
                        v.courseName.includes(data.Course) &&
                        v.courseSem == data.Sem
                );
                if (hitCourse) {
                    try {
                        let conn = await MongoExe();
                        let db = conn.db('My_ntunhs');
                        let collection = db.collection('storedHistoryScore');
                        collection.findOne(
                            {
                                $and: [
                                    {
                                        courseNormalId:
                                            hitCourse.courseNormalId,
                                    },
                                    {
                                        courseSem: data.Sem,
                                    },
                                ],
                            },
                            async function (err, courseData) {
                                let courseScoreCategory = getScoreCategory(
                                    data.score
                                );
                                if (err) {
                                    console.error(err);
                                    process.exit(1);
                                } else if (courseData) {
                                    if (
                                        !courseData.scoreCategory[
                                            courseScoreCategory
                                        ].includes(stuNum)
                                    ) {
                                        await collection.findOneAndUpdate(
                                            {
                                                $and: [
                                                    {
                                                        courseNormalId:
                                                            hitCourse.courseNormalId,
                                                    },
                                                    {
                                                        courseSem: data.Sem,
                                                    },
                                                ],
                                            },
                                            {
                                                $push: {
                                                    [`scoreCategory.${courseScoreCategory}`]:
                                                        req.session.stuInfo
                                                            .stuNum,
                                                },
                                            }
                                        );
                                    }
                                } else {
                                    let storeObj = {
                                        courseClass: hitCourse.courseClass,
                                        courseName: data.Course,
                                        courseNormalId:
                                            hitCourse.courseNormalId,
                                        courseTeacher: hitCourse.courseTeacher,
                                        courseSem: hitCourse.courseSem,
                                        scoreCategory: {},
                                    };
                                    for (let category of staticScoreCategory) {
                                        storeObj.scoreCategory[category] = [];
                                    }
                                    storeObj.scoreCategory[
                                        courseScoreCategory
                                    ].push(req.session.stuInfo.stuNum);
                                    await collection.insertOne(storeObj);
                                }
                            }
                        );
                    } catch (e) {
                        console.error(e);
                        return res.status(500).send();
                    }
                }
            }
            return res.status(200).send({
                code: 200,
                message: 'store success',
            });
        }
        return res.status(401).send();
    }
};

function getScoreCategory(iScore) {
    if (iScore >= 90 && iScore <= 100) {
        return '90~100';
    } else if (iScore >= 80 && iScore < 90) {
        return '80~90';
    } else if (iScore >= 70 && iScore < 80) {
        return '70~80';
    } else if (iScore >= 60 && iScore < 70) {
        return '60~70';
    } else if (iScore >= 50 && iScore < 60) {
        return '50~60';
    } else if (iScore >= 40 && iScore < 50) {
        return '40~50';
    } else if (iScore >= 30 && iScore < 40) {
        return '30~40';
    } else if (iScore >= 20 && iScore < 30) {
        return '20~30';
    } else if (iScore >= 10 && iScore < 20) {
        return '10~20';
    } else if (iScore >= 0 && iScore < 10) {
        return '0~10';
    }
    return 'exception';
}
