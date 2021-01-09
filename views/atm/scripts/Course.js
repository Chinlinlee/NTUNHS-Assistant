

var CourseApp = angular.module("CourseApp" ,["commonApp"]);
CourseApp.controller("CourseCtrl" , function($scope , CourseService , commonService)
{
    $scope.DataList = [];
    $scope.Currentuser = "";
    
    commonService.user.getStuInfo().then(function (res) {
        $scope.Currentuser = res.data;
    });
    $scope.Query = function ()
    {
        
        CourseService.Get_data($scope.Currentuser).then((function(res)
        {
            if (res.data == null)
            {
                $scope.DataList = [];
            }
            else
            {
                var Courses  = res.data
                $scope.DataList = Courses;
            }
        }))
    }
});

CourseApp.service("CourseService" , function($http)
{
    return (
        {
            Get_data : Get_data 
        }
    );
    function Get_data(Querykey)
    {
        var request = $http(
            {
                method: "GET",
                url :　"api/Course",
                params :
                {
                    User : Querykey
                }
            }
        );
        return (request.then(handleSuccess , handleError));
    }
    function handleSuccess(response) {
        return (response);
    }
    
      function handleError(response) {
        return (response);
    }
});
