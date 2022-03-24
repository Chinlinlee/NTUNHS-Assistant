var ScheduleApp = angular.module('ScheduleApp', ['commonApp']);
ScheduleApp.controller(
    'ScheduleCtrl',
    function ($scope, ScheduleService, commonService) {
        /**variables initialize*/
        $scope.LogList = [];
        $scope.scheduleList = [];
        $scope.isMobile = false;
        $scope.LogListSize = '';
        $scope.Currentuser = '';
        $scope.openScheduleDetail = {};
        commonService.user.getStuInfo().then(function (res) {
            $scope.Currentuser = res.data;
        });

        let width = window.innerWidth > 0 ? window.innerWidth : screen.width;
        if (width <= 736) {
            document.body.style.zoom = '87%';
            $scope.isMobile = true;
        } else {
            $scope.isMobile = false;
        }
        $scope.Query = function () {
            ScheduleService.getSchedule().then(function (res, err) {
                if (
                    res.data == '' ||
                    res.data == null ||
                    res.data == undefined
                ) {
                    $scope.LogList = [];
                } else {
                    $scope.LogList = res.data.schedule;
                    $scope.scheduleList = res.data.courses;
                    angular.element(document).ready(function () {
                        for (let day = 1; day <= 7; day++) {
                            let todayItem = $scope.scheduleList.filter(
                                (v) => v.Day == day
                            );
                            if (!todayItem.length) {
                                $(`#fieldSet${day}`).remove();
                            }
                        }
                    });
                }
            });
        };
        window.onresize = function () {
            let width =
                window.innerWidth > 0 ? window.innerWidth : screen.width;
            console.log('is Mobile');
            if (width <= 736) {
                document.body.style.zoom = '87%';
                $('#table-lg').hide();
                $('#table-mobile').show();
            } else {
                $('#table-mobile').hide();
                $('#table-lg').show();
                $("[id*='modal']").modal('hide');
            }
        };

        $scope.onClickSchedule = function (data) {
            console.log(data);
            $scope.openScheduleDetail = data;
            $('#modalScheduleDetail').modal('show');
        };
    }
);

ScheduleApp.service('ScheduleService', function ($http) {
    return {
        getSchedule: getSchedule,
    };
    function getSchedule() {
        var request = $http({
            method: 'GET',
            url: '/api/Schedule',
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
