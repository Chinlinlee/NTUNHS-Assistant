# NTUNHS-Assistant
北護助手

[手機版各頁面DEMO](https://hackmd.io/@a5566qq123/rkAIK72Jd)

[電腦版各頁面DEMO](https://hackmd.io/@a5566qq123/rk-822YJu)

[定時抓取及更新課程查詢資料 NTUNHS-CourseUpdate](https://github.com/Chinlinlee/NTUNHS-CourseUpdate)
## 初始化
```bash=
npm install
npm run initconfig #這個會創建config檔，請先設定
```

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
        "host" : "127.0.0.1" ,
        "timeout": 30000
    },
    MONGODB: {
        "host" : "127.0.0.1" , 
        "port" : 27017 , 
        "db" : "My_ntunhs" , 
        "ssl" : false ,
        "username" : "user" , 
        "password" : "password" , 
        "authDB" : "admin"
    }
};
```


## 建置與啟動
- 本地設定完畢後，如果要測試課程查詢可以跑下面這條
```bash=
npm run build #創建當學期課程查詢資料用
```
- 啟動
```bash=
node server.js
```
