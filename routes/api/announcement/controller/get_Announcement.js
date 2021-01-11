const fetch = require('node-fetch');
const cheerio = require('cheerio');


module.exports = async function (req ,res) {
    let ePortfolioIndex = "https://system8.ntunhs.edu.tw/myNTUNHS_student/Modules/Main/Index_student.aspx";
    let ePortfolioRes = await fetch(ePortfolioIndex);
    let resText = await ePortfolioRes.text();
    let $ = cheerio.load(resText);
    let resultNews = [];
    $("#tableRssNews tr").each(function (index , element) {
        if (index != 0) {
            let news = $(element).find("a").text()
            let newsURL = $(element).find("a").attr('href');
            let spanTimeText = $(element).find("span").text();
            //console.log(spanTimeText);
            let time =spanTimeText.match(/\((.*?)\)/g)[0];
            let newsObj = {
                text : news , 
                url : newsURL ,
                time : time
            }
            resultNews.push(newsObj);
        }
    });

    let resultInfo = [];
    $("#tableRssInfo tr").each(function (index , element) {
        if (index != 0 ) {
            let time = $(element).find("td").eq(0).text();
            let infoA = $(element).find("td").eq(1).find("a");
            let info = infoA.text()
            let infoURL = infoA.attr('href');
            let infoObj = {
                text : info , 
                url : infoURL ,
                time : time
            }
            resultInfo.push(infoObj);
        }
    });
    res.send({
        news : resultNews ,
        info : resultInfo
    });
}