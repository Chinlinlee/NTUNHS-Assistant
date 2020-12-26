const request = require('request');
const fs = require('fs');
const Cryptjs = require('crypto-js')
const { getCourseSearch } = require("../../Course_Search/controller/get_Course_Search");
//獲取先前的查詢結果
module.exports.Get_Data = async function(req)
{
    var query = req.query.content;
    
    return new Promise (async (resolve)=>
    {
        return resolve(await getCourseSearch(JSON.parse(query)));
        request(
        {
            url : "https://www.chinstudio.icu/api/Course_Search" , 
            method : "GET" , 
            qs : JSON.parse(query) 
        } , function (err , response , body)
        {
            if (err)
            {
                console.log("err : " + err);
                return resolve("err:" + err);
            }
            return resolve(body);
        })
    });
}

//拿取標題
module.exports.Get_Columns =async function(data)
{
    return new Promise((resolve)=>
    {
        var columns = Object.keys(data).map(function(key) 
        {
            return key;
        });
        return resolve(columns);
    })
}

//拿取所有列
module.exports.Get_Rows = async function(data)
{
    var realrows = [];
    return new Promise((resolve)=>
    {
        Object.keys(data).map(function(key) 
        {
            var row = Object.keys(data[key]).map(function(key2)
            {
                if (!data[key][key2]) return "";
                return  data[key][key2].toString();
            });
            realrows.push(row);
        });
        resolve(realrows);
    });
}

module.exports.FileIsExist = async function (i_Name)
{
    return new Promise((resolve)=>
    {
        fs.exists(i_Name , function(Isexist)
        {
            return resolve(Isexist);
        })
    })
}

module.exports.CreateFileName = async function(path , i_extension)
{
    return new Promise(async (resolve)=>
    {
        var rndName = path +Cryptjs.lib.WordArray.random(32).toString() + i_extension;
        var Isexist = await this.FileIsExist(rndName);
        while(Isexist)
        {
            rndName =path +Cryptjs.lib.WordArray.random(32).toString()+ i_extension;
            Isexist = await this.FileIsExist(rndName);
        }
        return resolve(rndName);
    })
}
