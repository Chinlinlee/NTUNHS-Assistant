
const MongoClient = require('mongodb').MongoClient;
const config = require('../../config/config');

async function MongoExe() {
    let username = config.MONGODB.username || "";
    let password = config.MONGODB.password || "";
    let at = (username || password) ? "@" : "";
    let connection = await MongoClient.connect(`mongodb://${username}:${password}${at}${config.MONGODB.host}:${config.MONGODB.port}/${config.MONGODB.db}?ssl=${config.MONGODB.ssl}&authSource=${config.MONGODB.authDB}`, {
        useNewUrlParser: true, useUnifiedTopology: true,
        poolSize: 100, 'auto_reconnect': true
    });
    return Promise.resolve(connection);
}
module.exports.MongoExe = MongoExe;
//mongo獲取資料
module.exports.Getdata = async function (i_collection, i_query) {
    const conn = await MongoExe();
    var mypromise = () => {
        return new Promise(async (resolve, reject) => {
            conn.db('My_ntunhs').collection(i_collection, async function (err, o_collection) {
                var itemarray = [];
                await o_collection.find(i_query).forEach(function (item) {
                    if (err) reject("fail");
                    itemarray.push(item);

                });
                resolve(itemarray);
            });
        });
    };
    var result = await mypromise();
    if (result == "fail") {
        return Promise.reject("fail")
    }
    await conn.close();
    return Promise.resolve(result);
};

//mongo插入多筆資料(未用到)
module.exports.InsertManydata = async function (i_collection, i_data) {
    const conn = await MongoExe();
    var result = "";
    conn.db('My_ntunhs').collection(i_collection, function (err, o_collection) {
        if (err) return result = err;
        o_collection.insertMany(i_data ,  {ordered: false}, function (err, res) {
            if (err) return result = err;
            console.log("insert success :" + res.insertedCount);
            return result = "success";
        });
    });
    await conn.close();
    return result;
};

//mongo插入資料
module.exports.Insertdata = async function (i_collection, i_data) {
    const conn = await MongoExe();
    var result = "";

    var mypromise = () => {
        return new Promise(async (resolve, reject) => {
            conn.db('My_ntunhs').collection(i_collection, async function (err, o_collection) {
                if (err) reject("fail");
                o_collection.insertOne(i_data);

                resolve("success");
            });
        });
    };
    result = await mypromise();
    if (result == "fail") {
        return Promise.reject("fail")
    }
    console.log("insert success");
    await conn.close();
    return Promise.resolve(result);
};

//mongo更新資料
module.exports.Updatedata = async function (i_collection, i_query, i_updatedata) {
    const conn = await MongoExe();
    var result = "";
    var mypromise = () => {
        return new Promise(async (resolve, reject) => {
            conn.db('My_ntunhs').collection(i_collection, async function (err, o_collection) {
                if (err) reject("fail");
                o_collection.updateOne(i_query, i_updatedata, async function (err, res) {
                    if (err) reject("fail");
                    resolve("success");
                });
            });
        });
    };
    result = await mypromise();
    if (result == "fail") {
        return Promise.reject("fail")
    }
    console.log("Update success");
    await conn.close();
    return Promise.resolve(result);
};
