
const fs = require('fs');
const cheerio = require('cheerio');
const chrome = require('selenium-webdriver/chrome');
require('chromedriver'); //导入chrome浏览器 driver
const webdriver = require('selenium-webdriver'); //导入selenium 库
const glob = require("glob");
const xlsx = require("xlsx");
const _ = require("lodash");
const mongodb = require("../common/data");
const config = require("./config");
const path = require('path');
async function getCourseExcel(driver) {
    return new Promise(async (resolve) => {
        await driver.navigate().to("http://system10.ntunhs.edu.tw/AcadInfoSystem/Modules/QueryCourse/QueryCourse.aspx");
        await driver.executeScript(`$("#ContentPlaceHolder1_ddlSem").children().eq(1).attr("selected" ,true).change()`); //高到低 0>當前 1> 上學期
        await driver.executeScript(`$("#ContentPlaceHolder1_btnQuery").click()`);
        driver.wait(webdriver.until.elementIsVisible(driver.findElement(webdriver.By.id("ContentPlaceHolder1_imgExcel"))), 150000).then(async (p) => {
            await driver.executeScript(`$("#ContentPlaceHolder1_imgExcel").click()`);
            await driver.sleep(30000);
            //driver.quit();
            glob("**/*.xls", function (err, matches) {
                if (err) {
                    console.error(err);
                    process.exit(1);
                }
                console.log(matches);
                for (let match of matches) {
                    if (match.includes("課程查詢")) {
                        let matchDirname = path.dirname(match);
                        let storePath = path.join(matchDirname , "courses.xls");
                        fs.renameSync(match, storePath);
                        return resolve(true);
                    } else {
                        return resolve(true);
                    }
                }
            });
        })
    })
}

async function seleSchoolLogin(iDriver, acc, pwd) {
    return new Promise(async (resolve) => {
        try {
            iDriver.get("http://system8.ntunhs.edu.tw/myNTUNHS_student/Modules/Main/Index_student.aspx?timeout=false") //打开https://autowebtest.github.io/
            iDriver.sleep(100);
            await iDriver.wait(webdriver.until.elementLocated({ id: 'ctl00_loginModule1_txtLOGINID' }), 15000);
            let inputAcc = await iDriver.findElement({ id: 'ctl00_loginModule1_txtLOGINID' });
            let inputPwd = await iDriver.findElement({ id: 'ctl00_loginModule1_txtLOGINPWD' });
            await inputAcc.clear();
            await inputAcc.sendKeys(acc);
            await iDriver.sleep(100);
            await inputPwd.clear();
            await inputPwd.sendKeys(pwd);
            let submitBtn = await iDriver.findElement({ id: 'btnLogin' });
            await submitBtn.click();
            await iDriver.sleep(1000);
            try {
                let selectIden = await iDriver.findElement({ id: 'ddlSystype' });
                await iDriver.executeScript(`$("#ctl00_loginModule1_hidSystype").val("student").change();`);
                await iDriver.executeScript(`$("#ddlSystype").val("student").change();`);
                await submitBtn.click();
            } catch (e) { }
            return resolve([true, iDriver]);
        } catch (e) {
            console.log(e);
            return resolve([false, iDriver]);
        }
    });
    //iDriver.quit();
}

