

var HSApp = angular.module("HSApp" ,["commonApp"]);
HSApp.controller("HSCtrl" , function($scope , HSService , commonService)
{
    $scope.DataList = [];
    $scope.Conlist = [];
    $scope.Sems = [];
    $scope.scoreChartData = {};
    $scope.isOnlyAvgScore = {
        
    }
    $scope.Currentuser = "";
    commonService.user.getStuInfo().then(function (res) {
        $scope.Currentuser = res.data;
    });
    //$scope.showItemEmpty = false;
    let width = (window.innerWidth > 0) ? window.innerWidth : screen.width;
    $scope.Ismobile = (width <= 736) ? true : false;
    $scope.Query = function ()
    {
        commonFunc.blockUI();
        HSService.Get_data().then((function(res)
        {
            if (res.status == 401) 
            {
                window.location.href = "/";
            }
            if (res.data == null)
            {
                $scope.DataList = [];
                $scope.Conlsit = [];
                $.unblockUI();
            }
            else
            {
                var History_Scores= res.data[0]
                $scope.DataList = History_Scores;
                var HS_con = res.data[1];
                $scope.Conlist = HS_con;
                var Sems = res.data[2];
                $scope.Sems = Sems;
                for (let sem of $scope.Sems) {
                    $scope.isOnlyAvgScore[sem] = false;
                }
                let checkDOMExist = setInterval(function () {
                    if ($("table").length > 0 ) {
                        console.log('yes');
                        $.unblockUI();
                        clearInterval(checkDOMExist);
                    }
                } , 100);
                
            }
        }))
    }
    $scope.uploadScore = function () {
        $("#ModalCenter_Confirm").modal('hide');
        commonFunc.blockUI();
        HSService.uploadScore().then(function (res) {
            if (res.status == 200) {
                alert('上傳成功');
            }
            $.unblockUI();
        });
    }
    $scope.RemoveSpace = function(i_item)
    {
        let width = (window.innerWidth > 0) ? window.innerWidth : screen.width;
        $scope.Ismobile = (width <= 736) ? true : false;
        showItemEmpty = false;
        if ($scope.Ismobile && i_item !="")
        {
            showItemEmpty = true;
            return showItemEmpty;
        }
        else if (!$scope.Ismobile)
        {
            showItemEmpty = true;
            return showItemEmpty;
        }
        return showItemEmpty;
    }

    $scope.getCourseScoreChart = function (iItem) {
        console.log(iItem);
        let sem = "";
        if (iItem.Up_Score) {
            sem = `${iItem.Sem}1`;
        } else {
            sem = `${iItem.Sem}2`;
        }
        let queryData = {
            courseNormalId : iItem.courseNormalId ,
            courseSem : sem
        }
        HSService.getCourseScoreChart(queryData).then(function (res) {
            $scope.scoreChartData = res.data;
            if (!res.data) {
                console.log("error");
                alert("此課程無法呈現圖表，未有人上傳或資料無法分享，e.g. 操行");
                return;
            }
            let scoreCategory = $scope.scoreChartData.scoreCategory
            let ctx = $('#scoreChart');
            let myChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: Object.keys($scope.scoreChartData.scoreCategory).sort(),
                    datasets: [{
                        label: `${$scope.scoreChartData.courseName} 成績分佈`,
                        data: [
                            scoreCategory['0~10'].length ,
                            scoreCategory['10~20'].length ,
                            scoreCategory['20~30'].length ,
                            scoreCategory['30~40'].length ,
                            scoreCategory['40~50'].length ,
                            scoreCategory['50~60'].length ,
                            scoreCategory['60~70'].length ,
                            scoreCategory['70~80'].length ,
                            scoreCategory['80~90'].length ,
                            scoreCategory['90~100'].length ,
                        ],
                        backgroundColor: [
                            'rgba(255, 99, 132, 0.2)' ,
                            'rgba(255, 99, 132, 0.2)' ,
                            'rgba(255, 99, 132, 0.2)',
                            'rgba(255, 99, 132, 0.2)' ,
                            'rgba(255, 99, 132, 0.2)' ,
                            'rgba(255, 99, 132, 0.2)' ,
                            'rgba(255, 206, 86, 0.2)' ,
                            'rgba(255, 206, 86, 0.2)' ,
                            'rgba(54, 162, 235, 0.2)',
                            'rgba(54, 162, 235, 0.2)',
                            
                        ],
                        borderColor: [
                            'rgba(255,99,132,1)',
                            'rgba(255,99,132,1)',
                            'rgba(255,99,132,1)',
                            'rgba(255,99,132,1)',
                            'rgba(255,99,132,1)',
                            'rgba(255,99,132,1)',
                            'rgba(255, 206, 86, 1)',
                            'rgba(255, 206, 86, 1)',
                            'rgba(54, 162, 235, 1)',
                            'rgba(54, 162, 235, 1)',
                            
                        ],
                        borderWidth: 1
                    }]
                },
                options: {
                    scales: {
                        yAxes: [{
                            ticks: {
                                beginAtZero: true,
                                min : 0 ,
                                steps : 10 
                            }
                        }]
                    }
                }
            });
            $("#ModalCenter_Chart").modal('show');
            $("#ModalCenter_Chart").on('hidden.bs.modal' , function () {
                myChart.destroy();
            })
        });
    }

    $scope.getCourseScoreChartByTeacher = function (item) {
        let courseName = item.Course.substring(9);
        console.log(courseName);
        window.open(`/historyScoreChart?courseName=${courseName}&courseTeacher=${item.courseTeacher}` , "_blank");
    }
    window.onresize = async function () {
        let width = (window.innerWidth > 0) ? window.innerWidth : screen.width;
        if (width <= 736)
        {
            $("[id*='HStable_']").addClass("table-rwd");
            TdDisplay('content');
            $("[id*=_content_empty]").each(function () {
                if (!$(this).text()) {
                    $(this).hide();
                }
            });
            $scope.Ismobile = true;
        } 
        else 
        {
            $("[id*='HStable_']").removeClass("table-rwd");
            TdDisplayNoneRWD('content');
            $scope.Ismobile = false;
        }
        $scope.$apply();
    }
});

HSApp.service("HSService" , function($http)
{
    return (
        {
            Get_data : Get_data ,
            uploadScore : uploadScore ,
            getCourseScoreChart : getCourseScoreChart
        }
    );
    function Get_data()
    {
        var request = $http(
            {
                method: "GET",
                url :　"api/History_Scores",
            }
        );
        return (request.then(handleSuccess , handleError));
    }
    function getCourseScoreChart(item)
    {
        var request = $http(
            {
                method: "GET",
                url :　"api/History_Scores/storedHistoryScore",
                params : item
            }
        );
        return (request.then(handleSuccess , handleError));
    }
    function uploadScore()
    {
        var request = $http(
            {
                method: "POST",
                url :　"api/History_Scores",
            }
        );
        return (request.then(handleSuccess , handleError));
    }
    function handleSuccess(response) {
        return (response);
    }
    
      function handleError(response) {
        return (response);
    }
});
