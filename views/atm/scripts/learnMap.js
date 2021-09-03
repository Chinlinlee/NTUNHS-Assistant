let learnMapApp = angular.module("learnMapApp", ["commonApp"]);

learnMapApp.controller("learnMapCtrl", function ($scope, learnMapService, commonService) {
    $scope.Currentuser = "";
    $scope.userProgram = {};
    $scope.creditObject = {};
    $scope.creditHisObjectList= [];
    $scope.creditHisSummaryObject = {};
    

    commonService.user.getStuInfo().then(function (res) {
        $scope.Currentuser = res.data;
    });
    commonFunc.blockUI();
    learnMapService.Get_data().then(function (res) {
        if (res.status == 401) {
            window.location.href = '/';
        }
        //$(".container").prepend(res.data.hitCredit);
        //console.log(res.data.hitCredit);
        $scope.userProgram = res.data.program;
        $scope.creditObject = res.data.creditObject;
        $scope.creditHisObjectList = res.data.creditHisObjectList;
        $scope.creditHisSummaryObject = res.data.creditHisSummaryObject;
        $.unblockUI();
    });
});


learnMapApp.service("learnMapService", function ($http) {
    return (
        {
            Get_data: Get_data
        }
    );
    function Get_data() {
        var request = $http(
            {
                method: "GET",
                url: "api/learnMap",
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

