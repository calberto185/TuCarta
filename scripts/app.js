'use strict';

/**
 * @ngdoc overview
 * @name appApp
 * @description
 * # appApp
 *
 * Main module of the application.
 */
angular
  .module('appApp', [
    'ngAnimate',
    'ngAria',
    'ngCookies',
    'ngMessages',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    //'ngTouch',
    'ngMaterial',
    'firebase',
    //'GoogleMapsNative',
    'ngMdIcons',
    'slick'
  ])
  .config(function($mdThemingProvider) {
   $mdThemingProvider.definePalette('DensidadRed', {
    '50': 'ffebee',
    '100': 'ffcdd2',
    '200': 'ef9a9a',
    '300': 'e57373',
    '400': 'ef5350',
    '500': 'f44336',
    '600': 'e53935',
    '700': 'd32f2f',
    '800': 'c62828',
    '900': 'b71c1c',
    'A100': 'ff8a80',
    'A200': 'ff5252',
    'A400': 'ff1744',
    'A700': 'd50000',
    'contrastDefaultColor': 'light',   

    'contrastDarkColors': ['50', '100', 
     '200', '300', '400', 'A100'],
    'contrastLightColors': undefined    
  });

  $mdThemingProvider.theme('default')
    .primaryPalette('DensidadRed',{
      'hue-3':'50'
    })
    .accentPalette('pink')
    .warnPalette('orange');

  })
  .factory('fb', function(){
    var config = {
    apiKey: "AIzaSyAEMmYxmiDnRPN4cnJmwgdVA52OIII8n4A",
    authDomain: "tucarta-e008c.firebaseapp.com",
    databaseURL: "https://tucarta-e008c.firebaseio.com",
    storageBucket: "tucarta-e008c.appspot.com",
    messagingSenderId: "913225178904"
    };
    firebase.initializeApp(config);
    return firebase;
  })

  .constant('DataInfo',{
    'info':[
    {title:'Platos a la Carta', imagen:'cooker.svg', description:'Elige tu tipo de comida favorita (Por ejemplo, Comida Peruana, Pasta Argentina, Orgánico, Pescado,...)'},
    {title:'Localización', imagen:'map.svg', description:'Tu Carta te permite localizar Restaurantes, que en este momento esten preparanto lo que a ti te gusta.'},
    {title:'Ahorra Tiempo', imagen:'square.svg', description:'Tu Carta te permite ahorrar tiempo, al momento de contactar con los clientes, puesto que dispone de una gran variedad de platos a la carta, donde podra disfrutar de comida según tus especificaciones, para un ocasión especial o a diario.'}
    ],'galery':[
      {font:'_1.jpeg', name:'font '},
      {font:'_2.jpeg', name:'font '},
      {font:'_3.jpeg', name:'font '},
      {font:'_4.jpeg', name:'font '},
      {font:'_5.jpeg', name:'font '},
      {font:'_6.jpeg', name:'font '},
      {font:'_7.jpeg', name:'font '},
      {font:'_8.jpeg', name:'font '},
      {font:'_9.jpeg', name:'font '},
      {font:'_10.jpeg', name:'font '}
    ]
})
  .directive('mdRestaurantMaps', function(getLocation){
    return {
      restrict: 'E',
      scope:{
        idmapa:'@',
        setLatitud: '=',
        setLongitud: '=',
        setName: '=',
        zoom:'@',
        controls: '@',
        data: '=',
        heightMap: '=',
        widthMap: '@'
      },
      template: 
      '<div id="{{idmapa}}" style="height: 400px;" layout="column" layout-align="center stretch"></div>'+
      //'<div id="{{idmapa}}"  layout="column" layout-align="center stretch"></div>'+
      '<div layout="column" layout-align="center stretch" flex ng-show="{{controls}}">'+
          '<div hide-sm hide-xs flex>'+
            '<md-input-container>'+
              '<label>Latitud</label>'+
              '<input ng-model="latitud" type="text" name="latitud" ng-value="setLatitud">'+
            '</md-input-container>'+
            '<md-input-container>'+
              '<label>Longitud</label>'+
              '<input ng-model="longitud" type="text" name="longitud" ng-value="setLongitud">'+
            '</md-input-container>'+
            '<md-button class="md-icon-button" aria-label="location_on" ng-click="location_on()">'+
              '<ng-md-icon icon="location_on" style="fill: #757575" size="33" layout="row" layout-align="end center"></ng-md-icon>'+
            '</md-button>'+
            '<md-button class="md-icon-button" aria-label="remove_location" ng-click="location_off()">'+
              '<ng-md-icon icon="delete" style="fill: #757575" size="33" layout="row" layout-align="end center"></ng-md-icon>'+
            '</md-button>'+
          '</div>'+
      '</div>',
      link:function (scope, elem, attr){
       // console.log(scope.heightMap);
        angular.element(document).ready(function(){
          var mapa;
          var marker;
          var markers=[];
          var Latlng={ lat: -9.097350712279063, lng:-78.5361099243164};
            

             scope.$watch(function(){
                return scope.data;
              },function(value){
                if (value !== undefined) {
                  console.log(value);
                  angular.forEach(value, function(item){
                    // markes({lat: item.latitud , lng: item.longitud});
                    var id=new google.maps.Marker({position: {lat: item.latitud , lng: item.longitud}, map: mapa, title: item.nombre, draggable: false});
                    //mapa.setCenter(id.getPosition());
                  });
                }
              });
          // window.setTimeout(function(){

            InitializeComponents();
              function InitializeComponents() {
                mapa = new google.maps.Map(document.getElementById(scope.idmapa), {
                  center: Latlng,
                  zoom: parseInt(scope.zoom),
                  mapTypeId: google.maps.MapTypeId.ROADMAP
                });
                 // marker=markes(Latlng);
                 // mapa.setCenter(marker.getPosition());
              };

              function markes(p){
                var marcador= new google.maps.Marker({position: p, map: mapa, title: scope.setName, draggable: false});
                markers.push(marcador);
                return marcador;
              };



              // if (scope.controls === true) {
                scope.$watch(function(){
                  return scope.restaurant;
                }, function(value){
                  marker=markes({lat: scope.setLatitud || -9.097350712279063, lng: scope.setLongitud || -78.5361099243164});
                  mapa.setCenter(marker.getPosition());
                });

                mapa.addListener('mousemove', function(event){
                 scope.$apply(function(){
                    scope.latitud=event.latLng.lat();
                    scope.longitud=event.latLng.lng();
                  });
                });
              var setMarker=false;
               mapa.addListener('click', function(event){
                if (setMarker===false) {
                  setMarker=true;
                  Latlng={
                    lat: event.latLng.lat(),
                    lng: event.latLng.lng()
                  };
                  marker=markes(Latlng);
                  scope.$apply(function(){

                    getLocation.setPlace({lat:event.latLng.lat(),log:event.latLng.lng()});
                    
                  });
                  window.setTimeout(function(){
                   mapa.setCenter(marker.getPosition());
                  },2000);
                }else{
                  setMarker=false;
                  scope.$apply(function(){
                    getLocation.setPlace({lat:0,log:0});
                  });
                  marker.setMap(null);
                }
                  
                });
              // }

          // },5000);

          scope.location_off=function(){
            for (var i = markers.length - 1; i >= 0; i--) {
              markers[i].setMap(null);
            }
          }
          
        });
      }
    }
  })
  .factory('getLocation', function(){
    var resource={
      data:undefined,
      setPlace:function(data){
        resource.data=data;
      },
      getPlace:function(){
        return resource.data;
      }
    };
    return resource;
  })
  .run(function($rootScope, fb, $cookieStore, $location, $log){

    angular.element(document).ready(function(){
      $('.autoplay-2').slick({
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 5000,
      });
    });

    $rootScope.$on('$routeChangeStart', function(event, next, current){
      if ($cookieStore.get('uid') === undefined || $cookieStore.get('uid')===null) {
        if (next.templateUrl==='views/home.html') {
          $location.path('/');
        }
        if (next.templateUrl==='views/login.html') {
          $location.path('/login');
        }
        /*if (next.templateUrl==='views/details.html') {
          $location.path('/details/:nombre/:id');
        }*/
      }
      else{
        $location.path('/home');
        if (next.templateUrl==='views/login.html' || next.templateUrl==='views/login.html') {
          $location.path('/home');
        }
      }
    })
    
  })
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl',
        controllerAs: 'main'
      })
      .when('/details/:nombre/:id', {
        templateUrl: 'views/details.html',
        controller: 'DetailsCtrl',
        controllerAs: 'details'
      })
      .when('/login', {
        templateUrl: 'views/login.html',
        controller: 'LoginCtrl',
        controllerAs: 'login'
      })
      .when('/home', {
        templateUrl: 'views/home.html',
        controller: 'HomeCtrl',
        controllerAs: 'home'
      })
      .otherwise({
        redirectTo: '/'
      });
  })
  .directive('scroll', function($window){
    return function(scope, element, attr){
      angular.element($window).bind("scroll", function(){
        if (this.pageYOffset >= this.screen.height) {
          console.log('mayor');
        }else{
          console.log('menor');

        }
      });
    }
  })
  .directive('header', function($location){
    return{
      restrict: 'EA',
      template:
    '<div style="background-color: rgba(0,0,0,0.7); display: inline-flex; position: fixed; z-index: 54564;  width: 100vw; height: 60px;" layout="row" flex>'+
      '<div layout="row" layout-align="center center" flex>'+
          '<img  ng-src="images/logo.svg"  class="md-avatar" alt="avatar" style="width: 60px; height: 60px; margin-left: 10px;">'+
        '<span hide-xs class="md-title" style="color: #fff;">TU CARTA</span>'+
      '</div>'+
      '<span  flex></span>'+
      '<div hide-xs layout="row"  class="md-toolbar-tools-bottom inset">'+
        '<span></span>'+
        '<div>'+
        '</div>'+
      '</div>'+
      '<span hide-xs flex></span>'+
      // '<div layout="column" layout-align="center stretch"  style="margin-right: 20px;" hide-sm hide-xs>'+
      //   '<md-button  aria-label="closed message" ng-click="tabs(1)" style="color: #fff;">Descargar App</md-button>'+
      // '</div>'+
      '<div layout="column" layout-align="center stretch"  style="margin-right: 20px;">'+
      '<md-button class="alert" aria-label="closed message" ng-click="login()" style="color: #fff;">Iniciar Sesión</md-button>'+
      '</div>'+
    '</div>',
    link:function(scope, element, attr){
      scope.login=function(){
        $location.path('/login');
      };
    }



    }
  });