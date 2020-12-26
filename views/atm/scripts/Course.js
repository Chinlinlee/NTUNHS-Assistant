

var CourseApp = angular.module("CourseApp" ,[]);
CourseApp.controller("CourseCtrl" , function($scope , CourseService)
{
    $scope.DataList = [];
    $scope.Currentuser = "";
    CourseService.Get_User($scope);
    $scope.Query = function ()
    {
        CourseService.Get_User($scope);
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
            Get_User : Get_User   ,
            Get_data : Get_data 
        }
    );
    function Get_User($scope)
    {
      var request  =$http.get('/api/user').then(function(result)
      {
        $scope.Currentuser = result.data;
      });
      return request.then(handleSuccess , handleError);
    }
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
