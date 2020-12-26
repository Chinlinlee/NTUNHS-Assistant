

var ScoresApp = angular.module("ScoresApp", []);
ScoresApp.controller("ScoresCtrl", function ($scope, ScoresService) {
    $scope.DataList = [];
    $scope.Conlist = [];
    $scope.PreRank = [];
    $scope.Currentuser = "";
    ScoresService.Get_User($scope);
    $scope.Query = function () {
        ScoresService.Get_User($scope);
        ScoresService.Get_data($scope.Currentuser).then((function (res) {
            if (res.status == 401) {
                window.location.href = "/logout";
            }
            if (res.data == null) {
                $scope.DataList = [];
                $scope.Conlist = [];
                $scope.PreRank = [];
            }
            else {
                var Scores = res.data[0];
                $scope.DataList = Scores;
                var Scores_Con = res.data[1];
                $scope.Conlist = Scores_Con;
                $scope.PreRank = res.data[2];
                console.log($scope.PreRank);
            }
        }))
    }
});

ScoresApp.service("ScoresService", function ($http) {
    return (
        {
            Get_User: Get_User,
            Get_data: Get_data
        }
    );
    function Get_User($scope) {
        var request = $http.get('/api/user').then(function (result) {
            $scope.Currentuser = result.data;
        });
        return request.then(handleSuccess, handleError);
    }
    function Get_data(Querykey) {
        var request = $http(
            {
                method: "GET",
                url: "api/Scores",
                params:
                {
                    User: Querykey
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
