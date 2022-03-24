let announcementApp = angular.module('announcementApp', ['commonApp']);

announcementApp.controller(
    'announcementCtrl',
    function ($scope, announcementService, commonService) {
        $scope.Currentuser = '';
        $scope.q = '';
        commonService.user.getStuInfo().then(function (res) {
            $scope.Currentuser = res.data;
        });

        $scope.news = {};
        $scope.info = {};
        announcementService.Get_data().then(function (res) {
            $scope.news = res.data.news;
            $scope.info = res.data.info;
        });
    }
);

announcementApp.service('announcementService', function ($http) {
    return {
        Get_data: Get_data,
    };
    function Get_data() {
        var request = $http({
            method: 'GET',
            url: 'api/announcement',
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
