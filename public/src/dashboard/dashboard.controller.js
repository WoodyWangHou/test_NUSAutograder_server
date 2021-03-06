(function(){
    angular.module('student')
    .controller('dashboardController',dashboardController);

    dashboardController.$inject = [
      '$state',
      'userInterfaceInitService',
      'instructorInterfaceInitService',
      '$rootScope',
      'STUDENT_STATE',
      'INSTRUCTOR_STATE',
      'ajaxUploadService',
      '$cookies',
      '$stateParams'
    ];
    function dashboardController(
      $state,
      userInterfaceInitService,
      instructorInterfaceInitService,
      $rootScope,
      STUDENT_STATE,INSTRUCTOR_STATE,
      ajaxUploadService,
      $cookies,
      $stateParams
      ){

      var $ctrl = this;

      $ctrl.logout = function(){
        var logoutPromise = ajaxUploadService.logout();
        logoutPromise.then(function(res){
          $cookies.remove('token');
          $state.go('login.form');
        },function(error){
          $state.go('login.form');
        });
      }

      $ctrl.$onInit = function(){
        $ctrl.userInfo = $cookies.get('username');
      }

      for(var key in STUDENT_STATE){
        if(STUDENT_STATE[key] == $state.current.name){
          $ctrl.menus = userInterfaceInitService.getStudentMenu($state.current.name);
          $ctrl.nav = userInterfaceInitService.getStudentNav($state.current.name);
          $ctrl.userInfo = userInterfaceInitService.getName();
        }
      }
      for(var key in INSTRUCTOR_STATE){
        if(INSTRUCTOR_STATE[key] == $state.current.name){
          $ctrl.menus = instructorInterfaceInitService.getInstructorMenu($state.current.name);
          $ctrl.nav = instructorInterfaceInitService.getInstructorNav($state.current.name);
          $ctrl.userInfo = instructorInterfaceInitService.getName();
        }
      }

      $rootScope.$on('$stateChangeSuccess', function(event,toState,toParams,fromState,fromParams){
        for(var key in STUDENT_STATE){
          if(STUDENT_STATE[key]==toState.name){
            $ctrl.menus = userInterfaceInitService.getStudentMenu(toState.name);
            $ctrl.nav = userInterfaceInitService.getStudentNav(toState.name);
          }
        }
        for(var key in INSTRUCTOR_STATE){
          if(INSTRUCTOR_STATE[key]==toState.name){
            $ctrl.menus = instructorInterfaceInitService.getInstructorMenu(toState.name);
            $ctrl.nav = instructorInterfaceInitService.getInstructorNav(toState.name);
          }
        }
    });

    }

})();
