//顯示下拉式選單
function showCheckboxes(checkboxes_id) {
    var checkboxes = document.getElementById(checkboxes_id)
    if (checkboxes.style.display == 'block') {
        checkboxes.style.display = 'none'
    } else {
        checkboxes.style.display = 'block'
    }
}

//利用liff openwindow打開
function DownloadFileInLine(url, external) {
    $(function () {
        liff.init(function (data) {
            liff.openWindow({
                url: url,
                external: external,
            })
        })
    })
}
function FoldRegion(id, btn_id, name) {
    if ($(id).is(':visible')) {
        $(id).hide()
        $(btn_id).text('⤓⤓⤓⤓⤓⤓⤓⤓' + name + '(點我顯示)' + '⤓⤓⤓⤓⤓⤓⤓⤓')
    } else {
        $(id).show()
        $(btn_id).text('⤒⤒⤒⤒⤒⤒⤒⤒' + name + '(點我隱藏)' + '⤒⤒⤒⤒⤒⤒⤒⤒')
    }
}
var CSApp = angular.module('CSApp', ['ui.bootstrap', 'commonApp'])
CSApp.controller('CSCtrl', function ($scope, CSService, commonService) {
    commonFunc.blockUI()
    angular.element(document).ready(function () {
        $.unblockUI()
    })

    $scope.IsLine = false
    var gAgent = navigator.userAgent
    if (gAgent.toLowerCase().indexOf('line') != -1) {
        $scope.IsLine = true
    }

    $scope.DataList = [] //查到的課程資料
    $scope.DataListSize = 0
    $scope.Teacher_list = [] //所有老師資料
    $scope.Place_list = [] //所有教室資料
    $scope.OpenResultItem = {} //點擊開啟查詢到的課程
    //#region Autocomplete 提示字清單
    $scope.Place_Filter_list = []
    $scope.Teacher_Filter_list = []
    //#endregion
    $scope.PreScheduleList = [] //預排課表清單
    $scope.PreScheduleSize = 0
    $scope.PreScheduleTable = [] //模擬課表
    $scope.PreScheduleQueryDataList = [] //點擊模擬課表表格查詢到的資料
    $scope.PreScheduleQueryStaticDataList = []
    $scope.Currentuser = ''
    $scope.Course_Name = ''
    $scope.preModalQ = ''
    $scope.IsRootPart = false
    $scope.IsCityPart = false
    //#region 是否全選
    $scope.Edu_Type_All = false
    $scope.Faculty_All = false
    $scope.Grades_All = false
    $scope.CourseTypes_All = false
    $scope.Days_All = false
    $scope.Times_All = false
    $scope.Category_All = false
    $scope.Columns_All = true
    $scope.Sem_All = false
    //#endregion
    $scope.testInclude = false

    $scope.curPage = 1 //table起始頁數
    $scope.numPerPage = 10 //table每頁顯示資料
    $scope.curPreModalPage = 1
    $scope.numPerPagePreModal = 10
    //#region Item 查詢條件
    commonService.user.getStuInfo().then(function (res) {
        $scope.Currentuser = res.data
    })
    $scope.Iteminit = function () {
        $scope.EduType = [
            {
                id: 'cblNewEduType_0',
                value: '二年',
                name: '二技',
                IsChecked: false,
            },
            {
                id: 'cblNewEduType_1',
                value: '進修',
                name: '二技(三年)',
                IsChecked: false,
            },
            {
                id: 'cblNewEduType_2',
                value: '四年',
                name: '四技',
                IsChecked: false,
            },
            {
                id: 'cblNewEduType_7',
                value: '學士後',
                name: '學士後系',
                IsChecked: false,
            },
            {
                id: 'cblNewEduType_4',
                value: '碩士',
                name: '碩士班',
                IsChecked: false,
            },
            {
                id: 'cblNewEduType_5',
                value: '博士',
                name: '博士班',
                IsChecked: false,
            },
        ]
        $scope.Faculty = [
            {
                name: '護理系',
                edutype: '二年,進修,四年,碩士,博士,學士後',
                IsChecked: false,
                IsShow: true,
            },
            {
                name: '高齡健康照護系',
                edutype: '四年',
                IsChecked: false,
                IsShow: true,
            },
            {
                name: '護理助產及婦女健康系',
                edutype: '二年,碩士',
                IsChecked: false,
                IsShow: true,
            },
            {
                name: '醫護教育暨數位學習系',
                edutype: '二年,碩士',
                IsChecked: false,
                IsShow: true,
            },
            {
                name: '中西醫結合護理研究所',
                edutype: '碩士',
                IsChecked: false,
                IsShow: true,
            },
            {
                name: '健康事業管理系',
                edutype: '二年,進修,四年,碩士',
                IsChecked: false,
                IsShow: true,
            },
            {
                name: '資訊管理系',
                edutype: '四年,碩士',
                IsChecked: false,
                IsShow: true,
            },
            {
                name: '休閒產業與健康促進系',
                edutype: '四年,碩士',
                IsChecked: false,
                IsShow: true,
            },
            {
                name: '長期照護系',
                edutype: '二年,碩士',
                IsChecked: false,
                IsShow: true,
            },
            {
                name: '語言治療與聽力學系',
                edutype: '四年,碩士',
                IsChecked: false,
                IsShow: true,
            },
            {
                name: '嬰幼兒保育系',
                edutype: '二年,四年,碩士',
                IsChecked: false,
                IsShow: true,
            },
            {
                name: '運動保健系',
                edutype: '四年,碩士',
                IsChecked: false,
                IsShow: true,
            },
            {
                name: '生死與健康心理諮商系',
                edutype: '四年,碩士',
                IsChecked: false,
                IsShow: true,
            },
        ]
        $scope.Grades = [
            { name: '1年級', value: 1, IsChecked: false },
            { name: '2年級', value: 2, IsChecked: false },
            { name: '3年級', value: 3, IsChecked: false },
            { name: '4年級', value: 4, IsChecked: false },
        ]
        $scope.CourseTypes = [
            { name: '通識必修(通識)', value: '通識必修', IsChecked: false },
            { name: '通識選修(通識)', value: '通識選修', IsChecked: false },
            { name: '專業必修(系所)', value: '專業必修', IsChecked: false },
            { name: '專業選修(系所)', value: '專業選修', IsChecked: false },
        ]
        $scope.Days = [
            { name: '星期一', value: 1, IsChecked: false },
            { name: '星期二', value: 2, IsChecked: false },
            { name: '星期三', value: 3, IsChecked: false },
            { name: '星期四', value: 4, IsChecked: false },
            { name: '星期五', value: 5, IsChecked: false },
            { name: '星期六', value: 6, IsChecked: false },
            { name: '星期日', value: 7, IsChecked: false },
        ]
        $scope.Times = [
            { name: '節次1(08:10~09:00)', value: 1, IsChecked: false },
            { name: '節次2(09:10~10:00)', value: 2, IsChecked: false },
            { name: '節次3(10:10~11:00)', value: 3, IsChecked: false },
            { name: '節次4(11:10~12:00)', value: 4, IsChecked: false },
            { name: '節次5(12:40~13:30)', value: 5, IsChecked: false },
            { name: '節次6(13:40~14:30)', value: 6, IsChecked: false },
            { name: '節次7(14:40~15:30)', value: 7, IsChecked: false },
            { name: '節次8(15:40~16:30)', value: 8, IsChecked: false },
            { name: '節次9(16:40~17:30)', value: 9, IsChecked: false },
            { name: '節次10(17:40~18:30)', value: 10, IsChecked: false },
            { name: '節次11(18:35~19:25)', value: 11, IsChecked: false },
            { name: '節次12(19:30~20:20)', value: 12, IsChecked: false },
            { name: '節次13(20:25~21:15)', value: 13, IsChecked: false },
            { name: '節次14(21:20~22:10)', value: 14, IsChecked: false },
        ]
        $scope.Category = [
            { name: '跨校', value: 1, IsChecked: false },
            { name: '跨域課程', value: 2, IsChecked: false },
            { name: '全英語授課', value: 3, IsChecked: false },
            { name: '同步遠距教學', value: 4, IsChecked: false },
            { name: '非同步遠距教學', value: 5, IsChecked: false },
        ]
        $scope.Columns = [
            { name: '學期', IsChecked: true, value: 'Sem' },
            { name: '系所名稱', IsChecked: true, value: 'Faculty_Name' },
            { name: '年級', IsChecked: true, value: 'Grad' },
            { name: '課程代碼(14碼)', IsChecked: true, value: 'Course_Id' },
            { name: '上課班組', IsChecked: true, value: 'Course_Class' },
            { name: '課程名稱', IsChecked: true, value: 'Course_Name' },
            { name: '授課老師', IsChecked: true, value: 'Teacher' },
            {
                name: '上課人數/限制人數',
                IsChecked: true,
                value: 'Course_People,Limit_People',
            },
            { name: '學分數', IsChecked: true, value: 'Credits' },
            { name: '課別', IsChecked: true, value: 'Course_Type' },
            { name: '地點', IsChecked: true, value: 'Course_Place' },
            { name: '星期', IsChecked: true, value: 'Course_Day' },
            { name: '節次', IsChecked: true, value: 'Course_Time' },
            { name: '備註', IsChecked: true, value: 'Course_Other' },
            { name: '教學計劃', IsChecked: true, value: 'Class_Plan' },
        ]
        $scope.Sem = []

        CSService.Get_Sem().then((res) => {
            if (!res.data) {
                alert('error')
            }
            res.data = res.data.sort(function (a, b) {
                return b - a
            })
            let oneOrSecondStr = ['學年度上學期', '學年度下學期']
            for (let i = 0; i < res.data.length; i++) {
                let sem = res.data[i]
                let oneOrSecond = Number(sem.charAt(sem.length - 1))
                let nowSem = sem.substring(0, sem.length - 1)
                let semObj = {
                    name: `${nowSem}${oneOrSecondStr[oneOrSecond - 1]}`,
                    IsChecked: i == 0 ? true : false,
                    value: sem,
                }
                $scope.Sem.push(semObj)
                if (i == 0) {
                    $('#Sem').text(
                        `${nowSem}${oneOrSecondStr[oneOrSecond - 1]}`
                    )
                }
            }
            $scope.onCheckChange('Sem', 'value', '學期')
        })
    }

    $scope.Iteminit()

    $scope.userinfo = { faculty: '', system: '' }

    //#endregion

    //#region item objectarray
    //以object存取all Item ,Checked Item value , Is select all ,Checked Item name 方便使用function
    $scope.ItemObjinit = function () {
        $scope.Checkboxes = {}
        $scope.Checkboxes['EduType'] = {
            Checked_list: [],
            All_Select: $scope.Edu_Type_All,
            Item_list: $scope.EduType,
            Checked_name: [],
        }
        $scope.Checkboxes['Faculty'] = {
            Checked_list: [],
            All_Select: $scope.Faculty_All,
            Item_list: $scope.Faculty,
            Checked_name: [],
        }
        $scope.Checkboxes['Grades'] = {
            Checked_list: [],
            All_Select: $scope.Grades_All,
            Item_list: $scope.Grades,
            Checked_name: [],
        }
        $scope.Checkboxes['CourseTypes'] = {
            Checked_list: [],
            All_Select: $scope.CourseTypes_All,
            Item_list: $scope.CourseTypes,
            Checked_name: [],
        }
        $scope.Checkboxes['Days'] = {
            Checked_list: [],
            All_Select: $scope.Days_All,
            Item_list: $scope.Days,
            Checked_name: [],
        }
        $scope.Checkboxes['Times'] = {
            Checked_list: [],
            All_Select: $scope.Times_All,
            Item_list: $scope.Times,
            Checked_name: [],
        }
        $scope.Checkboxes['Category'] = {
            Checked_list: [],
            All_Select: $scope.Category_All,
            Item_list: $scope.Category,
            Checked_name: [],
        }
        $scope.Checkboxes['Columns'] = {
            Checked_list: [],
            All_Select: $scope.Columns_All,
            Item_list: $scope.Columns,
            Checked_name: [],
        }
        $scope.Checkboxes['Sem'] = {
            Checked_list: [],
            All_Select: $scope.Sem_All,
            Item_list: $scope.Sem,
            Checked_name: [],
        }
    }

    $scope.ItemObjinit()
    //#endregion
    $scope.pdfquery
    $scope.Ch_days = ['一', '二', '三', '四', '五', '六', '日']

    var days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    var S_Time = new Array(
        '08:10~09:00',
        '09:10~10:00',
        '10:10~11:00',
        '11:10~12:00',
        '12:40~13:30',
        '13:40~14:30',
        '14:40~15:30',
        '15:40~16:30',
        '16:40~17:30',
        '17:40~18:30',
        '18:35~19:25',
        '19:30~20:20',
        '20:25~21:15',
        '21:20~22:10'
    )
    //initial 模擬課表
    for (var i = 0; i < 14; i++) {
        var temparr = {}
        temparr['Period'] = i + 1
        temparr['Time'] = S_Time[i]

        for (var j = 0; j < 7; j++) {
            temparr[days[j]] = ''
            temparr[days[j] + 'isClickedSearch'] = false
        }
        $scope.PreScheduleTable.push(temparr)
    }
    //initial 是否登入過

    //登入過拿取資訊
    CSService.Get_UserInf().then((u_res) => {
        $scope.userinfo.faculty = u_res.data.faculty
        $scope.userinfo.system = u_res.system
    })
    //initial 獲取所有教室
    CSService.Get_Place($scope).then((res) => {
        $scope.Place_list = res.data
    })
    //initial 獲取所有老師
    CSService.Get_Teacher($scope).then((res) => {
        $scope.Teacher_list = res.data
    })
    //initial 把顯示欄位都先全選 丟到物件的Checked_list
    $scope.init = function () {
        $scope.CheckUnCheckItem('Columns', 'name', '顯示欄位')
    }
    $scope.blockUI = function () {
        $.blockUI({
            message:
                "<i class='fa fa-spinner fa-pulse orange' style='font-size:600%'></i>",
            //borderWidth:'0px' 和透明背景
            css: { borderWidth: '0px', backgroundColor: 'transparent' },
        })
    }
    //#region 查詢
    $scope.Query = function () {
        window.NTUNHS.last_focused = ''
        $('.checkboxes').hide()
        if ($scope.Checkboxes['Sem'].Checked_list.length == 0) {
            alert('學期不得為空')
            return
        }
        $scope.blockUI()
        $('#ModalCenter_Condition').modal('hide')
        CSService.Get_data($scope).then(function (res) {
            if (res.data == null) {
                $scope.DataListSize = 0
                $scope.DataList = []
            } else {
                $scope.DataList = res.data[0]
                $scope.DataListSize = $scope.DataList.length
                $scope.pdfquery = res.data[1]
            }
            $.unblockUI()
            $scope.$apply()
            $scope.curPage = 1
        })
    }
    //#endregion
    $scope.QueryWithPreSchedule = function (time, day) {
        window.NTUNHS.last_focused = ''
        if ($scope.Checkboxes['Sem'].Checked_list.length == 0) {
            alert('學期不得為空')
            return
        }
        //$scope.blockUI();
    }

    //#region 只顯示可選課程
    $scope.OnlyIcan = function () {
        $scope.blockUI()
        CSService.Get_OnlyIcan($scope).then(function (res) {
            if (res.data == null) {
                $scope.DataListSize = 0
                $scope.DataList = []
            } else {
                $scope.DataList = res.data[0]
                $scope.DataListSize = $scope.DataList.length
                $scope.pdfquery = res.data[1]
            }
            $.unblockUI()
        })
    }
    //#endregion
    //#region Checkbox相關功能 ***https://www.freakyjolly.com/check-all-uncheck-all-checkbox-list-in-angular-io-version-2/
    //選取改變時 如果全都選了 將All_Select 改為true 讓select all選起來
    //最後將選取的丟到checkedlist
    $scope.onCheckChange = function (name, value, from) {
        $scope.Checkboxes[name].All_Select = $scope.Checkboxes[
            name
        ].Item_list.every(function (item) {
            return item.IsChecked == true
        })
        $scope.Get_Item(name, value, from)
    }

    //當選取select all時 ngmodel的All_Select為true
    //最後將選取的丟到checkedlist
    $scope.CheckUnCheckItem = function (name, value, from) {
        for (var key in $scope.Checkboxes[name].Item_list) {
            $scope.Checkboxes[name].Item_list[key].IsChecked =
                $scope.Checkboxes[name].All_Select
        }
        $scope.Get_Item(name, value, from)
    }
    //將選取的Item丟到CheckedList
    $scope.Get_Item = function (name, value, from) {
        $scope.Checkboxes[name].Checked_name = []
        $scope.Checkboxes[name].Checked_list = []
        for (var key in $scope.Checkboxes[name].Item_list) {
            if ($scope.Checkboxes[name].Item_list[key].IsChecked) {
                $scope.Checkboxes[name].Checked_list.push(
                    $scope.Checkboxes[name].Item_list[key][value]
                )
                $scope.Checkboxes[name].Checked_name.push(
                    $scope.Checkboxes[name].Item_list[key]['name']
                )
            }
        }
        if ($scope.Checkboxes[name].Checked_list.length <= 0) {
            $('#' + name).text('請選擇' + from)
        } else {
            if (
                $scope.Checkboxes[name].Checked_list.length ==
                $scope.Checkboxes[name].Item_list.length
            ) {
                $('#' + name).text('全選')
                return
            }
            $('#' + name).text('')
            for (
                var i = 0;
                i < $scope.Checkboxes[name].Checked_name.length;
                i++
            ) {
                var addstr =
                    i == $scope.Checkboxes[name].Checked_name.length - 1
                        ? $('#' + name).text() +
                          $scope.Checkboxes[name].Checked_name[i]
                        : $('#' + name).text() +
                          $scope.Checkboxes[name].Checked_name[i] +
                          ','
                $('#' + name).text(addstr)
            }
        }
    }
    //依照選取的年制更改系所
    $scope.FreshFaculty = function () {
        var Edu_Type_Checked_List = $scope.Checkboxes['EduType'].Checked_list
        var Faculty_Items = $scope.Checkboxes['Faculty'].Item_list
        if (Edu_Type_Checked_List.length <= 0) {
            for (var Faculty_key in Faculty_Items) {
                var Now_Item = Faculty_Items[Faculty_key]
                Now_Item.IsShow = true
            }
            return
        }
        var IsEduTypeItems = []
        for (var Faculty_key in Faculty_Items) {
            var Now_Item = Faculty_Items[Faculty_key]
            Now_Item.IsShow = false
            Now_Item.IsChecked = false
            for (var key in Edu_Type_Checked_List) {
                var CheckedEdutype = Edu_Type_Checked_List[key]
                if (Now_Item.edutype.includes(CheckedEdutype)) {
                    IsEduTypeItems.push(Now_Item)
                }
            }
        }
        var distinctItems = new Set(IsEduTypeItems)
        distinctItems.forEach((items) => {
            items.IsShow = true
            items.IsChecked = false
        })
        $scope.Get_Item('Faculty', 'name', '系所')
        $scope.onCheckChange('Faculty', 'name', '系所')
    }
    //#endregion
    //#region 依照勾選學校地區(校本、城區)修改教室清單
    $scope.onPartChange = function () {
        CSService.Get_Place($scope).then(function (res) {
            $scope.Place_list = res.data
        })
    }
    //#endregion
    //#region autocomplete 提示字相關功能 ***https://code.sololearn.com/WgkF6SwpUNVm/#html

    //i_list資料,i_string使用者輸入,i_filter提示字的清單
    $scope.autocomplete = function (i_list, i_string, i_filter) {
        if (i_string == '') {
            $scope[i_filter] = null
            return
        }
        var output = []
        $scope[i_list].forEach((item) => {
            if (item.toLowerCase().indexOf(i_string.toLowerCase()) >= 0) {
                output.push(item)
            }
        })
        var disoutput = Array.from(new Set(output))
        $scope[i_filter] = disoutput
    }
    //點擊提示字，Textbox修改成點擊之提示字，並將提示字清單清除
    $scope.fillTextbox = function (i_item, i_string, i_filter) {
        $scope[i_item] = i_string
        console.log($scope[i_item])
        //$(`#txt_${i_item}`).val(i_string);
        $scope[i_filter] = null
    }
    //#endregion
    //#region paginate table分頁功能
    $scope.paginate = function (value) {
        var start, end, index
        start = ($scope.curPage - 1) * $scope.numPerPage
        end = start + $scope.numPerPage
        index = $scope.DataList.indexOf(value)
        return start <= index && index < end
    }
    $scope.$watch('curPage', function (newValue, oldValue) {
        $('#new_PreSchedule').scrollTop(0)
    })

    $scope.paginatePreModal = function (value) {
        var start, end, index
        start = ($scope.curPreModalPage - 1) * $scope.numPerPagePreModal
        end = start + $scope.numPerPagePreModal
        index = $scope.PreScheduleQueryDataList.indexOf(value)
        return start <= index && index < end
    }
    $scope.$watch('curPreModalPage', function (newValue, oldValue) {
        $('#PreScheduleTableQuery').scrollTop(0)
    })

    /* $("#new_PreSchedule").on('scroll' , function () {
         let PreScheduleScrollHeight = $(this).prop('scrollHeight') - $(this).height();
         console.log($(this).scrollTop() / PreScheduleScrollHeight);
     })*/
    //#endregion
    $scope.ResultOrderByName = ''
    $scope.ResultOrderByReverse = false
    $scope.ResultOrderBy = function (name) {
        $scope.ResultOrderByReverse =
            $scope.ResultOrderByName === name
                ? !$scope.ResultOrderByReverse
                : false
        $scope.ResultOrderByName = name
        if ($scope.ResultOrderByReverse) {
            $scope.DataList.sort(function (a, b) {
                return a[name].split(',')[0] - b[name].split(',')[0]
            })
        } else {
            $scope.DataList.sort(function (a, b) {
                return b[name].split(',')[0] - a[name].split(',')[0]
            })
        }
    }
    $scope.ResultOrderBy_RWD = function (item, name) {
        var havebefore = window
            .getComputedStyle(item, '::before')
            .getPropertyValue('content')
        if (!(havebefore == 'none')) {
            $scope.ResultOrderBy(name)
            $('html, body').animate(
                { scrollTop: $('#ResultData').offset().top },
                '0'
            )
        }
    }
    //#region PreSchedule預排課表&模擬課表
    //新增預排課表(表格)以及模擬課表之物件
    $scope.PreSchedule_Add = function (Item, btn) {
        $('.preSchedule-list-item').removeAttr('data-toggle')
        $('#PreScheduleModalCenter').modal('hide')
        if ($scope.PreSchedule_IsConflict(Item)) {
            alert('衝堂，請重新選擇')
            $scope.PreSchedule_IsConflict_Btn()
            return
        } else {
            if (Item.startPeriod == Item.endPeriod) {
                Item.Time = S_Time[Item.startPeriod - 1]
            } else {
                let start = Item.startPeriod
                let end = Item.endPeriod
                Item.Time = `${S_Time[start - 1].split('~')[0]}~${
                    S_Time[end - 1].split('~')[1]
                }`
            }
            $scope.PreScheduleList.push(Item)
            $scope.PreScheduleSize = $scope.PreScheduleList.length
            $scope.PreScheduleList = $scope.PreScheduleList.sort(function (
                a,
                b
            ) {
                if (a.startPeriod > b.startPeriod) {
                    return 1
                } else if (a.startPeriod < b.startPeriod) {
                    return -1
                }
                return 0
            })
        }
        //加到模擬課表
        for (var i = 0; i < $scope.PreScheduleSize; i++) {
            var i_time = $scope.PreScheduleList[i].Course_Time.split(',')
            var i_day = $scope.PreScheduleList[i].Course_Day
            for (var j = 0; j < i_time.length; j++) {
                //第一個=>節次第二個=>星期
                $scope.PreScheduleTable[i_time[j] - 1][days[i_day - 1]] =
                    $scope.PreScheduleList[i].Course_Name
            }
        }
        $scope.PreSchedule_IsConflict_Btn()
        setTimeout(() => {
            $('.preSchedule-list-item').attr('data-toggle', 'modal')
        }, 200)
    }
    //移除預排課表(表格)以及模擬課表之物件
    $scope.PreSchedule_Remove = function (item) {
        $('.preSchedule-list-item').removeAttr('data-toggle')
        $scope.PreScheduleList = $scope.PreScheduleList.filter(
            (value, index, arr) => {
                return value.Course_Id != item.Course_Id
            }
        )
        $scope.PreScheduleSize = $scope.PreScheduleList.length
        var i_time = item.Course_Time.split(',')
        var i_day = item.Course_Day
        for (var j = 0; j < i_time.length; j++) {
            $scope.PreScheduleTable[i_time[j] - 1][days[i_day - 1]] = ''
        }
        $scope.PreSchedule_IsConflict_Btn()
        setTimeout(() => {
            $('.preSchedule-list-item').attr('data-toggle', 'modal')
        }, 200)
    }
    //在模擬預排課表上小x移除物件 (擁有相依性 要注意)
    $scope.PreScheduleTable_Remove = function (i_name, i_peroid, i_day) {
        var remove_item = $scope.PreScheduleList.filter((value, index, arr) => {
            var IsTime = false
            var Times = value.Course_Time.split(',')
            for (var i = 0; i < Times.length; i++) {
                if (Times[i] == i_peroid) {
                    IsTime = true
                }
            }
            return (
                value.Course_Name == i_name &&
                IsTime &&
                value.Course_Day == i_day
            )
        })
        $scope.PreSchedule_Remove(remove_item[0])
        $scope.PreSchedule_IsConflict_Btn()
    }
    //判斷是否衝堂
    $scope.PreSchedule_IsConflict = function (Item) {
        for (var i = 0; i < $scope.PreScheduleList.length; i++) {
            if ($scope.PreScheduleList[i].Course_Day == Item.Course_Day) {
                var PreTime = $scope.PreScheduleList[i].Course_Time.split(',')
                var ItemTime = Item.Course_Time.split(',')
                var CombineArr = PreTime.concat(ItemTime)
                var DistinctArr = new Set(CombineArr)
                if (CombineArr.length != DistinctArr.size) {
                    return true
                }
            }
        }
        return false
    }

    $scope.PreSchedule_IsConflict_Btn = function () {
        for (var i = 0; i < $scope.DataList.length; i++) {
            if ($scope.PreSchedule_IsConflict($scope.DataList[i])) {
                $scope['PreBtn_' + $scope.DataList[i].Course_Id] = true
            } else {
                $scope['PreBtn_' + $scope.DataList[i].Course_Id] = false
            }
        }
    }

    $('#PreScheduleModalCenter').on('show.bs.modal', function () {
        $scope.preModalQ = ''
        $scope.preModalPeriodQ = ''
    })

    $scope.$watch('preModalQ', function (newValue, oldValue) {
        let searchValue = newValue.toLowerCase()
        $scope.PreScheduleQueryDataList =
            $scope.PreScheduleQueryStaticDataList.filter((item) => {
                return Object.keys(item).some((key) => {
                    if (item[key]) {
                        return item[key].toString().includes(searchValue)
                    }
                })
            })
    })

    $scope.$watch('preModalPeriodQ', function (newValue, oldValue) {
        $scope.PreScheduleQueryDataList =
            $scope.PreScheduleQueryStaticDataList.filter((item) => {
                if (item.Period.includes($scope.preModalPeriodQ)) {
                    return true
                } else if ($scope.preModalPeriodQ.includes('-')) {
                    let tempPeriodQ = $scope.preModalPeriodQ.replace(/-/gm, '~')
                    if (item.Period.includes(tempPeriodQ)) {
                        return true
                    }
                } else if (item.Course_Time.includes($scope.preModalPeriodQ)) {
                    return true
                }
                return false
            })
    })
    $scope.preModalPeriodFilter = function (item) {
        if (item.Period.includes($scope.preModalPeriodQ)) {
            return item
        } else if ($scope.preModalPeriodQ.includes('-')) {
            let tempPeriodQ = $scope.preModalPeriodQ.replace(/-/gm, '~')
            if (item.Period.includes(tempPeriodQ)) {
                return item
            }
        } else if (item.Course_Time.includes($scope.preModalPeriodQ)) {
            return item
        }
    }

    $scope.PreScheduleAddCondition = function (iItem, iDay) {
        iItem[days[iDay] + 'isClickedSearch'] = true
        $scope['Days'][iDay].IsChecked = true
        $scope['Times'][iItem.Period - 1].IsChecked = true
        CSService.PreScheduleQuery($scope, [iDay + 1], [iItem.Period]).then(
            function (res) {
                $scope.PreScheduleQueryDataList = res.data[0]
                $scope.PreScheduleQueryStaticDataList = JSON.parse(
                    JSON.stringify(res.data[0])
                )
            }
        )
        $('#PreScheduleModalCenter').modal('show')
        /*$scope.onCheckChange('Days','value','星期');
        $scope.onCheckChange('Times','value','節次');
        $scope.Query();*/
    }

    $scope.legend = function (day) {
        let allPeriod = [...Array(14).keys()]
        console.log($scope.PreScheduleList)
        CSService.PreScheduleQuery($scope, day, allPeriod).then(function (res) {
            $scope.PreScheduleQueryDataList = res.data[0]
            $scope.PreScheduleQueryStaticDataList = JSON.parse(
                JSON.stringify(res.data[0])
            )
        })
        $('#PreScheduleModalCenter').modal('show')
    }
    /* $scope.PreScheduleRemoveCondition = function (iItem , iDay) {
         let dayName =days[iDay];
         iItem[dayName + "isClickedSearch"] = false;
         $scope['Days'][iDay].IsChecked=false;
         $scope['Times'][iItem.Period-1].IsChecked=false;
         for (let i = 0 ; i<14 ; i++) {
             let isDayClicked = $scope.PreScheduleTable[i][dayName + "isClickedSearch"];
             if (isDayClicked) {
                 $scope['Days'][iDay].IsChecked=true;
                 $scope.onCheckChange('Times','value','節次');
                 $scope.Query();
                 return;
             }
         }
         $scope.onCheckChange('Days','value','星期');
         $scope.onCheckChange('Times','value','節次');
         $scope.Query();
     }*/
    $scope.ResultConflictDanger = function (item) {
        if ($scope.PreSchedule_IsConflict(item)) {
            //衝突
            $scope['PreBtn_' + item.Course_Id] = true
            $scope.PreSchedule_IsConflict_Btn()

            return { 'alert-danger': true }
        } else {
            $scope['PreBtn_' + item.Course_Id] = false
            $scope.PreSchedule_IsConflict_Btn()
            return { 'alert-secondary': true }
        }
    }
    //#endregion
    //#region ExportFunction
    $scope.exportpdf = async function (IsPreSchedule) {
        $scope.DownloadingBtn(true)
        CSService.storePreScheduleList($scope.PreScheduleList).then(
            function () {
                CSService.Create_Pdf(
                    $scope.pdfquery,
                    $scope.IsLine,
                    $scope.Columns,
                    IsPreSchedule,
                    $scope.PreScheduleList
                ).then((res) => {
                    $scope.ExportOffice(res)
                })
            }
        )
    }
    $scope.exportwordBackend = function () {
        $scope.DownloadingBtn(true)
        CSService.Create_Docx(
            $scope.pdfquery,
            $scope.IsLine,
            $scope.Columns
        ).then((res) => {
            $scope.ExportOffice(res)
        })
    }
    $scope.exportexcelBackend = function () {
        $scope.DownloadingBtn(true)
        CSService.Create_Xlsx(
            $scope.pdfquery,
            $scope.IsLine,
            $scope.Columns
        ).then(async (res) => {
            text = await res.data.text()
            console.log(res.status)
            if (res.status != 200) {
                $scope.DownloadingBtn(false)
                return
            }
            $scope.ExportOffice(res)
        })
    }

    $scope.exportPicture = function () {
        $scope.DownloadingBtn(true)
        window.scrollTo(0, 0)
        $('#PreSchedule').show()
        $('#PreSchedule').addClass('remove-td-height')
        $('#PreSchedule').removeClass('table-responsive')
        let tableWidth = $('#PreSchedule').width()
        console.log(tableWidth)
        if (tableWidth < 576) tableWidth = 576
        html2canvas($('#PreSchedule')[0], {
            width: tableWidth + 30,
        }).then((canvas) => {
            if ($scope.IsLine) {
                var imgdataurl = canvas.toDataURL('image/png')
                var imgdata = imgdataurl.replace(
                    /^data:image\/(png|jpg);base64,/,
                    ''
                )
                $.ajax({
                    url: '/api/pdfmake/picture',
                    data: {
                        imgdata: imgdata,
                    },
                    type: 'post',
                    success: function (res) {
                        $scope.DownloadingBtn(false)
                        alert(
                            '您在line使用匯出圖片功能，請記得在瀏覽器"長按"圖片下載。'
                        )
                        DownloadFileInLine(
                            'https://' + location.host + '/' + res,
                            true
                        )
                    },
                })
            } else {
                $scope.DownloadingBtn(false)
                var a = $('<a>')
                    .attr('href', canvas.toDataURL('image/png'))
                    .attr('download', 'output.png')
                    .appendTo('body')
                a[0].click()
                a.remove()
                $('#PreSchedule').removeClass('remove-td-height')
                //$('#PreSchedule').addClass('table-responsive');
                if ($(window).width() <= 764) {
                    $('#PreSchedule').hide()
                }
            }
        })
    }

    $scope.exportPictureMobile = function () {
        $scope.DownloadingBtn(true)
        window.scrollTo(0, 0)
        let isDarkMode = localStorage.getItem('darkMode')
        console.log(isDarkMode)
        // $('#table-mobile').addClass('remove-td-height');
        let domNode = $('#table-mobile')[0]
        let option = {
            width: domNode.scrollWidth,
            height: domNode.scrollHeight,
            style: {
                'background-color': '#FFF',
            },
        }
        if (isDarkMode == 'true') {
            option.style = {
                'background-color': '#1f1f1f',
            }
        }
        domtoimage.toPng(domNode, option).then(function (dataUrl) {
            var link = document.createElement('a')
            link.download = '課程表.png'
            link.href = dataUrl
            link.click()
            $scope.DownloadingBtn(false)
        })
        /*html2canvas($('#table-mobile',)[0],
            {
                width: tableWidth + 50,
                height : tableheight,
                scrollX: -10,
                scrollY: 0,
            }).then((canvas) => {
                if ($scope.IsLine) {
                    var imgdataurl = canvas.toDataURL("image/png");
                    var imgdata = imgdataurl.replace(/^data:image\/(png|jpg);base64,/, "");
                    $.ajax(
                        {
                            url: '/api/pdfmake/picture',
                            data:
                            {
                                imgdata: imgdata
                            },
                            type: 'post',
                            success: function (res) {
                                $scope.DownloadingBtn(false);
                                alert('您在line使用匯出圖片功能，請記得在瀏覽器"長按"圖片下載。');
                                DownloadFileInLine("https://" + location.host + '/' + res, true);
                            }
                        });
                }
                else {
                    $scope.DownloadingBtn(false);
                    var a = $("<a>").attr("href", canvas.toDataURL('image/png'))
                        .attr("download", "output.png")
                        .appendTo("body");
                    a[0].click();
                    a.remove();
                    //$('#PreSchedule').removeClass('remove-td-height');
                }
            });*/
    }

    $scope.DownloadingBtn = function (IsDownloading) {
        if (IsDownloading == true) {
            $('.downloading-button').addClass('show')
        } else {
            $('.downloading-button').removeClass('show')
        }
    }

    $scope.ExportOffice = function (res) {
        console.dir(res)
        if (typeof res.data === 'string') {
            DownloadFileInLine(
                'https://' + location.host + '/' + res.data,
                false
            )
            $scope.DownloadingBtn(false)
            return
        }
        $scope.DownloadingBtn(false)
        var file = window.URL.createObjectURL(res.data)
        let a = document.createElement('a')
        a.href = file
        a.target = '_blank'
        a.download = '課程查詢'
        a.click()
        a.remove()
    }
    //#endregion
    $scope.Login = function () {
        CSService.Login($scope.username, $scope.password).then((res) => {
            console.log(res)
        })
    }

    $scope.showCol = function (name) {
        let col = $scope.Columns.find((v) => v.name == name)
        return col.IsChecked
    }

    $scope.openResultDetailModal = function (iItem) {
        $scope.OpenResultItem = iItem
    }
    $('#ResultModalCenter_New').on('show.bs.modal', function (e) {
        var button = e.relatedTarget
        console.log(button)
    })

    $('#ModalCenter_Condition').on('show.bs.modal', function () {
        //$scope.testInclude = true;
        $('#originPageCondition').remove()
    })

    $('#ModalCenter_Condition').on('shown.bs.modal', function () {
        $('#txt_Place').blur(async function () {
            await sleep(100)
            $('#Place_lg').hide()
        })
        $('#txt_Place').focus(function () {
            $('#Place_lg').show()
            $('.checkboxes').hide()
            window.NTUNHS.last_focused = ''
        })
        $('#txt_Teacher').blur(async function () {
            await sleep(100)
            $('#Teacher_lg').hide()
        })
        $('#txt_Teacher').focus(function () {
            $('#Teacher_lg').show()
            $('.checkboxes').hide()
            window.NTUNHS.last_focused = ''
        })
        $('#txt_Course').focus(function () {
            $('.checkboxes').hide()
            window.NTUNHS.last_focused = ''
        })
    })
    $scope.$on('$includeContentLoaded', function (event, url) {
        $scope.onCheckChange('Sem', 'value', '學期')
    })

    $('#ModalCenter_Condition').on('shown.bs.modal', function () {
        $scope.onCheckChange('Sem', 'value', '學期')
        $scope.onCheckChange('EduType', 'value', '學制')
        //$scope.FreshFaculty();
        $scope.onCheckChange('Faculty', 'name', '系所')
        $scope.onCheckChange('Grades', 'value', '年級')
        $scope.onCheckChange('CourseTypes', 'value', '課別')
        $scope.onCheckChange('Days', 'value', '星期')
        $scope.onCheckChange('Times', 'value', '節次')
        $scope.onCheckChange('Category', 'name', '課程內容分類')
        $scope.onCheckChange('Columns', 'name', '顯示欄位')
        console.log($scope.Checkboxes)
    })

    $scope.ConditionClear = function () {
        $scope.Iteminit()
        $scope.ItemObjinit()
        $('option').text('請選擇')

        $(':text').val('')
        $("input[type='search']").val('')
        $(':text').text('')
        $("input[type='search']").text('')
        $scope.Edu_Type_All = false
        $scope.Faculty_All = false
        $scope.Grades_All = false
        $scope.CourseTypes_All = false
        $scope.Days_All = false
        $scope.Times_All = false
        $scope.Category_All = false
        $scope.Columns_All = true
        $scope.IsRootPart = false
        $scope.IsCityPart = false
        $scope.Get_Item('Columns', 'name', '顯示欄位')
        $scope.Teacher = ''
        $scope.Place = ''
        $scope.Course_Name = ''
    }
})

