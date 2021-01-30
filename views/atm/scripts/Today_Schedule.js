var TSApp = angular.module("TSApp", ["commonApp"]);
TSApp.controller("TSCtrl", function ($scope, TSService , commonService) {
    $scope.DataList = [];
    $scope.DataListLen = 0;
    $scope.Currentuser = "";
    commonService.user.getStuInfo().then(function (res) {
        $scope.Currentuser = res.data;
    })
    $scope.Query = function (day) {
        //TSService.Get_User($scope);
        TSService.Get_data($scope.Currentuser, day).then((function (res) {
            if (res.data == "NoData" || res.data == null || res.data == undefined) {
                $scope.DataList = [];
                $scope.DataListLen = 0;
            }
            else {
                var Today_Schedule = res.data;
                $scope.DataList = Today_Schedule;
                $scope.DataListLen = $scope.DataList.length;
                console.log($scope.DataListLen);
                let checkContentExist = setInterval(async function () {
                    if ($('[id*="setting"]').length) {
                        let width = $(window).width();
                        if (width <= 736)
                        {
                            $("#setting").addClass("table-rwd");
                            await sleep(100);
                            HideTd('content');
                            await sleep(100);
                            $(`.table-th`).addClass("table-th-show");
                        } 
                        clearInterval(checkContentExist);
                        //$.unblockUI();
                    }
                }, 100);
                
            }
        }));
    }
});

TSApp.service("TSService", function ($http) {
    return (
        {
            Get_data: Get_data
        }
    );
    function Get_data(Querykey, weekday) {
        var request = $http(
            {
                method: "GET",
                url: "api/Today_Schedule",
                params:
                {
                    User: Querykey,
                    day: weekday
                }
            }
        );
        return (request.then(handleSuccess, handleError));
    }
    function handleSuccess(response) {
        return (response);
    }

    function handleError(response) {
        return (response);
    }
});


