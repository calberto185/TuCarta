'use strict';

/**
 * @ngdoc function
 * @name appApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the appApp
 */
angular.module('appApp')
  .controller('LoginCtrl', function ($scope, fb, $cookieStore, $location, $log, $mdToast, $timeout) {
  	var FormActive={
   			active:{'display':'block'},progress:{'display':'none'},
   			button:false,title:'Login'};
   	$scope.SignIn=function(data){
   		$scope.form={
   			active:{'display':'none'},progress:{'display':'block'},
   			button: true,title: 'Validando ...'};
      var ref=fb.auth();
   		ref.signInWithEmailAndPassword(data.email, data.password).then(function(onResolve){
        $scope.$apply(function(){
            $location.path('/home');
            $cookieStore.put('uid',ref.currentUser.uid);
            $cookieStore.put('email',ref.currentUser.email);
            $cookieStore.put('name',ref.currentUser.displayName);
            $cookieStore.put('photo',ref.currentUser.photoURL);
        });
      }).catch(function(error) {

        var errorMessage = error.message;
        $log.info(errorMessage);
        $mdToast.show(
          $mdToast.simple()
          .textContent(errorMessage)
          .position('bottom right')
          .action('ok')
          .hideDelay(5000));
      });
        $timeout(function(){
          $scope.form=FormActive;
        },6000);

   	}
  });
