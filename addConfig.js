const fs  = require('fs');
const mkdirp = require('mkdirp');

function main () {
    mkdirp.sync('./config');
    let mainConfig = 
`
module.exports =
{
    HTTPServer:
    {
        "viewsRoot": "./views",
        "httpPort": 30087,
        "host" : "127.0.0.1" ,
        "timeout": 30000,
        "isProduction" : false
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
`
    fs.writeFileSync('./config/config.js' , mainConfig);
    console.log(`創建./config/config.js成功`);

    
    let NTUNHSConfig = `
module.exports  = {
    stuNum : "入口網帳號" , 
    stuPwd : "入口網密碼"
}
    `
    fs.writeFileSync('./models/NTUNHS/config.js' , NTUNHSConfig);
    console.log("創建./models/NTUNHS/config.js成功");
}
main();