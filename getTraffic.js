const fs = require('fs')
const path = require('path')
const moment = require('moment-timezone')
const _ = require('lodash')
const schedule = require('node-schedule')
const { MongoExe } = require('./models/common/data')
const config = require('./config/config')

function getTrafic() {
    let traficLog = fs.readFileSync(path.join(__dirname, 'default.log'), {
        encoding: 'utf-8',
    })
    traficLog = traficLog.replace(/ UTC -> IsLoggedIn:true /gim, '')
    let lines = traficLog.split('\r\n')

    let items = []
    for (line of lines) {
        let [date, time, account] = line.split(' ')
        date = date.replace(',', '')
        let obj = {
            datetime: `${date} ${time}`,
            account: account,
        }
        items.push(obj)
    }
    let hitItem = items.filter((v) => {
        if (v.account == 'UTC') return false
        try {
            let taipeiTime = moment
                .utc(v.datetime, 'YYYY.MM.DD HH:mm:ss.SSSS')
                .tz('Asia/Taipei')
            let isoFormatTime = moment(taipeiTime, 'YYYY.MM.DD').format(
                'YYYY-MM-DD'
            )
            let dateNow = moment(new Date()).format('YYYY-MM-DD')
            return moment(isoFormatTime, 'YYYY-MM-DD').isSameOrAfter(dateNow)
        } catch (e) {
            console.log(v.datetime)
            return false
        }
    })

    hitItem = _.uniqBy(hitItem, 'account')
    ;(async () => {
        try {
            const mongoConn = await MongoExe()
            await mongoConn
                .db(config.MONGODB.db)
                .collection('loginLog')
                .findOneAndUpdate(
                    { id: moment(new Date()).format('YYYY-MM-DD') },
                    {
                        $set: {
                            num: hitItem.length,
                            refreshTime: new Date(),
                        },
                    },
                    {
                        upsert: true,
                    }
                )
            console.log('today trafic log finished')
        } catch (e) {
            console.error(e)
            process.exit(1)
        }
    })()
    console.log('login stu: ', hitItem)
    console.log(moment(new Date()).format('YYYY-MM-DD'), ':', hitItem.length)
}

schedule.scheduleJob('0 58 23 * * *', function () {
    getTrafic()
})
getTrafic()
