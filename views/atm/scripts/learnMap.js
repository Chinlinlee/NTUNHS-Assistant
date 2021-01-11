let learnMapApp = angular.module("learnMapApp", ["commonApp"]);

learnMapApp.controller("learnMapCtrl", function ($scope, learnMapService, commonService) {
    $scope.Currentuser = "";
    $scope.userProgram = {};
    commonService.user.getStuInfo().then(function (res) {
        $scope.Currentuser = res.data;
    });
    commonFunc.blockUI();
    learnMapService.Get_data().then(function (res) {
        console.log(res.data);
        $(".container").prepend(res.data.hitCredit);
        console.log(res.data.hitCredit);
        $scope.userProgram = res.data.program;
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

