const fetch = require('node-fetch');
const {URLSearchParams} =require('url');
const { getILMSJar } = require('../../../My_Func');
const cherrio = require('cheerio');
const _ = require('lodash');
const { eq } = require('lodash');

module.exports = async function (req , res) {
    let stuAllCourse = [];
    let j = getILMSJar(req);
    let fetchCookie = require('fetch-cookie')(fetch , j);
    let ilmsAllCourseRes = await fetchCookie('https://ilms.ntunhs.edu.tw/home.php?f=allcourse');
    let ilmsAllCourseResText = await ilmsAllCourseRes.text();
    let $ = cherrio.load(ilmsAllCourseResText);
    $('#copyright').remove();
    $('.tblTitle').each(function (index , element) {
        let title = $(element).text().replace(/ /gm , '');
        let titleSplit = title.split(/\n/);
        let titleClean = _.compact(titleSplit);
        console.log(titleClean);
    });
    let staticTitle = ["課程編號" , "標題" , "老師" , "學分" , "班級"];
    $('td').each(function(index , td) {
        let tdText = $(td).text().trim();
        if (staticTitle.indexOf(tdText)<=-1) {
            if (index % 5 == 4) {
                let courseObj = {
                    courseId : $('td').eq(index-4).text() ,
                    courseName : $('td').eq(index-3).text() ,
                    courseURL : `https://ilms.ntunhs.edu.tw${$('td').eq(index-3).find('a').eq(0).attr('href')}` ,
                    courseTeacher : $('td').eq(index-2).text() ,
                    courseCredit : $('td').eq(index-1).text() ,
                    courseClass : $(td).text()
                }
                _.set(courseObj , 'courseSem' , courseObj.courseId.substr(0 , 4));
                _.set(courseObj,  'courseNormalId' , courseObj.courseId.substring(4));
                stuAllCourse.push(courseObj);
            }
        }
    });
    res.send(stuAllCourse);
}