async function getCoursePlanPageUrl(driver) {
    /*let opt = new chrome.Options();
    opt.addArguments('--headless');
    opt.addArguments('--disable-gpu');
    opt.addArguments('--incognito');
    opt.setUserPreferences({"download.default_directory" :  __dirname});
    let driver = await new webdriver.Builder().forBrowser('chrome').setChromeOptions(opt).build(); //创建一个chrome 浏览器实例*/
    [___, driver] = await seleSchoolLogin(driver, config.stuNum, config.stuPwd);
    await driver.navigate().to("https://system8.ntunhs.edu.tw/myNTUNHS_student/Modules/Teachplan/qry/Teachplan_qry_01.aspx");
    await driver.sleep(2000);
    let queryFrame = await driver.findElement({ id: 'ctl00_ContentPlaceHolderQuery_QueryFrame' });
    await driver.switchTo().frame(queryFrame);
    await driver.sleep(1000);
    //await driver.executeScript(`$("#ddlSemNo").children().eq(9).attr("selected" ,true).change()`); //低到高
    await driver.executeScript(`$("#ddlSemNo").children().last().attr("selected" ,true).change()`);
    await driver.executeScript(`$("#btnQuery").click();`);
    await driver.switchTo().window(driver.getWindowHandle());
    let listFrame = await driver.findElement({ id: "ctl00_ContentPlaceHolderList_ListFrame" });
    await driver.switchTo().frame(listFrame);
    await driver.sleep(1000);
    let $ = cheerio.load(await driver.getPageSource());
    let url = `https://system8.ntunhs.edu.tw/myNTUNHS_student/Modules/Teachplan/qry/${$("#form1").attr("action")}&index=0`;
    console.log(url);
    return url;
}

async function crawlCoursePlan(driver) {

    /*let opt = new chrome.Options();
    opt.addArguments('--headless');
    opt.addArguments('--disable-gpu');
    opt.addArguments('--incognito');
    opt.setUserPreferences({"download.default_directory" :  __dirname});
    let driver = await new webdriver.Builder().forBrowser('chrome').setChromeOptions(opt).build(); //创建一个chrome 浏览器实例*/
    let url = await getCoursePlanPageUrl(driver);
    await driver.navigate().to(url);
    await driver.sleep(1500);
    let $ = cheerio.load(await driver.getPageSource());
    let count = $("#GridView1_ctl13_lblPageCount").text() || 1;
    let coursePlanObjList = [];
    for (let i = 0; i < count; i++) {
        let pageUrl = new URL(url);
        pageUrl.searchParams.set("index", i);
        await driver.navigate().to(pageUrl.toString());
        let $ = cheerio.load(await driver.getPageSource());
        $("a").each((index, element) => {
            let href = element.attribs.href;
            if (href.includes("140.131")) {
                console.log(href);
                let filenameSplit = href.split("-");
                if (filenameSplit.length == 4) {
                    let planObj = {
                        openTeacher: filenameSplit[1],
                        code: filenameSplit[2],
                        secondCode: filenameSplit[3].substring(0, filenameSplit[3].indexOf(".")),
                        src: href
                    }
                    coursePlanObjList.push(planObj);
                } else {
                    let planObj = {
                        openTeacher: filenameSplit[1],
                        code: filenameSplit[2].substring(0, filenameSplit[2].indexOf(".")),
                        src: href
                    }
                    coursePlanObjList.push(planObj);
                }
            }
        });
    }
    fs.writeFileSync(path.join(__dirname, "plan.json"), JSON.stringify(coursePlanObjList, null, 4));
    //driver.quit();
}


async function getCoursePlan() {
    let item = fs.readFileSync(path.join(__dirname, "plan.json"), { encoding: "utf-8" });
    let itemJson = JSON.parse(item);
    return itemJson;
}

