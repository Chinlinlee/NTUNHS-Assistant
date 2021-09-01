const chrome = require('selenium-webdriver/chrome');
require('chromedriver');
const webdriver = require('selenium-webdriver');
const getPort = require('get-port');
let config = require('./config');
const fs = require('fs');
const cheerio = require('cheerio');
const schedule = require('node-schedule');

async function main () {
    let opt = new chrome.Options();
    let debugPort = await getPort();
    opt.addArguments('--incognito');
    opt.addArguments(`--remote-debugging-port=${debugPort}`);
    opt.addArguments('--no-sandbox');
    opt.addArguments('--disable-dev-shm-usage');
    opt.addArguments('--headless');
    opt.addArguments('--disable-gpu');
    opt.set('unhandledPromptBehavior' , 'accept');
    let driver = await new webdriver.Builder().forBrowser('chrome').setChromeOptions(opt).build();
    await driver.navigate().to("https://system10.ntunhs.edu.tw/Workflow/Modules/Main/login.aspx?first=true&action=&info=");
    console.log("go to siginoff");
    await driver.wait(webdriver.until.elementLocated(webdriver.By.id("ContentPlaceHolderDetail_loginModule1_txtLOGINID")));
    await driver.executeScript(`$('#ContentPlaceHolderDetail_loginModule1_txtLOGINID').val("${config.stuNum}")`)
    await driver.executeScript(`$('#ContentPlaceHolderDetail_loginModule1_txtLOGINPWD').val("${config.stuPwd}")`)
    await driver.executeScript(`$("#btnLogin").click()`);
    await driver.sleep(1000);
    try {
        await driver.wait(webdriver.until.elementLocated(webdriver.By.id("ddlSystype")), 2500);
        //await driver.executeScript(`$("#ctl00_loginModule1_hidSystype").val("student").change();`);
        await driver.executeScript(`$("#ddlSystype").val("student").change();`);
        await driver.executeScript(`$("#btnLogin").click()`);
    } catch (e) { 
    }
    await driver.sleep(1000);
    try {
       
        await driver.wait(webdriver.until.alertIsPresent() ,5000);
        let alert = await driver.switchTo().alert();
        //Press the OK button
        await alert.accept();
    } catch (e) {}
    await driver.wait(webdriver.until.elementLocated({ id : 'ContentPlaceHolderQuery_QueryFrame'}) , 15000);
    let queryFrame = await driver.findElement({id : 'ContentPlaceHolderQuery_QueryFrame'});
    await driver.switchTo().frame(queryFrame);
    /*await driver.executeScript(`$("#ddlWFName").val("修課-少修申請").change();`);*/
    let $ = cheerio.load(await driver.getPageSource());
    let optionLen = $("#ddlWFName option").length;
    for (let i = 0; i < optionLen ; i++) {
        let element = $("#ddlWFName option").eq(i);
        let eText = $(element).text().trim();
        if (eText.includes("少修申請")) {
            config.isSignOffLess = true;
            fs.writeFileSync(`${__dirname}/config.js` , `module.exports= ${JSON.stringify(config , null , 4)}`);
            return;
        } else if ((optionLen-1) == i) {
            config.isSignOffLess = false;
            fs.writeFileSync(`${__dirname}/config.js` , `module.exports= ${JSON.stringify(config , null , 4)}`);
            return;
        }
    }
}



module.exports = {
    checkSignOffLessTake: main
}