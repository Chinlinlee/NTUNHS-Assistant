const request = require('request')
const cheerio = require('cheerio')
const nodeFetch = require('node-fetch')
const School_Auth = require('../../../../models/users/School_Auth.js')
const tough = require('tough-cookie')
const myFunc = require('../../../My_Func')
const iconv = require('iconv-lite')

module.exports = async function (req, res) {
    let queryParams = req.body
    let jar = new tough.CookieJar()
    let fetchCookie = require('fetch-cookie')(nodeFetch, jar)
    Object.keys(queryParams).forEach((element) => {
        if (!queryParams[element]) {
            delete queryParams[element]
        }
    })
    let authcode = await School_Auth.Auth(
        queryParams['username'],
        queryParams['password'],
        req
    )
    let isAuth = authcode.split('_').length >= 2
    if (!isAuth) {
        return res.redirect(
            '/CTE_BOT?error=' + encodeURIComponent('Password_Error')
        )
    }
    let first = await fetchCookie(
        'http://system8.ntunhs.edu.tw/intranetasp/evaMain/stLogin.asp',
        { method: 'GET' }
    )

    var requestOptions = {
        method: 'POST',
        redirect: 'follow',
    }

    let ctePageFetch = await fetchCookie(
        `http://system8.ntunhs.edu.tw/intranetasp/evaMain/stLogin.asp?txtSTNO=${queryParams['username']}&txtPW=${queryParams['password']}`,
        requestOptions
    )
    //console.log(await ctePageFetch.text());
    var headers2 = {
        'User-Agent':
            'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2490.80 Safari/537.36',
        referer: 'http://system1.ntunhs.edu.tw/intranetasp/evaMain/stEval.asp',
    }
    var option_2 = {
        url: 'http://system8.ntunhs.edu.tw/intranetasp/evaMain/stDeal.asp',
        method: 'GET',
        followAllRedirects: true,
        headers: headers2,
    }
    //var Deal_Table =await Request_func(_request , option_2);
    fetchCookie = require('fetch-cookie')(nodeFetch, jar)
    let Deal_TableFetch = await fetchCookie(option_2.url, {
        method: option_2.method,
        headers: option_2.headers,
        encoding: null,
        referrer: 'http://system8.ntunhs.edu.tw/intranetasp/evaMain/stEval.asp',
    })
    let Deal_Table = await Deal_TableFetch.text()
    //console.log(iconv.decode(new Buffer(Deal_Table) , 'BIG5').toString());
    $ = cheerio.load(Deal_Table)
    var links = $('a[href]')
    var Class_links = []
    $(links).each((index, element) => {
        Class_links.push($(element).attr('href').trim())
    })
    for (var i = 0; i < Class_links.length; i++) {
        var headers3 = {
            'User-Agent':
                'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2490.80 Safari/537.36',
        }
        var option_3 = {
            url:
                'http://system8.ntunhs.edu.tw/intranetasp/evaMain/' +
                Class_links[i],
            method: 'GET',
            followAllRedirects: true,
            headers: headers3,
        }
        await fetchCookie(option_3.url, {
            method: 'GET',
            redirect: 'follow',
            headers: {
                'User-Agent':
                    'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2490.80 Safari/537.36',
            },
        })
        console.log(JSON.stringify(Class_links[i]))
        var headers4 = {
            'User-Agent':
                'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2490.80 Safari/537.36',
            referer:
                'http://system1.ntunhs.edu.tw/intranetasp/evaMain/' +
                Class_links[i],
            'Content-Type': 'application/x-www-form-urlencoded',
        }
        let postChoicedata = `rb1=${queryParams['Q_1']}&rb2=${queryParams['Q_2']}&rb3=${queryParams['Q_3']}&rb4=${queryParams['Q_4']}&rb5=${queryParams['Q_5']}&rb6=${queryParams['Q_6']}&rb7=${queryParams['Q_7']}&rb8=${queryParams['Q_8']}&rb9=${queryParams['Q_9']}&rb10=${queryParams['Q_10']}&rb11=${queryParams['Q_11']}&rb12=${queryParams['Q_12']}&rb13=${queryParams['Q_13']}&rbA=${queryParams['Q_14']}&OPN_REM=`
        var option_4 = {
            url: 'http://system8.ntunhs.edu.tw/intranetasp/evaMain/stEditCdo.asp',
            method: 'POST',
            followAllRedirects: true,
            headers: headers4,
            body: postChoicedata,
        }
        let finalFetch = await fetchCookie(
            option_4.url + '?' + postChoicedata,
            {
                method: 'POST',
                redirect: 'follow',
                headers: {
                    'User-Agent':
                        'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2490.80 Safari/537.36',
                    Referer:
                        'http://system8.ntunhs.edu.tw/intranetasp/evaMain/' +
                        Class_links[i],
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            }
        )
        let finalFetchTxt = await finalFetch.arrayBuffer()
        finalFetchTxt = iconv
            .decode(new Buffer(finalFetchTxt), 'BIG5')
            .toString()
        // var Final_Result  =await Request_func(_request , option_4);
        if (!finalFetchTxt.includes('感謝')) {
            return res.redirect(
                '/CTE_BOT?error=' + encodeURIComponent('System_Error')
            )
        }
    }
    return res.redirect('/CTE_BOT?error=' + encodeURIComponent('Success'))
}

//call by sharing
async function Request_func(req_obj, i_option) {
    return new Promise((resolve) => {
        req_obj(i_option, function (err, response, body) {
            if (err) {
                resolve('error')
            }
            resolve(body)
        })
    })
}