async function getFaculties() {
    let item = fs.readFileSync(path.join(__dirname, "Faculties.json"), { encoding: "utf-8" });
    let itemJson = JSON.parse(item);
    return itemJson;
}
async function updateCourse() {
    let courseXlsData = xlsx.readFile(path.join(__dirname, "./courses.xls"));
    let sheetsName = courseXlsData.SheetNames[0];
    let dataJson = xlsx.utils.sheet_to_json(courseXlsData.Sheets[sheetsName], { range: 4 }); //The couese excel header row is 5
    let coursePlans = await getCoursePlan();
    let faculties = await getFaculties();
    let result = [];
    console.log(dataJson[0]);
    for (let item of dataJson) {
        let hitCourse = _.filter(coursePlans, v => {
            if (_.get(v, "secondCode")) {
                return (v.code == item["科目代碼(舊碼)"] && v.openTeacher == item["主開課教師代碼(舊碼)"] && v.secondCode == item["課表代碼(舊碼)"]);
            }
            return (v.code.trim() == item["科目代碼(舊碼)"] && v.openTeacher == item["主開課教師代碼(舊碼)"]) || (v.code.trim() == item["課表代碼(舊碼)"] && v.openTeacher == item["主開課教師代碼(舊碼)"]);
        })
        if (hitCourse.length) {
            item.Class_Plan = hitCourse[0].src;
        }
        let hitFaculty = _.filter(faculties, v => v["系所代碼"] == item["系所代碼"]);
        if (hitFaculty.length) {
            item["系所名稱"] = hitFaculty[0]["系所名稱"];
        }
        let newObj = {};
        newObj.Sem = item["學期"];
        newObj.Course_Id = item["科目代碼(新碼全碼)"];
        newObj.Id = item["編號"];
        newObj.Course_Day = item["上課星期"];
        newObj.Course_Eng_Name = item["科目英文名稱"];
        newObj.Course_Name = item["科目中文名稱"];
        newObj.Course_Place = item["上課地點"];
        newObj.Course_Time = item["上課節次"];
        newObj.Course_Type = item["課別名稱"];
        newObj.Course_Week = item["上課週次"];
        newObj.Course_Other = item["課表備註"];
        newObj.Credits = item["學分數"];
        newObj.Faculty_Id = item["系所代碼"];
        newObj.Faculty_Name = item["系所名稱"];
        newObj.Grad = item["年級"];
        newObj.Limit_People = item["限制人數"] || "";
        newObj.Teacher = item["授課教師姓名"];
        newObj.Open_Teacher = item["主開課教師姓名"];
        newObj.Class_Name = item["課表名稱(舊碼)"];
        newObj.Course_People = item["上課人數"];
        newObj.Course_Code = item["科目代碼(舊碼)"];
        newObj.Open_Teacher_Code = item["主開課教師代碼(舊碼)"];
        newObj.Schedule_Code = item["課表代碼(舊碼)"];
        newObj.Class_Plan = item.Class_Plan;
        newObj._id = `${newObj.Sem}_${newObj.Course_Id}`;
        result.push(newObj);
    }
    const conn = await mongodb.MongoExe();
    conn.db('My_ntunhs').collection("All_Courses").createIndex(
        {
            "Course_Name": 1
        }
        , function (err, result) {
            if (err) console.error(err);
            console.log(result);
        }
    );
    // await mongodb.InsertManydata("All_Courses" , result);
    for (let key in result) {
        let course = result[key];
        let id = course._id;
        await (async () => {
            return new Promise((resolve) => {
                conn.db('My_ntunhs').collection("All_Courses").findOneAndUpdate({ _id: id }, { $set: course }, { upsert: true }, async function (err, doc) {
                    if (err) {
                        console.error(err);
                        return resolve(false);
                    }
                    //console.log(doc);
                    await conn.close();
                    return resolve(doc);
                })
            })
        })();
    }
    console.log(result.length);
    return true;
}
async function updateCourseMain() {
    let opt = new chrome.Options();
    opt.addArguments('--headless');
    opt.addArguments('--disable-gpu');
    opt.addArguments('--incognito');
    opt.setUserPreferences({ "download.default_directory": __dirname });
    let driver = await new webdriver.Builder().forBrowser('chrome').setChromeOptions(opt).build(); //创建一个chrome 浏览器实例
    crawlCoursePlan(driver).then(() => {
        getCourseExcel(driver).then(() => {
            driver.quit();
            //driver.quit();
            updateCourse().then(() => {
                console.log("success");
            });
        });
    });
}
module.exports = {
    crawlCoursePlan: crawlCoursePlan,
    getCourseExcel: getCourseExcel,
    updateCourse: updateCourse,
    updateCourseMain: updateCourseMain
}



  