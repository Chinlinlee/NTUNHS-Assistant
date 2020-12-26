const request = require("request");
const cheerio = require('cheerio');
const School_Auth = require('../../../../models/users/School_Auth.js');

module.exports =  async function (req ,res)
{
    var queryParams =req.body;
    Object.keys(queryParams).forEach(element => 
    {
        if (!queryParams[element])
        {
            delete queryParams[element];
        }    
    });
    if (queryParams['password'] != undefined)
    {
        var loginresult = await School_Auth.Auth(queryParams['username'] , queryParams['password']);
        if (loginresult.split('_').length < 2)
        {
            return res.redirect('/CTE_BOT?error=' + encodeURIComponent('Password_Error'));
        }
    }
    var headers = 
    {
        'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2490.80 Safari/537.36'
    };
    
    var _request = request.defaults({jar :true});
    var option_1 = 
    {
        url : "http://System1.ntunhs.edu.tw/intranetasp/evaMain/stLogin.asp?txtSTNO=" + queryParams['username'],
        method : "GET" ,
        followAllRedirects : true , 
        headers : headers
    };
    
    await Request_func(_request , option_1);
    var headers2 = 
    {
        'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2490.80 Safari/537.36'
        ,'referer' : "http://system1.ntunhs.edu.tw/intranetasp/evaMain/stEval.asp"
    };
    var option_2 = 
    {
        url : "http://system1.ntunhs.edu.tw/intranetasp/evaMain/stDeal.asp", 
        method : "GET" , 
        followAllRedirects : true ,
        headers : headers2
    };
    var Deal_Table =await Request_func(_request , option_2);
    $ = cheerio.load(Deal_Table);
    var links = $('a[href]');
    var Class_links = [];
    $(links).each((index  , element)=>
    {
        Class_links.push($(element).attr('href'));
    });
    for (var i = 0 ; i < Class_links.length ; i++)
    {
        var headers3 = 
        { 
            'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2490.80 Safari/537.36'
        };
        var option_3 = 
        {
            url : "http://system1.ntunhs.edu.tw/intranetasp/evaMain/" + Class_links[i]
            ,
            method : "GET" , 
            followAllRedirects :true , 
            headers : headers3
        };
        await Request_func(_request , option_3);
        var headers4 ={
            'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2490.80 Safari/537.36'
            ,'referer' : "http://system1.ntunhs.edu.tw/intranetasp/evaMain/" + Class_links[i],'Content-Type': 'application/x-www-form-urlencoded'};
        var option_4 =
        {
        url : "http://system1.ntunhs.edu.tw/intranetasp/evaMain/stEditCdo.asp"  , 
        method : "POST" , 
        followAllRedirects : true , 
        headers : headers4 , 
        body : "rb1=" + queryParams['Q_1']+"&rb2=" + queryParams['Q_2']+"&rb3=" + queryParams['Q_3'] + "&rb4=" + queryParams['Q_4'] + "&rb5=" + queryParams['Q_5'] + "&rb6=" + queryParams['Q_6'] + "&rb7=" + queryParams['Q_7'] + "&rb8=" + queryParams['Q_8'] + "&rb9=" + queryParams['Q_9'] + "&rb10=" + queryParams['Q_10'] + "&rbA=" + queryParams['Q_11'] + "&rbB=" + queryParams['Q_12'] + "&OPN_REM="
        };
        var Final_Result  =await Request_func(_request , option_4);
        if (Final_Result == 'error')
        {
            return res.redirect('/CTE_BOT?error=' + encodeURIComponent('System_Error'));
            
        }
    }
    return res.redirect('/CTE_BOT?error=' + encodeURIComponent('Success'));
        
}

//call by sharing
async function Request_func(req_obj  , i_option)
{
    return new Promise ((resolve)=>
    {
        req_obj(i_option , function (err,  response , body)
        {
            if (err) 
            {
                resolve('error');
            }
            resolve(body);
        });
    });
}


