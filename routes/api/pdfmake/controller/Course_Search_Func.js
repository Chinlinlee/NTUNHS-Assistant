function Get_ReData(Item, req) {
    var Columns = req.query.Columns;
    var Columns_Obj = [];
    for (var i = 0; i < Columns.length; i++) {
        var tempjson = JSON.parse(Columns[i]);
        if (tempjson.IsChecked == true) {
            Columns_Obj.push(tempjson);
        }
    }
    var title = [
        '學期',
        '系所名稱',
        '年級',
        '課程代碼(14碼)',
        '課程名稱',
        '授課老師',
        '上課人數/限制人數',
        '學分數',
        '課別',
        '地點',
        '星期',
        '節次',
        '備註',
        '教學計劃',
    ];
    var item_title = [
        'Sem',
        'Faculty_Name',
        'Grad',
        'Course_Id',
        'Course_Name',
        'Teacher',
        'Course_People,Limit_People',
        'Credits',
        'Course_Type',
        'Course_Place',
        'Course_Day',
        'Course_Time',
        'Course_Other',
        'Class_Plan',
    ];
    title = title.filter((value, index, arr) => {
        for (var i = 0; i < Columns_Obj.length; i++) {
            if (value == Columns_Obj[i].name) {
                return true;
            }
        }
        return false;
    });
    item_title = item_title.filter((value, index, arr) => {
        for (var i = 0; i < Columns_Obj.length; i++) {
            if (value == Columns_Obj[i].value) {
                return true;
            }
        }
        return false;
    });
    /*console.log(item_title);
    console.log(title);*/
    var Result = [];
    for (var i = 0; i < Item.length; i++) {
        var temp = [];
        for (var x = 0; x < title.length; x++) {
            if (title[x].split('/').length > 1) {
                temp[title[x]] =
                    Item[i].Course_People + '/' + Item[i].Limit_People;
            } else {
                temp[title[x]] = Item[i][item_title[x]];
            }
        }
        temp.length = title.length;
        Result.push(temp);
    }
    return Result;
}

module.exports.Get_ReData = Get_ReData;
