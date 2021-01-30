

var HSApp = angular.module("HSApp" ,["commonApp"]);
HSApp.controller("HSCtrl" , function($scope , HSService , commonService)
{
    $scope.DataList = [];
    $scope.Conlist = [];
    $scope.Sems = [];
    $scope.Currentuser = "";
    commonService.user.getStuInfo().then(function (res) {
        $scope.Currentuser = res.data;
    });
    //$scope.showItemEmpty = false;
    let width = (window.innerWidth > 0) ? window.innerWidth : screen.width;
    $scope.Ismobile = (width <= 736) ? true : false;
    $scope.Query = function ()
    {
        commonFunc.blockUI();
        HSService.Get_data().then((function(res)
        {
            if (res.status == 401) 
            {
                window.location.href = "/";
            }
            if (res.data == null)
            {
                $scope.DataList = [];
                $scope.Conlsit = [];
                $.unblockUI();
            }
            else
            {
                var History_Scores= res.data[0]
                $scope.DataList = History_Scores;
                var HS_con = res.data[1];
                $scope.Conlist = HS_con;
                var Sems = res.data[2];
                $scope.Sems = Sems;
                let checkDOMExist = setInterval(function () {
                    if ($("table").length > 0 ) {
                        console.log('yes');
                        $.unblockUI();
                        clearInterval(checkDOMExist);
                    }
                } , 100);
            }
        }))
    }
    $scope.uploadScore = function () {
        commonFunc.blockUI();
        HSService.uploadScore().then(function (res) {
            if (res.status == 200) {
                alert('上傳成功');
            }
            $.unblockUI();
        });
    }
    $scope.RemoveSpace = function(i_item)
    {
        let width = (window.innerWidth > 0) ? window.innerWidth : screen.width;
        $scope.Ismobile = (width <= 736) ? true : false;
        showItemEmpty = false;
        if ($scope.Ismobile && i_item !="")
        {
            showItemEmpty = true;
            return showItemEmpty;
        }
        else if (!$scope.Ismobile)
        {
            showItemEmpty = true;
            return showItemEmpty;
        }
        return showItemEmpty;
    }
    window.onresize = async function () {
        let width = (window.innerWidth > 0) ? window.innerWidth : screen.width;
        if (width <= 736)
        {
            $("[id*='HStable_']").addClass("table-rwd");
            TdDisplay('content');
            $("[id*=_content_empty]").each(function () {
                if (!$(this).text()) {
                    $(this).hide();
                }
            });
        } 
        else 
        {
            $("[id*='HStable_']").removeClass("table-rwd");
            TdDisplayNoneRWD('content');
            $scope.$apply();
        }
    }
});

HSApp.service("HSService" , function($http)
{
    return (
        {
            Get_data : Get_data ,
            uploadScore : uploadScore
        }
    );
    function Get_data()
    {
        var request = $http(
            {
                method: "GET",
                url :　"api/History_Scores",
            }
        );
        return (request.then(handleSuccess , handleError));
    }
    function uploadScore()
    {
        var request = $http(
            {
                method: "POST",
                url :　"api/History_Scores",
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
