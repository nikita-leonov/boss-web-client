var app = angular.module('app', ['ngRoute', 'ngResource']);

app.factory('Submission', function($resource) {
  return $resource('http://ec2-52-10-252-124.us-west-2.compute.amazonaws.com/api/submissions/:id',{}, {
    update: {
      method: 'PUT' // this method issues a PUT request
    }
  });
});

app.config(['$routeProvider',
  function($routeProvider) {
            $routeProvider
            .when('/', {
                templateUrl : 'templates/submissions.html',
                controller  : 'submissionsController'
            })
//            .when('/submissions/:id', {
//                templateUrl : 'templates/submission.html',
//                controller  : 'submissionController'
//            })
}]);

app.controller('submissionsController', function($scope, Submission) {
    $scope.submissions = Submission.query();
    $scope.isRecordVisible = function(record) {
        return (record.status == 'CREATED' || record.status == 'ASSIGNED')
    }
    $scope.updateStatus = function(id, status) {
        Submission.get({ id: id }, function(submission) {
            submission.status = status
            submission.$update(function(submission) {
                for (i = 0; i < $scope.submissions.length; i++) { 
                    if ($scope.submissions[i].id == submission.id) {
                        $scope.submissions[i] = submission
                        $scope.$apply()
                        break;
                    }
                }
            })            
        });
    }
});

app.controller('submissionController', function($scope, $routeParams, Submission) {
    $scope.submission = Submission.get({ id: $routeParams.id }, function(submission) {
        $scope.isCreated = (submission.status == "CREATED")
        $scope.isAssigned = (submission.status == "ASSIGNED")        
    });    
    $scope.assign = function() {
        $scope.submission.status = "ASSIGNED"
        $scope.submission.$update()        
    }
    $scope.claim = function() {
        $scope.submission.status = "PENDING_ACCEPTANCE"
        $scope.submission.$update()
    }
});

