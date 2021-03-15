

var ScoresApp = angular.module("ScoresApp", ["commonApp"]);
ScoresApp.controller("ScoresCtrl", function ($scope, ScoresService , commonService) {
    $scope.DataList = [];
    $scope.Conlist = [];
    $scope.PreRank = [];
    $scope.storedRank = [];
    $scope.Currentuser = "";
    $scope.isSignOffCanUse = false;
    commonService.user.getStuInfo().then(function (res) {
        $scope.Currentuser = res.data;
    });
    ScoresService.getIsSignOffCanUse().then(function (res) {
        $scope.isSignOffCanUse = res.data;
    });
    $scope.Query = function () {
        ScoresService.Get_data($scope.Currentuser).then((function (res) {
            if (res.status == 401) {
                window.location.href = "/logout";
            }
            if (res.data == null) {
                $scope.DataList = [];
                $scope.Conlist = [];
            }
            else {
                let Scores = res.data[0];
                $scope.DataList = Scores;
                for (let key in $scope.DataList) {
                    let data = $scope.DataList[key];
                    let checkDOMExist = setInterval(function () {
                        if ($(`#${data.Name}-score-chart-btn`).length > 0 ) {
                            if (!data.haveStoredScore) {
                                $(`#${data.Name}-score-chart-btn`).prop("disabled" , true);
                                $(`#${data.Name}-score-chart-btn`).removeClass("btn-secondary");
                                $(`#${data.Name}-score-chart-btn`).addClass("btn-danger");
                            } else {
                                $(`#${data.Name}-score-chart-btn`).removeProp("disabled");
                            }
                            clearInterval(checkDOMExist);
                        }
                    } , 100);
                }
                let Scores_Con = res.data[1];
                $scope.Conlist = Scores_Con;
            }
        }))
    }

    $scope.storeRank = function () {
        let storeData = {
            data : $scope.Conlist , 
            system : "NTUNHS"
        }
        ScoresService.postStoreRank(storeData).then(function (res) {
            if (res.status == 200) {
                alert('上傳成功');
                $scope.getStoredRank();
            }
        });
    }
    $scope.storeSignOffRank = function () {
        let storeData = {
            data : $scope.PreRank , 
            system : "SignOff"
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

    $scope.getSignOffPreRank = function () {
        commonFunc.blockUI();
        ScoresService.getSignOffPreRank().then(function (res) {
            if (res.status == 200) {
                $scope.PreRank = res.data;
            } else if (res.status == 401) {
                window.location.href = "/logout";
            } else if (res.status == 400) {
                alert("無法取得資料，系統錯誤或無少修申請。");
            }
            $.unblockUI();
        });   
    }

    $scope.getCourseScoreChartByTeacher = function (item) {
        let courseName = item.Name.substring(8);
        window.open(`/historyScoreChart?courseName=${courseName}&courseTeacher=${item.Teacher}` , "_blank");
    }
});

ScoresApp.service("ScoresService", function ($http) {
    return (
        {
            Get_User: Get_User,
            Get_data: Get_data,
            postStoreRank : postStoreRank ,
            getStoredRank : getStoredRank ,
            getIsSignOffCanUse : getIsSignOffCanUse ,
            getSignOffPreRank : getSignOffPreRank
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
            data : data
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

    function getIsSignOffCanUse () {
        let request = $http({
            method : "GET" , 
            url : "api/Scores/isSignOffCanUse" 
        });
        return (request.then(handleSuccess , handleError));
    }

    function getSignOffPreRank () {
        let request = $http({
            method : "GET" , 
            url : "api/Scores/signOffPrerank" 
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
