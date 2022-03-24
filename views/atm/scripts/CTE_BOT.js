var CTE_BOTApp = angular.module('CTE_BOTApp', ['commonApp'])
CTE_BOTApp.controller(
    'CTE_BOTCtrl',
    function ($scope, CTE_BOTService, commonService) {
        $scope.Currentuser = ''
        commonService.user.getStuInfo().then(function (res) {
            $scope.Currentuser = res.data
        })
        $scope.Items = []
        var E_Questions = [
            '任課教師有依據教學計畫授課',
            '任課教師對課程內容有良好的組織與規劃',
            '任課教師充分準備上課資料或教材',
            '任課教師對教授課程之教學目標明確',
            '任課教師使用符合學習需要的教材',
            '任課教師能清楚的講解課程內容',
            '任課教師能引發我對本課程的學習興趣',
            '任課教師能採用適合與多元的教學策略',
            '任課教師能與同學有合宜互動',
            '任課教師能關心學生本課程的學習狀況',
            '任課教師對於課程的成績考評方式公正、客觀',
            '任課教師教學態度認真',
            '整體言之，任課教師教學品質優良',
            '任課教師教學時，有性別差異或性別歧視之言語、舉止及態度',
        ]
        for (var i = 0; i < E_Questions.length; i++) {
            var Obj = {}
            Obj['Num'] = i + 1
            for (var x = 1; x <= 5; x++) {
                Obj['E' + x] = 6 - x
            }
            //Obj['E1'] = 5;
            Obj['Question'] = E_Questions[i]
            $scope.Items.push(Obj)
        }
        CTE_BOTService.Get_Status().then(function (res) {
            if (res.data == '非填寫時間') {
                alert('非填寫時間，跳回主畫面')
                window.location = '/'
            }
        })
    }
)

CTE_BOTApp.service('CTE_BOTService', function ($http) {
    return {
        Get_Status: Get_Status,
    }

    function Get_Status() {
        var request = $http({
            method: 'GET',
            url: '/api/CTE_BOT',
        })
        return request.then(handleSuccess, handleError)
    }
    function handleSuccess(response) {
        return response
    }

    function handleError(response) {
        return response
    }
})
