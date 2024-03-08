const request = require('request');
const nodefetch = require('node-fetch');
const tough = require('tough-cookie');

const { URL, URLSearchParams } = require('url');
const myFunc = require('../../routes/My_Func');
const puppeteer = require("puppeteer");
const { EventEmitter } = require('stream');
const { cache } = require('ejs');

class NtunhsAuthHandler {
    constructor(req) {
        /** @type { import('express').Request } */
        this.request = req;
    }

    async portfolioAuth(username, password) {
        let j = myFunc.getJar(this.request);
        const browser = await puppeteer.launch({ headless: false, args: ["--disable-web-security"] });
        const page = await browser.newPage();
        let loginResponseEmitter = new EventEmitter();

        await page.goto("https://system8.ntunhs.edu.tw/myNTUNHS_student/Modules/Main/Index_student.aspx");
        let usernameInput = await page.waitForSelector("#ctl00_loginModule1_txtLOGINID");
        await usernameInput.type(username);

        let passwordInput = await page.waitForSelector("#ctl00_loginModule1_txtLOGINPWD");
        await passwordInput.type(password);

        let loginBtn = await page.waitForSelector("#btnLogin");
        await loginBtn.click();

        try {
            let multiUserType = await page.waitForSelector("#ddlSystype", {timeout: 500});
            await multiUserType.select("student");
            await loginBtn.click();
        } catch(e) {}

        page.setRequestInterception(true);
        page.on("request", async req => {
            if (req.url().includes("loginModule")) {
                if (req.url().includes("code")) {
                    let urlObj = new URL(req.url());
                    loginResponseEmitter.emit("loginSuccess", {
                        txtid: urlObj.searchParams.get("txtid"),
                        code: urlObj.searchParams.get("code"),
                        select: urlObj.searchParams.get("from")
                    });
                } else {
                    loginResponseEmitter.emit("loginFailure");
                }
                req.continue();
            } else {
                req.continue();
            }
        });

        const pageCookies = await page.cookies();
        for(let c of pageCookies) {
            if (c.domain === "system8.ntunhs.edu.tw")
                j.setCookieSync(`${c.name}=${c.value}`, "https://system8.ntunhs.edu.tw");
        }
        this.request.session.ntunhsApp = await j.getCookieString(
            "https://system8.ntunhs.edu.tw"
        );

        return new Promise(resolve => {
            loginResponseEmitter.on("loginSuccess", async ({ txtid, code, select }) => {
                await browser.close();
                return resolve({
                    txtid,
                    code,
                    select
                });
            });
            loginResponseEmitter.on("loginFailure", async () => {
                await browser.close();
                return resolve({
                    txtid: undefined,
                    code: undefined,
                    select: undefined
                })
            })
        });
    }
}
module.exports.Auth = async function (username, password, obj = {}) {
    return new Promise(async (resolve) => {
        let j = myFunc.getJar(obj);
        const fetch = require('fetch-cookie')(nodefetch, j);
        const params = new URLSearchParams();
        params.append('txtid', username);
        params.append('txtpwd', password);
        params.append('select', 'student');
        let fetchRes = await fetch(
            'http://system8.ntunhs.edu.tw/myNTUNHS_student/Common/UserControls/loginModule.aspx?' +
            params,
            {
                method: 'POST',
            }
        );
        let body = await fetchRes.text();
        obj.session.ntunhsApp = await j.getCookieString(
            'http://system8.ntunhs.edu.tw'
        );
        return resolve(body);
    });
};

module.exports.signOffAuth = async function (username, password, obj = '') {
    return new Promise(async (resolve) => {
        let j = myFunc.getSignOffJar(obj);
        const fetch = require('fetch-cookie')(nodefetch, j);
        const params = new URLSearchParams();
        params.append('txtid', username);
        params.append('txtpwd', password);
        params.append('select', 'student');
        let fetchRes = await fetch(
            'http://system10.ntunhs.edu.tw/Workflow/Common/UserControls/loginModule.aspx?' +
            params,
            {
                method: 'POST',
            }
        );
        let body = await fetchRes.text();
        obj.session.ntunhsSignOff = await j.getCookieString(
            'http://system10.ntunhs.edu.tw'
        );
        return resolve(body);
    });
};

module.exports.ilmsAuth = async function (username, password, obj = {}) {
    return new Promise(async (resolve) => {
        let j = myFunc.getILMSJar(obj);
        const fetch = require('fetch-cookie')(nodefetch, j);
        const params = new URLSearchParams();
        params.append('account', username);
        params.append('password', password);
        params.append('secCode', 'na');
        params.append('stay', 0);
        let fetchRes = await fetch(
            'https://ilms.ntunhs.edu.tw/sys/lib/ajax/login_submit.php?' +
            params,
            {
                method: 'POST',
            }
        );
        let body = await fetchRes.text();
        obj.session.ntunhsILMS = await j.getCookieString(
            'https://ilms.ntunhs.edu.tw/'
        );
        return resolve(body);
    });
};

module.exports.NtunhsAuthHandler = NtunhsAuthHandler;