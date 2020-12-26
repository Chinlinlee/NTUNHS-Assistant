const pdfmake_func = require('./pdfmake_func.js');
const My_Course_Search_Func = require('./Course_Search_Func.js');
const fs = require('fs');
const XLSX = require('xlsx');

module.exports = async function(req ,res)
{
    var data = await pdfmake_func.Get_Data(req);
    if (data.includes('err'))
    {
        res.status(500).send('Error:' + data);
        return ;
    }
    /*else
    {
        data = JSON.parse(data);
    }*/
    var Redata = My_Course_Search_Func.Get_ReData(data[0] ,req);
    var columns = await pdfmake_func.Get_Columns(Redata[0]);
    var realrows = await pdfmake_func.Get_Rows(Redata);
    var O_Header = [];
    var output = {};
    for (var i = 0 ; i < columns.length ; i++)
    {
        O_Header.push(String.fromCharCode(65 + i));
    }
    for (var i = 0 ; i < columns.length ; i++)
    {
        output[O_Header[i] +'1'] = {v: columns[i] , s:{Alignment: {
            horizontal: 'center',
            vertical : 'center'
          }}};
    }
    for (var i = 0 ; i < realrows.length ; i++)
    {
        for (var j = 0;  j < columns.length ; j++)
        {
            if (realrows[i][j].includes('http'))
            {
                output[O_Header[j] +(i+2)] ={v:"點我下載" , l:{ Target :realrows[i][j], Tooltip  :"嘿嘿 教學計畫" }} ; 
            }
            else
            {
                output[O_Header[j] +(i+2)] = {v: realrows[i][j]};
            }
           /* output[O_Header[j] +(i+2)] = (j!= columns.length-1)?{v: realrows[i][j]}:{v:"點我下載" , l:{ Target :realrows[i][j], Tooltip  :"嘿嘿 教學計畫" }} ;  */  
        }
    }
    var poskey = Object.keys(output);
    var pos = poskey[0] + ":" + poskey[poskey.length-1];
    var Each_Width = await Get_Each_Maxlength(columns ,realrows);
    var sheetopt = 
    {
        'mySheet' : Object.assign({} , output , {'!ref' : pos} , {'!cols':Each_Width})
    };
    var wb = {SheetNames :['mySheet'] , Sheets:sheetopt};
    var rndName = await pdfmake_func.CreateFileName(process.cwd()  + "/xlsx/",".xlsx");
    var filename = rndName ; 
    XLSX.writeFile(wb , filename);
    if (req.query.IsLine == "true")
    {
        var file = filename.split('/');
        res.send('1081New_Project/nodejs_mongo/myExpressApp/' + file[file.length-2] + '/' + file[file.length-1]);
    }
    else
    {
        res.setHeader('Content-Disposition', 'attachment; filename=file.xlsx');
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.download(filename , function(err)
        {
            if (err) console.log(err);
        });
    }
}

async function Get_Each_Maxlength(cols , rows)
{
    var Eachlength = new Array(cols.length);
    Eachlength.fill(-1);
    var result = new Array(cols.length);
    var re = /^[a-zA-Z0-9]/;
    return new Promise((resolve)=>
    {
        for (var c=  0; c < cols.length ; c++)
        {
            for (var r = 0 ; r <rows.length ;r++)
            {
                if (rows[r][c].length > Eachlength[c])
                {
                    var test = re[Symbol.match](rows[r][c]);
                    Eachlength[c] = rows[r][c].length;
                    result[c] = (test!=null)?{wch : Eachlength[c]+2} : {wch : Eachlength[c]+20};
                }
            }
        }
        result[result.length-1].wch = 15;
        return resolve(result);
    });
}