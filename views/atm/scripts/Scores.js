var ScoresApp = angular.module('ScoresApp', ['commonApp']);
ScoresApp.controller(
    'ScoresCtrl',
    function ($scope, ScoresService, commonService) {
        $scope.scores = [];
        $scope.rankList = [];
        $scope.PreRank = [];
        $scope.storedRank = [];
        $scope.Currentuser = '';
        $scope.isSignOffCanUse = false;
        commonService.user.getStuInfo().then(function (res) {
            $scope.Currentuser = res.data;
        });
        ScoresService.getIsSignOffCanUse().then(function (res) {
            $scope.isSignOffCanUse = res.data;
        });
        $scope.Query = function () {
            ScoresService.getScore().then(function (res) {
                if (res.status == 401) {
                    window.location.href = '/logout';
                } else if (res.status == 400) {
                    alert('請填寫期中/期末評量，感謝。');
                }
                if (res.data == null) {
                    $scope.scores = [];
                    $scope.rankList = [];
                } else {
                    $scope.scores = res.data.scores;
                    for (let key in $scope.scores) {
                        let data = $scope.scores[key];
                        let checkDOMExist = setInterval(function () {
                            if ($(`#${data.Name}-score-chart-btn`).length > 0) {
                                if (!data.haveStoredScore) {
                                    $(`#${data.Name}-score-chart-btn`).prop(
                                        'disabled',
                                        true
                                    );
                                    $(
                                        `#${data.Name}-score-chart-btn`
                                    ).removeClass('btn-secondary');
                                    $(`#${data.Name}-score-chart-btn`).addClass(
                                        'btn-danger'
                                    );
                                } else {
                                    $(
                                        `#${data.Name}-score-chart-btn`
                                    ).removeProp('disabled');
                                }
                                clearInterval(checkDOMExist);
                            }
                        }, 100);
                    }
                    $scope.rankList = res.data.ranks;
                }
            });
        };

        $scope.storeRank = function () {
            let storeData = {
                data: $scope.rankList,
                system: 'NTUNHS',
            };
            ScoresService.postStoreRank(storeData).then(function (res) {
                if (res.status == 200) {
                    alert('上傳成功');
                    $scope.getStoredRank();
                }
            });
        };
        $scope.storeSignOffRank = function () {
            let storeData = {
                data: $scope.PreRank,
                system: 'SignOff',
            };
            ScoresService.postStoreRank(storeData).then(function (res) {
                if (res.status == 200) {
                    alert('上傳成功');
                    $scope.getStoredRank();
                }
            });
        };

        $scope.getStoredRank = function () {
            ScoresService.getStoredRank().then(function (res) {
                if (res.status == 200) {
                    $scope.storedRank = res.data;
                }
            });
        };

        $scope.getSignOffPreRank = function () {
            commonFunc.blockUI();
            ScoresService.getSignOffPreRank().then(function (res) {
                if (res.status == 200) {
                    $scope.PreRank = res.data;
                } else if (res.status == 401) {
                    window.location.href = '/logout';
                } else if (res.status == 400) {
                    alert('無法取得資料，系統錯誤或無少修申請。');
                }
                $.unblockUI();
            });
        };

        $scope.getCourseScoreChartByTeacher = function (item) {
            let courseName = item.Name.substring(8);
            window.open(
                `/historyScoreChart?courseName=${courseName}&courseTeacher=${item.Teacher}`,
                '_blank'
            );
        };
    }
);

ScoresApp.service('ScoresService', function ($http) {
    return {
        Get_User: Get_User,
        getScore: getScore,
        postStoreRank: postStoreRank,
        getStoredRank: getStoredRank,
        getIsSignOffCanUse: getIsSignOffCanUse,
        getSignOffPreRank: getSignOffPreRank,
    };
    function Get_User($scope) {
        let request = $http.get('/api/user').then(function (result) {
            $scope.Currentuser = result.data;
        });
        return request.then(handleSuccess, handleError);
    }
    function getScore() {
        let request = $http({
            method: 'GET',
            url: 'api/Scores',
        });
        return request.then(handleSuccess, handleError);
    }

    function postStoreRank(data) {
        let request = $http({
            method: 'POST',
            url: 'api/Scores/storeRank',
            data: data,
        });
        return request.then(handleSuccess, handleError);
    }

    function getStoredRank() {
        let request = $http({
            method: 'GET',
            url: 'api/Scores/storeRank',
        });
        return request.then(handleSuccess, handleError);
    }

    function getIsSignOffCanUse() {
        let request = $http({
            method: 'GET',
            url: 'api/Scores/isSignOffCanUse',
        });
        return request.then(handleSuccess, handleError);
    }

    function getSignOffPreRank() {
        let request = $http({
            method: 'GET',
            url: 'api/Scores/signOffPrerank',
        });
        return request.then(handleSuccess, handleError);
    }

    function handleSuccess(response) {
        return response;
    }

    function handleError(response) {
        return response;
    }
});
