var TSApp = angular.module("TSApp" ,[]);
TSApp.controller("TSCtrl" , function($scope , TSService)
{
    $scope.DataList = [];
    $scope.Currentuser = "";
    TSService.Get_User($scope);
    $scope.Query = function (day)
    {
        TSService.Get_User($scope);
        TSService.Get_data($scope.Currentuser , day).then((function(res)
        {
            if (res.data == "NoData" || res.data == null || res.data == undefined) 
            {
                $scope.DataList = [];
                $scope.Get_New_Data();
            }
            else
            {
                var Today_Schedule = res.data;
                $scope.DataList = Today_Schedule;
            }
        }));
    }

    $scope.Get_New_Data = function()
    {
        TSService.Get_New_Data($scope.Currentuser).then(function (res)
      {
        if (res.data == "success")
        {
          alert ("更新成功");
          window.location.href = "/Today_Schedule";
        }
        else
        {
          alert("更新失敗");
        }
      });
    }

    $scope.phpupdate = function()
    {
      var pwd = $scope.password;
      TSService.gotophp($scope.Currentuser , pwd).then(function (res)
      {
        if (res.data =="error pwd")
        {
          alert("密碼錯誤");
        }
        else if (res.data.user !=null)
        {
          document.location.href="https://www.chinstudio.icu/1081New_Project/Stu_Login.php?stu_id=" + res.data.user + "&stu_pwd=" + res.data.pwd;
        }
      });
    }
});

TSApp.service("TSService" , function($http)
{
    return (
        {
            Get_User : Get_User   ,
            Get_data : Get_data ,
            Get_New_Data : Get_New_Data , 
            gotophp : gotophp
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
    function Get_data(Querykey , weekday)
    {
        var request = $http(
            {
                method: "GET",
                url :　"api/Today_Schedule",
                params :
                {
                    User : Querykey,
                    day : weekday
                }
            }
        );
        return (request.then(handleSuccess , handleError));
    }
    function Get_New_Data(user)
    {
      var request = $http(
        {
          method: "POST" , 
          url : "/api/log",
          params:
          {
            User : user, 
            method : "getnewdata"
          }
        }
      );
      return (request.then(handleSuccess , handleError));
    }
    function gotophp(user ,pwd)
    {
      var request = $http(
        {
          method: "POST" , 
          url : "/api/log",
          params:
          {
            User : user, 
            userpwd : pwd,
            method : "updatedata"
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
