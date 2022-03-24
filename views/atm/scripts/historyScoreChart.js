let historyScoreChartApp = angular.module('historyScoreChartApp', [
    'commonApp',
]);

historyScoreChartApp.controller(
    'historyScoreChartCtrl',
    function ($scope, $timeout, historyScoreChartService, commonService) {
        $scope.courseList = [];
        $scope.selectedCourse = [];
        $scope.isWatchAnotherTeacher = false;
        $scope.enterTeacher = {};
        let params = new URLSearchParams(window.location.search);
        let courseTeacher = params.get('courseTeacher');
        $scope.enterTeacher = courseTeacher;
        if (courseTeacher == 'ALL') {
            $scope.isWatchAnotherTeacher = true;
        }

        $scope.$watch('selectedCourse', function (newV, oldV) {
            $scope.$applyAsync(function () {
                $('.selectpicker').selectpicker('refresh');
            });
            $('[id*=scoreChart]').hide();
            $('[id*=chartTitle]').hide();
            for (let i = 0; i < newV.length; i++) {
                let course = newV[i];
                $(
                    `#scoreChart_${course.courseSem}_${course.courseNormalId}`
                ).show();
                $(
                    `#chartTitle_${course.courseSem}_${course.courseNormalId}`
                ).show();
            }
        });
        $scope.$watch('isWatchAnotherTeacher', function (newV, oldV) {
            $scope.query();
        });

        $scope.Currentuser = '';
        commonService.user.getStuInfo().then(function (res) {
            $scope.Currentuser = res.data;
        });

        $scope.query = function () {
            let params = new URLSearchParams(window.location.search);
            let courseName = params.get('courseName');
            let courseTeacher = params.get('courseTeacher') || 'ALL';
            if ($scope.isWatchAnotherTeacher) courseTeacher = 'ALL';
            let qs = {
                courseName: courseName,
                courseTeacher: courseTeacher,
            };
            historyScoreChartService
                .getCourseScoreChart(qs)
                .then(function (res) {
                    if (res.status == 200) {
                        $timeout(async function () {
                            $scope.courseList = res.data;
                            $scope.selectedCourse = $scope.courseList;

                            for (let i = 0; i < $scope.courseList.length; i++) {
                                let course = $scope.courseList[i];
                                let checkIsChangeView = setInterval(
                                    function () {
                                        if (
                                            $(
                                                `#scoreChart_${course.courseSem}_${course.courseNormalId}`
                                            ).is(':visible')
                                        ) {
                                            clearInterval(checkIsChangeView);
                                            createChart(
                                                course,
                                                `scoreChart_${course.courseSem}_${course.courseNormalId}`
                                            );
                                        }
                                    },
                                    100
                                );
                            }
                        }, 0);
                    }
                });
        };
    }
);

function createChart(scoreData, canvasId) {
    let scoreCategory = scoreData.scoreCategory;
    let ctx = $('#' + canvasId);
    let myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Object.keys(scoreData.scoreCategory).sort(),
            datasets: [
                {
                    label: `${scoreData.courseName} 成績分佈`,
                    data: [
                        scoreCategory['0~10'],
                        scoreCategory['10~20'],
                        scoreCategory['20~30'],
                        scoreCategory['30~40'],
                        scoreCategory['40~50'],
                        scoreCategory['50~60'],
                        scoreCategory['60~70'],
                        scoreCategory['70~80'],
                        scoreCategory['80~90'],
                        scoreCategory['90~100'],
                    ],
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.2)',
                        'rgba(255, 99, 132, 0.2)',
                        'rgba(255, 99, 132, 0.2)',
                        'rgba(255, 99, 132, 0.2)',
                        'rgba(255, 99, 132, 0.2)',
                        'rgba(255, 99, 132, 0.2)',
                        'rgba(255, 206, 86, 0.2)',
                        'rgba(255, 206, 86, 0.2)',
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
                    borderWidth: 1,
                },
            ],
        },
        options: {
            scales: {
                yAxes: [
                    {
                        ticks: {
                            beginAtZero: true,
                            min: 0,
                            steps: 10,
                        },
                    },
                ],
            },
        },
    });
}

historyScoreChartApp.service('historyScoreChartService', function ($http) {
    return {
        getCourseScoreChart: getCourseScoreChart,
    };
    function getCourseScoreChart(item) {
        let request = $http({
            method: 'GET',
            url: 'api/History_Scores/storedHistoryScoreByTeacher',
            params: item,
        });
        return request.then(handleSuccess, handleError);
    }
    function handleSuccess(response) {
        return response;
    }

    function handleError(response) {
        console.log(response);
        return response;
    }
});
