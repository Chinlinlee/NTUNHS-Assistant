const myFunc = require("../../../My_Func");
const fetch = require('node-fetch');
const cheerio = require('cheerio');
const chrome = require('selenium-webdriver/chrome');
const webdriver = require('selenium-webdriver'); //导入selenium 库
const { courseProgram } = require('../../../../models/NTUNHS/CourseProgram/CourseProgram');
const _ = require('lodash');
const fs = require('fs');

module.exports = async function (req, res) {
    let sessionLearnMap = req.session.learnMap;
    if (sessionLearnMap) {
        return res.send(sessionLearnMap);
    }
    let opt = new chrome.Options();
    opt.addArguments('--headless');
    opt.addArguments('--disable-gpu');
    opt.addArguments('--incognito');
    opt.setUserPreferences({ "download.default_directory": __dirname });
    let driver = await new webdriver.Builder().forBrowser('chrome').setChromeOptions(opt).build();
    let j = myFunc.getJar(req);
    let cookieStr = j.getCookieStringSync("http://system8.ntunhs.edu.tw");
    let aspSessionID = cookieStr.split("=")[1];
    await driver.navigate().to("http://system8.ntunhs.edu.tw/myNTUNHS_student/Modules/Map/tab/Map_tab_14.aspx?dept=");
    if (aspSessionID) {
        await driver.manage().addCookie({
            name: "ASP.NET_SessionId",
            value: aspSessionID
        });
    }
    await driver.navigate().to("http://system8.ntunhs.edu.tw/myNTUNHS_student/Modules/Map/qry/Map_qry_20.aspx");
    try {
        await driver.wait(webdriver.until.elementLocated(webdriver.By.id('pAlertMsg')), 2000);
        let $ = cheerio.load(await driver.getPageSource());
        let alertMsg = $("#pAlertMsg").text();
        if (alertMsg.includes("請先登入系統")) {
            req.logout();
            req.flash("閒置過久，請重新登入");
            return res.status(401).send();
        }
    } catch (e) {
        /* $.post('Map_qry_20.aspx', { 'action': 'htmlCreditHis', 'group': $('select[id*=sltDeptGroup]').find('option:selected').attr('groupno'), 'deptno': $('select[id*=sltDeptGroup]').find('option:selected').attr('deptno'), 'year': $('input:hidden[id*=hidEnterYear]').val(), 'semno': $('input:hidden[id$=hidSEMNO]').val(), 'edutype': $('select[id*=sltDeptGroup]').find('option:selected').attr('edutype') }, function(data) { $('#divCreditHistory').html(data); setFrameSize(); return false; }, 'html');*/
        await driver.sleep(500);
        let $ = cheerio.load(await driver.getPageSource());

        $("#divCreditInfo table").addClass("table table-bordered table-sm");
        $("#divCreditInfo table").attr('style', '');
        $("#divCreditInfo").find("span").remove();
        let passCourse = [];
        $(".tdCourse input").each(function (index, element) {
            let isChecked = $(element).attr("defaultchecked") == "true";
            if (isChecked) {
                //first is input's parent (td)
                //second is td's parnet tr
                //get only text in trCourse
                let course = $(element).parent().parent().children().text();
                passCourse.push(course);
            }
        });
        let tablehtml = $("#divCreditInfo").html();
        await driver.quit();
        let faculty = req.session.stuInfo.stuFaculty;
        let myProgram = [];

        for (let key in courseProgram[faculty]) {
            programObj = {
                key : key , 
                course : [] ,
                credit : 0
            };
            let program = courseProgram[faculty][key].course;
            for (let i = 0 ; i < program.length ; i++) {
                let course = program[i];
                if (passCourse.findIndex(v => v == course.name) >=0 ) {
                    programObj.credit += course.credit;
                    programObj.course.push(course);
                }
            }
            myProgram.push(programObj);
        }
        req.session.learnMap = {
            hitCredit : tablehtml ,
            program : myProgram
        };
        return res.send(req.session.learnMap);
    }
    /* let el = await driver.findElement(webdriver.By.id(`pAlertMsg`));
     await driver.wait(webdriver.until.elementIsVisible(el),1000);*/
}


