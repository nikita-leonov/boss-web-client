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
}]);

app.controller('submissionsController', function($scope, Submission) {
    $scope.updateSubmissionStates = function(submissions) {
        $scope.actionLabels = {}
        $scope.actionsVisibility = {}

        for (i = 0; i < submissions.length; i++) {
            var submission = submissions[i]
            
            var actionLabel
            switch(submission.status) {
                case 'CREATED': {
                    actionLabel = 'Assign'
                    break;
                }
                case 'ASSIGNED': {
                    actionLabel = 'Claim'                    
                    break;
                }
                case 'PENDING_ACCEPTANCE': {
                    actionLabel = 'Approve'                    
                    break;
                }
                case 'ACCEPTED': {
                    actionLabel = 'Start'                    
                    break;
                }
                case 'IN_PROGRESS': {
                    actionLabel = 'Complete'                    
                    break;
                }
                default: {
                    actionLabel = 'XYZ'
                }
            }            
            $scope.actionLabels[submission.id] = actionLabel
            
            var actionVisibility
            if ($scope.role == 'WORKER') {
                actionVisibility = (submission.status == 'CREATED' || submission.status == 'ASSIGNED')
            } else {
                actionVisibility = (submission.status == 'IN_PROGRESS' || submission.status == 'ACCEPTED' || submission.status == 'PENDING_ACCEPTANCE')
            }            
            $scope.actionsVisibility[submission.id] = actionVisibility
        }                
    }

    $scope.submissions = Submission.query($scope.updateSubmissionStates)
    
    $scope.isRecordVisible = function(record) {
        var result
        
        if ($scope.role == 'WORKER') {
            result = (record.status == 'CREATED' || record.status == 'ASSIGNED')
        } else {
            result = true
        }        

        return result
    }

    $scope.updateStatus = function(id) {
        Submission.get({ id: id }, function(submission) {
            var status            
            switch(submission.status) {
                case 'CREATED': {
                    status = 'ASSIGNED'
                    break;
                }
                case 'ASSIGNED': {
                    status = 'PENDING_ACCEPTANCE'                    
                    break;
                }
                case 'PENDING_ACCEPTANCE': {
                    status = 'ACCEPTED'                    
                    break;
                }
                case 'ACCEPTED': {
                    status = 'IN_PROGRESS'                    
                    break;
                }
                case 'IN_PROGRESS': {
                    status = 'COMPLETED'                    
                    break;
                }
            }
            
            submission.status = status
            submission.$update(function(submission) {
                for (i = 0; i < $scope.submissions.length; i++) { 
                    if ($scope.submissions[i].id == submission.id) {
                        $scope.submissions[i] = submission
                        $scope.updateSubmissionStates($scope.submissions)
                        $scope.$apply()
                        break;
                    }
                }
            })            
        });
    }
});
