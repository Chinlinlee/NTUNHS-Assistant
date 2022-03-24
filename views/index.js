var LoginApp = angular.module('LoginApp', []);
LoginApp.controller('LoginCtrl', function ($scope, LoginService) {
    /**variables initialize*/
    $scope.selectedLog = {};
    $scope.lineid = '';
    console.log($scope);
    $scope.LineLogin = function () {
        $scope.lineid = $('#lineid').val();
        LoginService.Get_Line($scope.lineid).then(function (res) {
            if (res.data != 'no lineid') {
                $.blockUI({
                    message:
                        "<i class='fa fa-spinner fa-pulse orange' style='font-size:600%'></i>",
                    //borderWidth:'0px' 和透明背景
                    css: { borderWidth: '0px', backgroundColor: 'transparent' },
                });
                LoginService.Line_Login(
                    res.data.username,
                    res.data.lineid
                ).then(function (res) {
                    window.location = '/Today_Schedule';
                });
            }
        });
    };
});

LoginApp.service('LoginService', function ($http) {
    return {
        Get_Line: Get_Line,
        Line_Login: Line_Login,
    };
    function Get_Line(lineid) {
        var request = $http({
            method: 'POST',
            url: '/api/lineid',
            params: {
                id: lineid,
            },
        });
        return request.then(handleSuccess, handleError);
    }
    function Line_Login(user, id) {
        var request = $http({
            method: 'POST',
            url: '/login',
            params: {
                username: user,
                password: '1234',
                lineid: id,
            },
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

function togglePassword() {
    const passwordInput = document.querySelector("#inputPassword");
    const inputType = passwordInput.getAttribute("type");
    if (inputType === "password") {
        passwordInput.setAttribute("type", "text");
    } else {
        passwordInput.setAttribute("type", "password");
    }
    const faEye = document.querySelector("#togglePassword");
    faEye.classList.toggle("fa-eye-slash");
}