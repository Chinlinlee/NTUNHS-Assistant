

var ScoresApp = angular.module("ScoresApp", ["commonApp"]);
ScoresApp.controller("ScoresCtrl", function ($scope, ScoresService , commonService) {
    $scope.DataList = [];
    $scope.Conlist = [];
    $scope.PreRank = [];
    $scope.storedRank = [];
    $scope.Currentuser = "";
    commonService.user.getStuInfo().then(function (res) {
        $scope.Currentuser = res.data;
    });
    $scope.Query = function () {
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
                let Scores = res.data[0];
                $scope.DataList = Scores;
                let Scores_Con = res.data[1];
                $scope.Conlist = Scores_Con;
                $scope.PreRank = res.data[2];
            }
        }))
    }

    $scope.storeRank = function () {
        let storeData = {
            data : $scope.Conlist
        }
        ScoresService.postStoreRank(storeData).then(function (res) {
            if (res.status == 200) {
                alert('上傳成功');
                $scope.getStoredRank();
            }
        });
    }

    $scope.getStoredRank = function () {
        ScoresService.getStoredRank().then(function (res) {
            if (res.status == 200) {
                $scope.storedRank = res.data;
            }
        });
    }
});

ScoresApp.service("ScoresService", function ($http) {
    return (
        {
            Get_User: Get_User,
            Get_data: Get_data,
            postStoreRank : postStoreRank ,
            getStoredRank : getStoredRank
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

    function postStoreRank (data) {
        let request = $http({
            method : "POST" , 
            url : "api/Scores/storeRank" , 
            data : {
                 data
            }
        });
        return (request.then(handleSuccess , handleError));
    }

    function getStoredRank () {
        let request = $http({
            method : "GET" , 
            url : "api/Scores/storeRank" 
        });
        return (request.then(handleSuccess , handleError));
    }

    function handleSuccess(response) {
        return (response);
    }

    function handleError(response) {
        return (response);
    }
});
