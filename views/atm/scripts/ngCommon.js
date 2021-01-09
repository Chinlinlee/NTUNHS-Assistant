let commonApp = angular.module("commonApp" , []);


commonApp.service ("commonService" , function ($http , $rootScope , $window) {
    $window.rootScopes = $window.rootScopes || [];
    $window.rootScopes.push($rootScope);
    
    if ($window.sharedService) {
        return $window.sharedService;
    }
    $window.sharedService = {
        user: {
            getProfile : function () {
                let request = $http({
                    method : "get" , 
                    url : "/api/user"
                });
                return (request.then(handleSuccess , handleError))
            } ,
            getStuInfo : function () {
                let request = $http({
                    method : "get" , 
                    url : "/api/stuinfo"
                });
                return (request.then(handleSuccess , handleError));
            } ,
            init : async ($scope) => {
                return new Promise ((resolve)=> {
                    $window.sharedService.user.getProfile().then(function (res) { 
                        $scope.Currentuser = res.data;
                        resolve(true);
                    });
                });
            }
        }, 
    }

    $rootScope.$on("darkmodeInit" , function () {
        $('#darkModeSwitch').bootstrapToggle()
        commonFunc.myDarkModeInit();
    });
    
    return $window.sharedService;
    function handleSuccess(response) {
        //console.log(response);
        return (response);
    }
    
    function handleError(response) {
        if (!response.data) {
            return ($q.reject("An unknown error occured."));
        } else {
            return ($q.reject(response.data.message));
        }
    }
});

commonApp.directive("darkmode" ,['$rootScope' , function ($rootScope) {
    return {
        replace : true , 
        restrict : 'E' , 
        templateUrl : '/navDarkMode.html' ,
        link : function ($scope) {
            let to;
            let listener = $scope.$watch(function () {
                clearTimeout(to);
                to = setTimeout(function () {
                    listener();
                    $rootScope.$broadcast("darkmodeInit");
                } , 100);
            });
            
        }
    }
}]);