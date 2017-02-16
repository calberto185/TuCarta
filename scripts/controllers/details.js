'use strict';

/**
 * @ngdoc function
 * @name appApp.controller:DetailsCtrl
 * @description
 * # MainCtrl
 * Controller of the appApp
 */
angular.module('appApp')
  .controller('DetailsCtrl', function (fb, $scope, $location, DataResource, DataInfo, selectedRestaurant) {

   var url=getUid($location.path());
   console.log(url.name);

     
     // var reference=fb.database().ref('restaurants').once('value').then(function(query){
     //   $scope.$apply(function(){
     //     $scope.DataMaps=query.val();
     //    $scope.pinterest=query.exportVal()
     //   });
     //  });

    $scope.dataInfo=DataInfo.info;
    $scope.galeria=DataInfo.galery;
    var DataRestaurant=selectedRestaurant.getData();
    if (DataRestaurant === null) {
      $location.path('/');
    }else{
      //console.log(DataRestaurant);
      $scope.restaurantDetails=DataRestaurant;
      $scope.tipesRestaurant=converter(DataRestaurant.tipoRestaurant);
      $scope.tipesCocina=converter(DataRestaurant.tipoCocina);
      $scope.tipesAmbiente=converter(DataRestaurant.tipoAmbiente);
      $scope.tipespyments=converter(DataRestaurant.tipoPago);
      function converter(data){
        return data.split(',');
      }

      /*try{
       var reference=fb.database().ref('galeria/'+DataRestaurant.id);
       if (reference.catch !== undefined) {

          reference.once('value').then(function(query){
           $scope.$apply(function(){
            console.log(query.val());
             $scope.DataMaps=query.val();
             $scope.pinterest=query.val();
           });
          });

       }
       console.log(reference.catch);
      }catch(e){console.log(e);}*/

    }

    
   angular.element(document).ready(function(){
      
      $('.autoplayHome-3').slick({
          centerMode: true,
          centerPadding: '60px',
          slidesToShow: 3,
          slidesToScroll: 1,
          autoplay: true,
          autoplaySpeed: 2000,
          lazyLoad: 'ondemand',
          responsive: [
            {
              breakpoint: 768,
              settings: {
                arrows: false,
                centerMode: true,
                centerPadding: '0px',
                slidesToShow: 2
              }
            },
            {
              breakpoint: 480,
              settings: {
                arrows: false,
                centerMode: true,
                centerPadding: '0px',
                slidesToShow: 1
              }
            }
          ]
        });
    });


  });

function getUid(url){
  var arr=url.split('/');
  return {id:arr[arr.length-1], name: arr[arr.length-2]};
}