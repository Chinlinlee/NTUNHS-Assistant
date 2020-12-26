
var ScheduleApp = angular.module("ScheduleApp", []);
ScheduleApp.controller("ScheduleCtrl", function ($scope, ScheduleService) {
  /**variables initialize*/
  $scope.LogList = [];
  $scope.scheduleList = [];
  $scope.isMobile = false;
  $scope.LogListSize = "";
  $scope.Currentuser ="";
  ScheduleService.Get_User($scope);
  let width = (window.innerWidth > 0) ? window.innerWidth : screen.width;
  if (width <= 736)
  {
    document.body.style.zoom = "87%" ;
    $scope.isMobile = true;
  } 
  else 
  {
    $scope.isMobile = false;
  }
  $scope.Query = function () {
    ScheduleService.Load_Trans($scope.Currentuser).then(function (res , err) 
    {
      if (res.data == "" || res.data == null || res.data == undefined) 
      {
        $scope.LogList = [];
      } 
      else 
      {
        var Schedule = res.data[0];
        $scope.LogList = Schedule;
        $scope.scheduleList = res.data[1];
        angular.element(document).ready(function () {
          for (let day = 1 ; day <=7 ; day++) {
            let todayItem = $scope.scheduleList.filter(v=> v.Day == day);
            if(!todayItem.length) {
              $(`#fieldSet${day}`).remove();
            }
          }
        });
      }
    });
  };
  window.onresize = function () {
    let width = (window.innerWidth > 0) ? window.innerWidth : screen.width;
    console.log("is Mobile");
    if (width <= 736)
    {
      document.body.style.zoom = "87%" ;
      $("#table-lg").hide();
      $("#table-mobile").show();
    } 
    else 
    {
      $("#table-mobile").hide();
      $("#table-lg").show();
      $("[id*='modal']").modal('hide');
    }
  }
});


ScheduleApp.service('ScheduleService', function ($http) {
  return ({
    Load_Trans: Load_Trans,
    Get_User : Get_User
  });
  function Get_User($scope)
  {
    var request  =$http.get('/api/user').then(function(result)
    {
      $scope.Currentuser = result.data;
    });
    return request.then(handleSuccess , handleError);
  }
  function Load_Trans(QueryKeys) {
    var request = $http({
      method: "GET",
      url: "/api/Schedule",
      params :
      {
        User : QueryKeys
      }
    });
    return (request.then(handleSuccess, handleError));
  }

  function handleSuccess(response) 
  {
    return (response);
  }

  function handleError(response) 
  {
    return (response);
  }
  
});
