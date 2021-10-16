const request = require('request');
const cheerio = require('cheerio');
const iconv = require('iconv-lite');

module.exports =async function (req , res)
{
    var _request = request.defaults({jar :true});
    var headers = 
    {
        'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2490.80 Safari/537.36'
    };
    var option_1 = 
    {
        url : "http://System8.ntunhs.edu.tw/intranetasp/evaMain/stLogin.asp",
        method : "GET" ,
        followAllRedirects : true , 
        headers : headers ,
        gzip:true , 
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
        "Accept-Encoding": "gzip, deflate",
        "Accept-Language": "zh-TW,zh;q=0.9,en-US;q=0.8,en;q=0.7" , 
        encoding: null
    };
    
    var result = await Request_func(_request , option_1);
    var decode_res = iconv.decode(result , 'BIG5');
    if (decode_res.includes('非'))
    {
        return res.send("非填寫時間");
    }
    else
    {
        return res.send("可填寫");
    }
}

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