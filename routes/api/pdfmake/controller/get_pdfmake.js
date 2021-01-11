
const pdfMakePrinter = require('pdfmake');
const My_Course_Search_Func = require('./Course_Search_Func.js');
const fs = require('fs');
const pdfmake_func = require('./pdfmake_func.js');
const { getData } = require('./get_storeData');

module.exports = async function (req ,res)
{
    let data;
    if (req.query.IsPreSchedule == "true") {
        data = getData(req);
        data = [data];
    } else {
        data = await pdfmake_func.Get_Data(req);
        if (data.includes('err'))
        {
            res.status(500).send('Error:' + data);
            return ;
        }
    }
    
   /* else
    {
        data = JSON.parse(data);
    }*/
    var Redata = My_Course_Search_Func.Get_ReData(data[0] , req);
    var columns = await pdfmake_func.Get_Columns(Redata[0]);
    var realrows = [];
    realrows.push(columns);
    var rows = await pdfmake_func.Get_Rows(Redata);
    realrows = realrows.concat(rows);
    realrows.forEach((item , index)=>
    {
        item.forEach((item2 , index2)=>
        {
            if (item2.includes('http'))
            {
                item[index2] = {text : '點我下載' , link : item2 , color:'red'};
            }
        })
      /*item[13] = index==0 ? {text:'教學計劃'}:{text : '點我下載' , link : item[13] , color:'red'};*/
    });
    var widths = [];
    for (var  i  = 0 ; i < columns.length ; i++)
    {
        widths.push('auto');
    }  
    var docDefinition = 
    {
        content: [
            {
            layout: 'lightHorizontalLines', // optional
            table: {
                headerRows : 1,
                widths: widths,
                body: realrows
            }
            }
        ],
        defaultStyle: {
            font: 'kaiu'
        },
        pageSize: 'A2'
    };
    await createPdfBinary(docDefinition , function(binary)
    {
        
        if (req.query.IsLine == "true")
        {
            var file = binary.split('/');
            res.send('1081New_Project/nodejs_mongo/myExpressApp/' + file[file.length-2] + '/' + file[file.length-1]);
        }
        else
        {
            res.setHeader('Content-Disposition', 'attachment; filename=quote.pdf');
            res.setHeader('Content-Type', 'application/pdf');
            res.download(binary , function(err)
            {
                if (err) console.log(err);
            });
        }
    },function(err)
    {
        res.send('Error:' + err);
    });
}
async function createPdfBinary(pdfdoc , callback)
{
    var font = 
    {
        Roboto :
        {
            normal : "../../../../views/externals/pdfmake-master/examples/fonts/Roboto-Regular.ttf",
            bold : "../../../../views/externals/pdfmake-master/examples/fonts/Roboto-Medium.ttf",
            italics : "../../../../views/externals/pdfmake-master/examples/fonts/Roboto-Italic.ttf",
            bolditalics : "../../../views/externals/pdfmake-master/examples/fonts/Roboto-MediumItalic.ttf"
        },
        kaiu:
        {
            normal :"./views/externals/pdfmake-master/examples/fonts/kaiu.ttf",
            bold : "./views/externals/pdfmake-master/examples/fonts/kaiu.ttf",
            italics : "./views/externals/pdfmake-master/examples/fonts/kaiu.ttf",
            bolditalics : "./views/externals/pdfmake-master/examples/fonts/kaiu.ttf"            
        }
    };
    var printer  =new pdfMakePrinter(font);
    var doc = await printer.createPdfKitDocument(pdfdoc);
    var waitfs;
    var rndName = await pdfmake_func.CreateFileName(process.cwd()  + "/pdf/",".pdf");
    var filename = rndName ; 
    doc.pipe(waitfs = fs.createWriteStream(filename) , { encoding:'utf16' });
    doc.end();
    waitfs.on('finish' , async function()
    {
        callback(filename);
    });
}