CSApp.service('CSService', function ($http) {
    return {
        Get_User: Get_User,
        Get_data: Get_data,
        PreScheduleQuery: PreScheduleQuery,
        Get_Place: Get_Place,
        Get_Teacher: Get_Teacher,
        Get_UserInf: Get_UserInf,
        Get_OnlyIcan: Get_OnlyIcan,
        Get_Sem: Get_Sem,
        Create_Pdf: Create_Pdf,
        Create_Docx: Create_Docx,
        Create_Xlsx: Create_Xlsx,
        Login: Login,
        storePreScheduleList: storePreScheduleList,
    }
    function Get_User($scope) {
        var request = $http.get('/api/user').then(function (result) {
            $scope.Currentuser = result.data
        })
        return request.then(handleSuccess, handleError)
    }
    function Get_data(scope) {
        if (scope.Place) {
            scope.Place = scope.Place.toUpperCase()
        }
        console.log(scope.Checkboxes['Sem'].Checked_list)
        var request = $http({
            method: 'GET',
            url: '/api/Course_Search',
            params: {
                Sem: scope.Checkboxes['Sem'].Checked_list,
                Faculty: scope.Checkboxes['Faculty'].Checked_list,
                EduType: scope.Checkboxes['EduType'].Checked_list,
                Grad: scope.Checkboxes['Grades'].Checked_list,
                Course_Type: scope.Checkboxes['CourseTypes'].Checked_list,
                Course_Day: scope.Checkboxes['Days'].Checked_list,
                Course_Time: scope.Checkboxes['Times'].Checked_list,
                Course_Name: scope.Course_Name,
                Teacher: scope.Teacher,
                IsRootPart: scope.IsRootPart,
                IsCityPart: scope.IsCityPart,
                Course_Other: scope.Checkboxes['Category'].Checked_list,
                Course_Place: scope.Place,
            },
        })
        return request.then(handleSuccess, handleError)
    }

    function PreScheduleQuery(scope, day, time) {
        if (scope.Place) {
            scope.Place = scope.Place.toUpperCase()
        }
        console.log(scope.Checkboxes['Sem'].Checked_list)
        var request = $http({
            method: 'GET',
            url: '/api/Course_Search',
            params: {
                Sem: scope.Checkboxes['Sem'].Checked_list,
                Faculty: scope.Checkboxes['Faculty'].Checked_list,
                EduType: scope.Checkboxes['EduType'].Checked_list,
                Grad: scope.Checkboxes['Grades'].Checked_list,
                Course_Type: scope.Checkboxes['CourseTypes'].Checked_list,
                Course_Day: day,
                Course_Time: time,
                Course_Name: scope.Course_Name,
                Teacher: scope.Teacher,
                IsRootPart: scope.IsRootPart,
                IsCityPart: scope.IsCityPart,
                Course_Other: scope.Checkboxes['Category'].Checked_list,
                Course_Place: scope.Place,
            },
        })
        return request.then(handleSuccess, handleError)
    }
    function Get_Place(scope) {
        var request = $http({
            method: 'GET',
            url: '/api/Course_Search/Place',
            params: {
                IsRootPart: scope.IsRootPart,
                IsCityPart: scope.IsCityPart,
            },
        })
        return request.then(handleSuccess, handleError)
    }
    function Get_Teacher(scope) {
        var request = $http({
            method: 'GET',
            url: '/api/Course_Search/Teacher',
            params: {
                Teacher: scope.Teacher,
            },
        })
        return request.then(handleSuccess, handleError)
    }
    function Get_UserInf() {
        var request = $http({
            method: 'GET',
            url: '/api/stuInfo',
        })
        return request.then(handleSuccess, handleError)
    }
    function Get_OnlyIcan(scope) {
        var request = $http({
            method: 'GET',
            url: '/api/Course_Search',
            params: {
                Faculty_Name: scope.userinfo.faculty,
                Course_Other: ['本系', '外系'],
                Sem: scope.Checkboxes['Sem'].Checked_list,
                IsOnly: true,
            },
        })
        return request.then(handleSuccess, handleError)
    }

    function Get_Sem() {
        let request = $http({
            method: 'GET',
            url: 'api/Course_Search/GetSem',
        })
        return request.then(handleSuccess, handleError)
    }
    function storePreScheduleList(preScheduleData) {
        var request = $http({
            method: 'POST',
            url: '/api/pdfmake/storeData',
            data: {
                data: preScheduleData,
            },
        })
        return request.then(handleSuccess, handleError)
    }
    function Create_Pdf(
        content,
        IsLine,
        Columns,
        IsPreSchedule,
        preScheduleData
    ) {
        var request = $http({
            method: 'GET',
            url: '/api/pdfmake',
            responseType: IsLine ? 'text' : 'blob',
            params: {
                content: content,
                IsLine: IsLine,
                Columns: Columns,
                IsPreSchedule: IsPreSchedule,
                data: preScheduleData,
            },
        })
        return request.then(handleSuccess, handleError)
    }
    function Create_Docx(content, IsLine, Columns) {
        var request = $http({
            method: 'GET',
            url: '/api/pdfmake/docx',
            responseType: IsLine ? 'text' : 'blob',
            params: {
                content: content,
                IsLine: IsLine,
                Columns: Columns,
            },
        })
        return request.then(handleSuccess, handleError)
    }
    function Create_Xlsx(content, IsLine, Columns) {
        var request = $http({
            method: 'GET',
            url: '/api/pdfmake/xlsx',
            responseType: IsLine ? 'text' : 'blob',
            params: {
                content: content,
                IsLine: IsLine,
                Columns: Columns,
            },
        })
        return request.then(handleSuccess, handleError)
    }

    function Login(username, password) {
        var request = $http({
            method: 'POST',
            url: '/login',
            params: {
                username: username,
                password: password,
            },
        })
        return request.then(handleSuccess, handleError)
    }
    function handleSuccess(response) {
        return response
    }

    function handleError(response) {
        return response
    }
})
