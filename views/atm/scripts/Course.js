

var CourseApp = angular.module("CourseApp", ["commonApp"]);
CourseApp.controller("CourseCtrl", function ($scope, CourseService, commonService) {
    $scope.DataList = [];
    $scope.Currentuser = "";
    $scope.selectedSem = "";

    commonService.user.getStuInfo().then(function (res) {
        $scope.Currentuser = res.data;
        $scope.selectedSem = $scope.Currentuser.allSemno[$scope.Currentuser.allSemno.length - 1];
        //angular.element(document.getElementById('setting')).scope().Query();
    });

    $scope.$watch("selectedSem", async function (newValue, oldValue) {
        if (newValue) {
            $scope.Query();
        }
    });
    $scope.Query = function () {
        commonFunc.blockUI();
        CourseService.Get_data($scope.selectedSem).then((function (res) {
            if (res.status == 401) {
                location.href = "/";
            }
            if (res.data == null || res.data.length <= 0) {
                $scope.DataList = [];
                $.unblockUI();
            }
            else {
                let Courses = res.data
                $scope.DataList = Courses;
                let checkContentExist = setInterval(function () {
                    if ($('[id*="content"]').length) {
                        let width = $(window).width();
                        if (width <= 736) {
                            HideTd('content');
                            $(`.table-th`).addClass("table-th-show");
                        }
                        clearInterval(checkContentExist);
                        $.unblockUI();
                    }
                }, 100);
            }
        }));
    }
});

CourseApp.service("CourseService", function ($http) {
    return (
        {
            Get_data: Get_data
        }
    );
    function Get_data(Querykey) {
        var request = $http(
            {
                method: "GET",
                url: "api/Course",
                params:
                {
                    semno: Querykey
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
