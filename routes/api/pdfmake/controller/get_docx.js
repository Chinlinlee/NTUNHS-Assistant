const docx = require('docx');
const {Document ,Packer , Paragraph , VerticalAlign ,Hyperlink} = docx;
const fs = require('fs');
const My_Course_Search_Func = require('./Course_Search_Func.js');
const Cryptjs = require('crypto-js');
const pdfmake_func = require('./pdfmake_func.js');

module.exports = async function(req, res)
{
    var data = await pdfmake_func.Get_Data(req);
    if (data.includes('err'))
    {
        res.status(500).send('Error:' + data);
        return ;
    }
   /* else
    {
        data = JSON.parse(data);
    }*/
    var Redata = My_Course_Search_Func.Get_ReData(data[0] ,req);
    var columns = await pdfmake_func.Get_Columns(Redata[0]);
    var realrows = await pdfmake_func.Get_Rows(Redata);
    const doc = new Document();
    doc.Document.Body.sections[0].root[0].root[0].root.width= 2127 * columns.length;
    const table = doc.createTable(realrows.length,columns.length);
    for (var i = 0; i < columns.length ; i++)
    {
        table.getCell(0,i).addContent(new Paragraph(columns[i]));
    }
    for (var i = 1 ; i < realrows.length ; i ++)
    {
        for (var j = 0 ; j < columns.length  ; j++)
        {
            table.getCell(i,j).verticalAlign = VerticalAlign.CENTER;
            if (columns[j].includes('http://'))  //j == columns.length -1
            {
                var par = new Paragraph();
                var hyperlink = new Hyperlink("點我下載" , i);
                hyperlink.root[0].root.id = "rId" + (i + doc.DocumentRelationships.RelationshipCount);
                doc.docRelationships.createRelationship((i +doc.DocumentRelationships.RelationshipCount) , "http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink" , realrows[i][j] , "External");
                par.addHyperLink(hyperlink);
                table.getCell(i, j).addContent(par);
            }
            else
            {
                table.getCell(i, j).addContent(new Paragraph(realrows[i][j]));
            }
            
        }
    }
    const packer = new Packer();
    packer.toBuffer(doc).then(async (buffer)=>
    {
        var rndName = await pdfmake_func.CreateFileName(process.cwd()  + "/docx/",".docx");
        var filename =  rndName ; 
        fs.writeFileSync(filename , buffer);
        if (req.query.IsLine == "true")
        {
            var file = filename.split('/');
            res.send('1081New_Project/nodejs_mongo/myExpressApp/' + file[file.length-2] + '/' + file[file.length-1]);
        }
        else
        {
            res.setHeader('Content-Disposition', 'attachment; filename=file.docx');
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
            res.download(filename , function(err)
            {
                if (err) console.log(err);
            });
        }
    })

}