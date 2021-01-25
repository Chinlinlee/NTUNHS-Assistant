const request = require('request');
const nodefetch = require('node-fetch');
const tough = require('tough-cookie');

const {URLSearchParams} =require('url');
const myFunc = require('../../routes/My_Func');
module.exports.Auth = async function(username , password , obj ={})
{
    return new Promise (async (resolve)=>
    {
        let j  = myFunc.getJar(obj);
        const fetch = require('fetch-cookie')(nodefetch , j );
        const params = new URLSearchParams();
        params.append('txtid' , username);
        params.append('txtpwd' , password);
        params.append('select' , 'student');
        let fetchRes = await fetch('http://system8.ntunhs.edu.tw/myNTUNHS_student/Common/UserControls/loginModule.aspx?'+params , {
            method : "POST" 
        });
        let body = await fetchRes.text();
        obj.session.ntunhsApp = await j.getCookieString('http://system8.ntunhs.edu.tw');
        return resolve(body);
    });
}

module.exports.signOffAuth = async function(username , password , obj ="")
{
    return new Promise (async (resolve)=>
    {
        let j  = myFunc.getSignOffJar(obj);
        const fetch = require('fetch-cookie')(nodefetch , j );
        const params = new URLSearchParams();
        params.append('txtid' , username);
        params.append('txtpwd' , password);
        params.append('select' , 'student');
        let fetchRes = await fetch('http://system10.ntunhs.edu.tw/Workflow/Common/UserControls/loginModule.aspx?' + params , {
            method : "POST" 
        });
        let body = await fetchRes.text();
        obj.session.ntunhsSignOff = await j.getCookieString('http://system10.ntunhs.edu.tw');
        return resolve(body);
    });
}


module.exports.ilmsAuth = async function (username , password , obj = {}) {
    return new Promise (async (resolve)=>
    {
        let j  = myFunc.getILMSJar(obj);
        const fetch = require('fetch-cookie')(nodefetch , j );
        const params = new URLSearchParams();
        params.append('account' , username);
        params.append('password' , password);
        params.append('secCode' , 'na');
        params.append('stay' , 0);
        let fetchRes = await fetch('https://ilms.ntunhs.edu.tw/sys/lib/ajax/login_submit.php?' + params , {
            method : "POST" 
        });
        let body = await fetchRes.text();
        obj.session.ntunhsILMS = await j.getCookieString('https://ilms.ntunhs.edu.tw/');
        return resolve(body);
    });
}