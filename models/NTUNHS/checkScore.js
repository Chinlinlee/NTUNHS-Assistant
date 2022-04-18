const { Auth } = require('../../models/users/School_Auth');
const myFunc = require('../../routes/My_Func');
const fetch = require('node-fetch');
const cheerio = require('cheerio');
const _ = require('lodash');
const tough = require('tough-cookie');
const config = require('./config');

(async () => {
    let jar = new tough.CookieJar();
    let fetchCookie = require('fetch-cookie')(fetch, jar);
    let fetchRes = await fetchCookie(
        `${config.apiHost}/api/login?username=${config.stuNum}&password=${config.stuPwd}`,
        {
            method: 'POST',
        }
    );
    //    console.log(await fetchRes.text());
    let fetchScoreRes = await fetchCookie(`${config.apiHost}/api/Scores`, {
        method: 'GET',
    });
    let score = await fetchScoreRes.json();
    /*score.ranks = score.ranks.map(v=> {
        v.name = "1"
        return v;
    });*/
    if (score) {
        let isScorePresent = score.ranks.find((v) =>
            v.name.includes('學期未結束')
        )
            ? false
            : true;
        if (isScorePresent) {
            console.log('學期成績出來囉');
            /* TODO Do something (做worker service or email?)*/
        }
    }
    let fetchLogout = await fetchCookie(`${config.apiHost}/api/logout`, {
        method: 'GET',
    });
})();
