var CTE_BOTApp = angular.module("CTE_BOTApp" , []);
CTE_BOTApp.controller('CTE_BOTCtrl' , function($scope, CTE_BOTService)
{
    $scope.Currentuser = "";
    $scope.HaveUser = false;
    CTE_BOTService.Get_User($scope).then((res)=>
    {
        console.log($scope.Currentuser);
        if ($scope.Currentuser !="")
        {
            $scope.HaveUser = true;
        }
    });
    $scope.Items = [];
    var E_Questions = ['任課教師有依據教學計畫授課' , '任課教師所使用的教材符合學習需要' , '任課教師的教學目標明確' , '任課教師教學態度認真' , '任課教師能與同學有合宜互動' , '任課教師具備良好的課程專業知能' , '任課教師能清楚的講解課程內容' , '課程的成績考評方式公正、客觀' , '任課教師能引發我對課程的學習興趣' , '整體言之，任課教師教學品質優良' , '請問你在該課程的修課期間之出席率如何？' ,'任課教師教學時，有性別差異或性別歧視之言語、舉止及態度。'];
    for (var  i  = 0 ; i < E_Questions.length ; i++)
    {
        var Obj = {};
        Obj['Num'] = i+1;
        for (var x = 1 ; x <=  5 ; x++)
        {
            Obj['E' + x] = 6-x;
        }
        Obj['E1'] = 5;
        Obj['Question'] = E_Questions[i];
        $scope.Items.push(Obj);
    }
    CTE_BOTService.Get_Status().then(function(res)
    {
        if (res.data =="非填寫時間")
        {
            alert("非填寫時間，跳回主畫面");
            window.location = "/";
        }
    });
});

CTE_BOTApp.service('CTE_BOTService' , function($http)
{
    return ({
        Get_User : Get_User , 
        Get_Status : Get_Status
    });
    function Get_User($scope)
    {
      var request  =$http.get('/api/user').then(function(result)
      {
        $scope.Currentuser = result.data;
      });
      return request.then(handleSuccess , handleError);
    }

    function Get_Status()
    {
        var request = $http({
            method: "GET",
            url: "/api/CTE_BOT"
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


