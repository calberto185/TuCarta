'use strict';

/**
 * @ngdoc function
 * @name appApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the appApp
 */
angular.module('appApp')
  .controller('MainCtrl', function (fb, $scope, $location, $anchorScroll, DataResource, DataInfo, selectedRestaurant) {
    $scope.tabs=function(index){
      var newHash='tab-'+index;
      if ($location.hash()!==newHash) {
        $location.hash('tab-'+index);
      }else{
        $anchorScroll();
      }
    }
  	$scope.dataInfo=DataInfo.info;
  	$scope.galeria=DataInfo.galery;
    $scope.pinterest=[];
    // var tmp={};
    var reference=fb.database().ref('restaurants').once('value').then(function(query){
      $scope.$apply(function(){
  	   	//console.log(query.val());
        // tmp=query.val();
        $scope.DataMaps=query.val();
        $scope.pinterest=query.val();
      });
     });
    
    $scope.details=function(data){
      selectedRestaurant.setData(data);
      $location.path('/details/'+data.nombre+'/'+data.id);
      
        $anchorScroll();
      // console.log(data);
    }

    // $scope.$watch(function(){
    //   return tmp;
    // },function(value){
    //   console.log(value);
    // });



  })
  .factory('selectedRestaurant', function(){
    var selected={
      data:null,
      setData:function(data){
        selected.data=data; 
      },
      getData:function(){
        return selected.data; 
      }
    }
    return selected;
  });
