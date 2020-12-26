

var HSApp = angular.module("HSApp" ,[]);
HSApp.controller("HSCtrl" , function($scope , HSService)
{
    $scope.DataList = [];
    $scope.Conlist = [];
    $scope.Sems = [];
    $scope.Currentuser = "";
    $scope.showItemEmpty = false;
    let width = (window.innerWidth > 0) ? window.innerWidth : screen.width;
    $scope.Ismobile = (width <= 736) ? true : false;
    HSService.Get_User($scope);
    $scope.Query = function ()
    {
        HSService.Get_User($scope);
        HSService.Get_data($scope.Currentuser).then((function(res)
        {
            if (res.status == 401) 
            {
                window.location.href = "/";
            }
            if (res.data == null)
            {
                $scope.DataList = [];
                $scope.Conlsit = [];
            }
            else
            {
                var History_Scores= res.data[0]
                $scope.DataList = History_Scores;
                var HS_con = res.data[1];
                $scope.Conlist = HS_con;
                var Sems = res.data[2];
                $scope.Sems = Sems;
            }
        }))
    }
    $scope.RemoveSpace = function(i_item)
    {
        let width = (window.innerWidth > 0) ? window.innerWidth : screen.width;
        $scope.Ismobile = (width <= 736) ? true : false;
        if ($scope.Ismobile && i_item !="")
        {
            $scope.showItemEmpty = true;
            return $scope.showItemEmpty;
        }
        else if (!$scope.Ismobile)
        {
            $scope.showItemEmpty = true;
            return $scope.showItemEmpty;
        }
        $scope.showItemEmpty = false;
        return $scope.showItemEmpty;
    }
});

HSApp.service("HSService" , function($http)
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
                url :　"api/History_Scores",
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
