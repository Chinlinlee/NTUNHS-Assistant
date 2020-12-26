<div>
    <h1>NTUNHS-Assistant</h1>
北護助手
</div>

## configure
`models/NTUNHS/config.js` 此設定檔用於登入北護入口網更新教學計畫用
```javascript
module.exports  = {
    stuNum : "入口網帳號" , 
    stuPwd : "入口網密碼"
}
```
`config/config.js` 此設定檔用於設定Server的相關設定

```javascipt
module.exports =
{
    HTTPServer:
    {
        "viewsRoot": "./views",
        "httpPort": 30087,
        "httpsPort": 7878, //這個應該沒用
        "host" : "127.0.0.1" ,
        "timeout": 30000
    },
    MONGODB: {
        "host" : "127.0.0.1" , 
        "port" : 27017 , 
        "db" : "dbName" , 
        "ssl" : false ,
        "username" : "user" , 
        "password" : "password" , 
        "authDB" : "admin"
    }
};
```
