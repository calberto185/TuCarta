'use strict';

/**
 * @ngdoc function
 * @name appApp.controller:HomeCtrl
 * @description
 * # HomeCtrl
 * Controller of the appApp
 */
angular.module('appApp')
  .constant('navbar',[
      {title:'home',icon:'event_seat'
      },{title:'platillos',icon:'local_dining'
      },{title:'Galeria',icon:'collections'
      },{title:'Mi Restaurante',icon:'restaurant'}])
  .factory('DataResource', function(){
    var resource={
      dataCliente:undefined,
      dataRestaurant:undefined,
      dataPlatillos:undefined,
      setCliente:function(data){
        resource.dataCliente=data;
      },
      setRestaurant:function(data){
        resource.dataRestaurant=data;
      },
      setPlatillos:function(data){
        resource.dataPlatillos=data;
      },
      setGaleria:function(data){
        resource.dataGaleria=data;
      },
      getCliente:function(){
        return resource.dataCliente;
      },
      getRestaurant:function(){
        return resource.dataRestaurant;
      },
      getPlatillos:function(){
        return resource.dataPlatillos;
      },
      getGaleria:function(){
        return resource.dataGaleria;
      }
    };
    return resource;
  })
  .controller('HomeCtrl', function ($scope, fb, $cookieStore, navbar, DataResource, stateRestaurant, uploadFile, getLocation, DataMultipleFile, DataInfo, $mdSidenav, $timeout, $mdToast, $mdConstant, $mdDialog, $log) {

  	//cargando usuarios
  	$scope.currentUser={
  		uid:$cookieStore.get('uid'),
  		email:$cookieStore.get('email'),
  		photo:$cookieStore.get('photo'),
  		name:$cookieStore.get('name'),
  	};
    // getUp of the elements for the view

    // end getup

    //edit perfil
    $scope.editPerfil=function(data){
      if (uploadFile.getFile()!==undefined) {
        var userFile=fb.storage().ref('clientes/'+$cookieStore.get('uid')+'/'+$cookieStore.get('uid'));
        var upfile=userFile.put(uploadFile.getFile().attach);
        upfile.on('state_changed', function(snapshot){

        }, function(error){
        $mdToast.show(
          $mdToast.simple()
          .textContent(error.message)
          .action('ok')
          .position('bottom right')
          .hideDelay(5000));
        }, function(){
          userFile.getDownloadURL().then(function(url){
            $scope.$apply(function(){
              data.imagen=url;
              update(data);
            });
          })
          .catch(function(error){
            $mdToast.show(
              $mdToast.simple()
              .textContent(error.message)
              .action('ok')
              .position('bottom right')
              .hideDelay(5000));

            })
        });
      }else{
        update(data);
      }
      function update(data){
        fb.database().ref('clientes/'+$cookieStore.get('uid')).update(data)
        .then(function(onResolve){
          $scope.$apply(function(){
          $mdToast.show(
            $mdToast.simple()
            .textContent('Tu perfil actualizado.')
            .action('ok')
            .position('bottom right')
            .hideDelay(5000));
          });
        }).catch(function(error){
          $mdToast.show(
            $mdToast.simple()
            .textContent(error.message)
            .action('ok')
            .position('bottom right')
            .hideDelay(5000));
        });
      }
    }


    $scope.editRestaurant=function(data){
      console.log(data);
    }

  	//toogle Navbar
  	$scope.MenuBar=buildToggler('left');
    function buildToggler(componentId) {
      return function() {
        $mdSidenav(componentId).toggle();
      };
    };

    //links for the menu main
    $scope.items=navbar;
    //redirect to template original
    $scope.link=function($index, op){
      $scope.title=op;
      $scope.tabLink=$index;
    };



    // getUp of the elements for the view  
    var rest=undefined;
    var reference=fb.database().ref();
    reference.child('clientes/'+$cookieStore.get('uid')).once('value')
      .then(function(onResolve){
        if (onResolve) {
          $timeout(function(){
            $scope.$apply(function(){ 
              DataResource.setCliente(onResolve.val());
              reference.child('platosrestaurant/'+onResolve.val().id_restaurant).once('value')
              .then(function(resolve){
                $scope.$apply(function(){

                  if (resolve.val()===null) {
                    DataResource.setPlatillos(false);
                  }else{
                    DataResource.setPlatillos(resolve.val());
                  }

                  reference.child('restaurants/'+onResolve.val().id_restaurant).once('value')
                  .then(function(query){
                    $scope.$apply(function(){
                      if (query.val()===null) {
                        DataResource.setRestaurant(false);
                      }else{
                        DataResource.setRestaurant(query.val());
                      }
                      reference.child('galeria/'+onResolve.val().id_restaurant).once('value').then(function(snapshot){
                        $scope.$apply(function(){
                          if (snapshot.val()===null || snapshot.val()===undefined) {
                            DataResource.setGaleria(false);
                          }else{
                            DataResource.setGaleria(snapshot.val());
                          }
                        });
                      })
                    });
                  });

                });
              });
            });
          },600);
          
        }
      })
      .catch(function(error){
        console.log(error);
        $mdToast.show(
          $mdToast.simple()
          .textContent(error.message)
          .action('ok')
          .position('bottom right')
          .hideDelay(5000));
      });

    // this listens to clients changes
      $scope.$watch(function(){
        return DataResource.getCliente();
      }, function(val){
        if (val!==undefined) {
          $cookieStore.put('restaurant',val.id_restaurant);
          $scope.perfil=val;
        }
      });

      // this listens to platillos changes
      $scope.$watch(function(){
        return DataResource.getPlatillos();
      }, function(val){
        if (val!==undefined) {
          $scope.ItemLoading=false;
          var tmp=[];
          angular.forEach(val, function(value){
            tmp.push(value);
          });
          $scope.platillos=val;
        }else{
          $scope.ItemLoading=true;
        }
      });


      // this listens to restaurant changes
      $scope.$watch(function(){
        return DataResource.getRestaurant();
      }, function(val){
        if (val!==undefined) {
          if (val===false) {
            //$scope.tabLink=3;
            Dialog($scope, $mdDialog, 'AlertConfigRestaurant.tmpl.html');
          }else{
            //$scope.restaurante=val;
            var tmp={};
            tmp = val;
            /*tmp.tipoRestaurant=(val.tipoRestaurant).split(',');
            tmp.tipoCocina=(val.tipoCocina).split(',');
            tmp.tipoPago=(val.mediosDePago).split(',');
            tmp.tipoAmbiente=(val.ambientes).split(',');

            if (angular.isObject(chip)) {
              return chip;
            }*/
            if (val.length !== 0) {
              tmp.tipoRestaurant=rebuild(val.tipoRestaurant);
              tmp.tipoCocina=rebuild(val.tipoCocina);
              tmp.tipoPago=rebuild(val.tipoPago);
              tmp.tipoAmbiente=rebuild(val.tipoAmbiente);
                function rebuild(val){
                  var data=[];
                  val=val.split(',');
                  angular.forEach(val, function(value){
                    data.push({name: value});
                  });
                return data;
              }
              console.log(tmp);
            }
            $scope.restaurant=tmp;

            console.log(val);
            
          }
            $scope.loadingMain=!$scope.loadingMain;
        }else{
          console.log(val);
        }
      });




      // this listens to galeria changes
      $scope.$watch(function(){
        return DataResource.getGaleria();
      }, function(val){
        if (val!==undefined) {
          $scope.galeriaRestaurant=val;
        }
        console.log(val);
      });


    // end getup
 $scope.people = [
    { name: 'Janet Perkins', img: 'images/icons/user.svg', newMessage: true },
    { name: 'Mary Johnson', img: 'images/icons/user.svg', newMessage: false },
    { name: 'Peter Carlsson', img: 'images/icons/user.svg', newMessage: false },
    { name: 'Janet Perkins', img: 'images/icons/user.svg', newMessage: true },
    { name: 'Mary Johnson', img: 'images/icons/user.svg', newMessage: false },
    { name: 'Peter Carlsson', img: 'images/icons/user.svg', newMessage: false },
    { name: 'Janet Perkins', img: 'images/icons/user.svg', newMessage: true },
    { name: 'Mary Johnson', img: 'images/icons/user.svg', newMessage: false },
    { name: 'Peter Carlsson', img: 'images/icons/user.svg', newMessage: false }
  ];
    // new platillo
    $scope.new=function(op){
        $scope.botonVisible=false;
        if ($scope.menu.ingredientes !== undefined) {
          $scope.menu.ingredientes=($scope.menu.ingredientes).toString();
        }
        $scope.menu=[];
        $scope.menu={ingredientes:[]};
        $scope.menu.imagen=null;
        $scope.editPlatillo= !$scope.editPlatillo;
        $scope.tabLink=1;
    };

    // here we modify the platillos
    $scope.action=function(op, $index, data){
      $scope.menu.ingredientes=data.ingredientes.toString();
      $scope.editPlatillo= !$scope.editPlatillo;
      data.ingredientes=data.ingredientes.split(',');
      $scope.menu=data;
      $scope.botonVisible=true;
        
    }

    // following with modify of platillos we selected one of the two option new or save
    $scope.OptionPlatillo=function(op, index, data){
        var tmpData={};
        angular.copy(data, tmpData);
        if (op=== 'new' || op=== 'save') {
          tmpData.ingredientes=keySpace(', ',null,tmpData.ingredientes);
        }
        $scope.Platilloloading=false;
      switch(op){
        case 'new':
          tmpData.imagen=uploadFile.getFile().name;
          if (tmpData.estado===undefined) {
            tmpData.estado=false;
          }

        break;
        case 'save':

        break;
        case 'remove':
          console.log('remover');
          break;
        case 'state':
          console.log('estado');
          break;
      }

      var reference=fb.database().ref('platosrestaurant/'+DataResource.getCliente().id_restaurant);
      reference.once('value').then(function(answer){

        var numero;
        var children;
        if (op==='new') {
          if (!answer.hasChildren()) {
            numero='0000000000';
          }else{
            numero=answer.numChildren();
          }
          children=nodo((numero).toString());
          tmpData.id=children;
        }else{
          children=index;
        }
        
        if (op==='new' || op==='save') {
          if (uploadFile.getFile()!==undefined) {

            var refParent='platillos/'+$cookieStore.get('uid')+'/'+children;
            var storage=fb.storage().ref();
            var uploadTask=storage.child(refParent).put(uploadFile.getFile().attach);
            uploadTask.on('state_changed', function(snapshot){

            }, function(error){
              $mdToast.show(
                $mdToast.simple()
                .position('bottom right')
                .textContent(error.message)
                .hideDelay(5000));
              $timeout(function(){
                  $scope.Platilloloading = !$scope.Platilloloading;
              },5000);

            }, function(){
              fb.storage().ref(refParent).getDownloadURL().then(function(url){
                  tmpData.imagen=url;
                  reference.child(children).set(tmpData);
                $scope.$apply(function(){
                  $scope.Platilloloading = !$scope.Platilloloading;
                  $scope.editPlatillo= !$scope.editPlatillo;
                });
              }).catch(function(error){
                $mdToast.show(
                  $mdToast.simple()
                  .position('bottom right')
                  .textContent(error.message)
                  .hideDelay(5000));
                $timeout(function(){
                  $scope.Platilloloading = !$scope.Platilloloading;
                },5000);

              });
            });

          }else{
            reference.child(children).set(tmpData);
            $timeout(function(){
              $scope.$apply(function(){
                $scope.Platilloloading = !$scope.Platilloloading;
              },5000);
            });
          }
          
        }else if (op==='state'){
          console.log(op);
          reference.child(children).child('estado').set(tmpData.estado);
          $scope.Platilloloading = !$scope.Platilloloading;
        }else if (op==='remove'){
          reference.child(children).remove();
          $scope.Platilloloading = !$scope.Platilloloading;
        }
        


      }).catch(function(err){
        console.log(err.message);
        $mdToast.show(
          $mdToast.simple()
          .position('bottom right')
          .textContent('Hubo problemas al guardar los datos')
          .hideDelay(5000));
        $timeout(function(){
          $scope.Platilloloading = !$scope.Platilloloading;
        },5000);
          
      });


      // here is the change for the list  of data resource, in this's four called:
      // added, changed, removed, moved
      reference.on('child_added', function(snapshot){
        reference.once('value')
        .then(function(onResolve){
          DataResource.setPlatillos(onResolve.val());
        })
        .catch(function(error){
          console.log(error);
        });
      });
      reference.on('child_changed', function(snapshot){
        reference.once('value')
        .then(function(onResolve){
          DataResource.setPlatillos(onResolve.val());
        })
        .catch(function(error){
          console.log(error);
        });
      });
      reference.on('child_removed', function(snapshot){
        reference.once('value')
        .then(function(onResolve){
          DataResource.setPlatillos(onResolve.val());
        })
        .catch(function(error){
          console.log(error);
        });
      });
      reference.on('child_moved', function(snapshot){
        reference.once('value')
        .then(function(onResolve){
          DataResource.setPlatillos(onResolve.val());
        })
        .catch(function(error){
          console.log(error);
        });
      });




    }

    // this data are for default for the card
    $scope.card={
      nombre:'Nombre de Platillo',
      src:'images/icons/menu.svg',
      descripcion: "Aquí contiene una breve descripcion del platillo, y tambien la lista de ingredientes con que fue preparado dicho platillo. Al lado derecho esta el precio del platillo."
    };


    // commands for mdchips
    $scope.keys = [$mdConstant.KEY_CODE.ENTER, $mdConstant.KEY_CODE.COMMA];
    $scope.readonly = false;
    $scope.menu={ingredientes:[]};

    // this listens to configRestaurants changes
    
      $scope.$watch(function(){
        return stateRestaurant.getOption();
      }, function(val){
        if (val!==undefined) {
          if (val===true) {
            $scope.tabLink=3;
          }else{
            //$scope.viewconfig=!$scope.viewconfig;
            $scope.configRestaurantAlert=true;
          }
        }
      });


    // code maps
      $scope.$watch(function(){
        return getLocation.getPlace();
      }, function(val){
        if (val!==undefined) {
          $scope.restaurant.latitud=getLocation.getPlace().lat;
          $scope.restaurant.longitud=getLocation.getPlace().log;
        }
      })

    //

    $scope.viewSearch=function(){
      $scope.tabLink=1;
    }

    // select current views for restaurant 
      $scope.currentViewRestaurant=['chef', 'service', 'share', 'gps', 'landscape', 'save'];
      angular.element(document.querySelector('#number-0')).css({'opacity':'1'});
      var tmpData={};
    $scope.pass=function(index, data){
      if (getLocation.getPlace()!==undefined) {
        var location={latitud:getLocation.getPlace().lat,longitud:getLocation.getPlace().log};
        angular.copy(location, tmpData);
      }
      $scope.part=index;
        if (index===5) {
          // var tmpl=$scope.restaurant;
          // tmpl.tipoRestaurant=typeServices(tmpl.tipoRestaurant);
          // tmpl.tipoCocina=typeServices(tmpl.tipoCocina);
          // tmpl.tipoAmbiente=typeServices(tmpl.tipoAmbiente);
          // tmpl.tipoPago=typeServices(tmpl.tipoPago);
          //  function typeServices(data){
          //     var tmp="";
          //     var space=", ";
          //     angular.forEach(data, function(value,key){
          //       if (key===data.length-1) {
          //         space="";
          //       }
          //       tmp=tmp+value.name+space;
          //     })
          //     return tmp;
          //   }
          // console.log(tmpl);
          $scope.RestaurantTransaccion=0;
          $scope.RestaurantText='Cargando';

            $scope.configAllRestaurant=!$scope.configAllRestaurant;
            data.tipoRestaurant=typeServices(data.tipoRestaurant);
            data.tipoCocina=typeServices(data.tipoCocina);
            data.tipoAmbiente=typeServices(data.tipoAmbiente);
            data.tipoPago=typeServices(data.tipoPago);

            function typeServices(data){
              var tmp="";
              var space=", ";
              angular.forEach(data, function(value,key){
                if (key===data.length-1) {
                  space="";
                }
                tmp=tmp+value.name+space;
              })
              return tmp;
            }
            //console.log(data);
            if(uploadFile.getFile()!== undefined){
              if (uploadFile.getFile().attach ==="restaurante") {
                data.id=DataResource.getCliente().id_restaurant;
                   var refStg=fb.storage().ref('restaurants/'+$cookieStore.get('uid'));
                    var refLogo=refStg.child($cookieStore.get('uid'));
                    refLogo.put(uploadFile.getFile().attach).on('state_changed', function(snapshot){
                      var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                      $scope.RestaurantTransaccion=progress;
                    },function(error){
                      $mdToast.show(
                        $mdToast.simple()
                        .position('bottom right')
                        .textContent('Hubo problemas al guardar los datos')
                        .hideDelay(5000));

                    },function(){
                      refLogo.getDownloadURL().then(function(url){
                        data.imagen=url;
                        agregarData(data);
                      }).catch(function(error){
                            $scope.RestaurantFinal=true;
                            $scope.RestaurantImagen='images/icons/error.svg';
                            $scope.RestaurantTextFinal=error;

                      });

                  });
                
              }

            }else{
              agregarData(data);
            }
          
        }

          function agregarData(data){
            fb.database().ref('restaurants/'+DataResource.getCliente().id_restaurant).set(data).then(function(onResolve){
              $timeout(function(){
                $scope.RestaurantFinal=true;
                $scope.RestaurantImagen='images/icons/success.svg';
                $scope.RestaurantTextFinal='Los Datos se Guardaron Exitosamente';
              },9000);
              $scope.$apply(function(){
                $timeout(function(){
                  $scope.configAllRestaurant=!$scope.configAllRestaurant;
                  $scope.part=0;
                },10000);
              });
            }).catch(function(error){
              $scope.RestaurantFinal=true;
              $scope.RestaurantImagen='images/icons/error.svg';
              $scope.RestaurantTextFinal=error;
              $mdToast.show(
                $mdToast.simple()
                .position('bottom right')
                .textContent('Hubo problemas al guardar los datos')
                .hideDelay(5000));
            });
          }

          RunItem($scope);

    }

    $scope.$watch(function(){
      return $scope.restaurante;
    }, function(val){
      if (val!==undefined) {
        //console.log(val);
      }
    })








    

    // end code maps

    $scope.$watch(function(){
      return DataMultipleFile.getFileMultiple();
    },function(val){
      angular.forEach(val, function(value){
        console.log(value);
      });
    });

    //images for the item galery in to navbar
    $scope.galeria=DataInfo.galery;
    // this is the carousel for galery

    angular.element(document).ready(function(){
      $('.autoplayHome').slick({
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
                centerPadding: '40px',
                slidesToShow: 2
              }
            },
            {
              breakpoint: 480,
              settings: {
                arrows: false,
                centerMode: true,
                centerPadding: '40px',
                slidesToShow: 1
              }
            }
          ]
        });
      });
    $scope.ProgressVisible=true;
    $scope.Progress=56;
    $scope.ProgressText='Cargando';
    $scope.ProgressImage='images/icons/error.svg';
    $scope.StateFinally=false;
    $scope.stateTexto='Datos guardados satistactoriamente !!!';

  })
  .filter('myFilter', function(){
    return function(outside, inside){
      var tmp=[];
      angular.forEach(outside, function(val){
        if (!(angular.lowercase(val.nombre)).indexOf(angular.lowercase(inside))) {
          tmp.push(val);
        }
      });
      return (tmp.length===0)?outside:tmp;
    }
  })
  .filter('estado', function(){
    return function(dato){
      return (!dato)?'publicar':'no publicar';
    };
  })
  .directive('ngSignOut', function(){
    return {
      restrict: 'A',
      controller: function(fb, $scope, $cookieStore, $location, $log){
        //SignOut
        $scope.SingOut=function(){
          fb.auth().signOut().then(function() {
            $scope.$apply(function(){
              //$location.path('/');
              $cookieStore.remove('uid','');
              $cookieStore.remove('email','');
              $cookieStore.remove('name','');
              $cookieStore.remove('photo','');
              window.location.reload();

              console.log('SignOut successful.');
            });
          }, function(error) {
            $log.info(error.message);
          });
        };
      }
    }
  })




  .directive('tabConfiguration', function(){
    return {
      restrict: 'E',
      templateUrl: 'tabConfiguration.tmpl.html'
    }
  })





  .directive('mdOpenFile', function(uploadFile, $templateRequest){ //directive for upload files
    return {
      restrict: 'E',
      scope:{
        match:'@',
        type:'@',
        label:'@',
        icon:'@',
        tooltip:'@',
        model:"=",
        tooltip_position:'@'
      },
      template: 
            '<div layout="row">'+
              '<input type="file" id="attachFile" class="ng-hide">'+
              '<div layout="row" ng-show="type=='+"'input'"+'">'+
                '<md-button class="md-icon-button" aria-label="attach file" ng-click="toAttach()">'+
                  '<ng-md-icon icon="{{icon}}" style="fill:#757575" size="33" layout="row" layout-align="center center"></ng-md-icon>'+
                  '<md-tooltip md-direction="tooltip_position">{{tooltip}}</tooltip>'+
                '</md-button>'+
                '<md-input-container flex>'+
                  '<label>{{label}}</label>'+
                  '<input type="text" name="url" ng-model="url" ng-value="model" required>'+
                  '<span class="md-caption" style="color:#757575">Solo en formato .png, no mayor a 500 KBytes !!!</span>'+
                  //'<span class="md-caption" style="color:red" ng-show="validation">Solo en formato .png, no mayor a 500 KBytes !!!</span>'+
                '</md-input-container>'+
              '</div>'+
              '<div ng-show="type=='+"'imagen'"+'">'+
                '<div style="width:210px; height:210px;"  ng-click="toAttach()" layout="column" layout-align="center center">'+
                '<md-icon md-svg-src="{{svg_uri}}" style="color: #f00;width:100px;height:100px;" aria-label="menu"></md-icon>'+
                '<md-tooltip md-direction="tooltip_position">{{tooltip}}</tooltip>'+
                '</div>'+
                '<span class="md-caption" style="color:red" ng-show="validation">Solo en formato .png, no mayor a 500 KBytes !!!</span>'+
              '</div>'+
            '</div>',
      link: function(scope, element, att){
        if (scope.icon.indexOf('images/')===0) {
          $templateRequest(scope.icon);
          scope.svg_uri=scope.icon;
        };
        var input = angular.element(element[0].querySelector('#attachFile'));
        var files;
        scope.toAttach=function(){
          input[0].click();
        };
        input.bind('change', function(e) {
          files = e.target.files[0];
          scope.$apply(function(){
            if (files!==undefined) {
              if (files.type.indexOf('image/png')===0 && parseInt(files.size)<=500000) {
                uploadFile.setFile({attach:files, relation:scope.match});
                scope.url=files.name;
                scope.validation=false;
              }else{
                scope.validation=true;
                scope.url='';
                files='';
              }
            }
          });
        });
      }
    };
  })
  .factory('uploadFile', function(){
    var context={
      file:undefined,
      setFile:function(file){
        context.file=file;
      },
      getFile:function(){
        return context.file;
      }
    }
    return context;
  })
  .directive('mdViewPhoto', function(uploadFile){
    return {
      restrict: 'E',
      scope:{
        match:'@'
      },
      controller:function($scope, uploadFile){
        $scope.$watch(function(){
          return uploadFile.getFile();
        }, function(file){
          if (file!==undefined && uploadFile.getFile().relation===$scope.match) {
            var id=angular.element(document.querySelector('#viewImage'));
            console.log("height: "+id[0].naturalHeight+" px");
            console.log("width: "+id[0].naturalWidth+" px");
            var reader= new FileReader();
            reader.onload=function(e){
              id.attr('src', e.target.result);
            };
            reader.readAsDataURL(uploadFile.getFile().attach);
          }
        });

      }
    }
  })
  .directive('ngViewPhoto', function(uploadFile){
    return {
      restrict: 'E',
      template: '<img id="pre" class="md-card-image" src="{{url}}" alt="{{name}}" style="width: {{width}}px; height: {{height}}px; border-radius:{{radius}}px"; >',
      scope:{
        match:'@',
        url: '@',
        name: '@',
        width: '@',
        height: '@',
        radius: '@'
      },
      link:function(scope, elem, attr){
        scope.$watch(function(){
          return uploadFile.getFile();
        }, function(file){
          if (file!==undefined && uploadFile.getFile().relation===scope.match) {
            var id=angular.element(elem[0].querySelector('#pre'));
            console.log("height: "+id[0].naturalHeight+" px");
            console.log("width: "+id[0].naturalWidth+" px");
            var reader= new FileReader();
            reader.onload=function(e){
              id.attr('src', e.target.result);
            };
            reader.readAsDataURL(uploadFile.getFile().attach);
          }
        });

      }
    }
  })
  // .directive('mdOpenFileMultiple', function(uploadFile, $compile, DataMultipleFile){
  //   return {
  //     restrict: 'E',
  //     scope:{
  //       match:'@'
  //     },
  //     template: '<div id="CreateContext" layout="row" layout-wrap></div>',
  //     link: function(scope, elem, attr){
  //       var context=angular.element(elem[0].querySelector('#CreateContext'));
  //       var data=[];
  //       scope.$watch(function(){
  //         return uploadFile.getFile();
  //       }, function(val){
  //         if (val!==undefined  && uploadFile.getFile().relation===scope.match) {
  //             var reader= new FileReader();
  //             reader.onload=function(e){
  //               var cadena='<div id="img-'+(data.length-1).toString()+'" style="margin:5px;">'+
  //                             '<div layout="row" layout-align="space-between">'+
  //                               '<div class="md-media-xl card-media" style="background-image: url('+"'"+((e.target.result)).toString()+"'"+');'+
  //                               'background-position: center center; background-repeat: no-repeat; background-size: 100% 100%;  width:384px; height:216px;">'+
  //                                 '<div layout="row" class="info-Delete"layout-align="center center" style="height: inherit;">'+
  //                                   '<div layout="column" layout-align="center center">'+
  //                                      '<div layout="row" layout-align="center center"  ng-click="remove('+(data.length-1).toString()+')" style="outline:0px; cursor: pointer;">'+
  //                                       '<md-button class="md-icon-button" aria-label="remove image">'+
  //                                         '<ng-md-icon icon="delete" style="fill:#ffffff" size="33" layout="row" layout-align="center center"></ng-md-icon>'+
  //                                       '</md-button>'+
  //                                       '<span class="md-caption" style="color:#fff">Eliminar</span>'+
  //                                     '</div>'+
  //                                   '</div>'+
  //                                 '</div>'+
  //                               '</div>'+
  //                             '</div>'+ 
  //                             '</div>';
  //             context.append($compile(cadena)(scope));
  //             };
  //             reader.readAsDataURL(val.attach);

  //             data.push({getImage:val.attach, getId:(data.length).toString()});
  //             console.log(data);
  //         }
  //       });

  //       scope.$watch(function(){
  //         return data
  //       }, function(value){
  //         DataMultipleFile.setFileMultiple(value);
  //       });
  //       var tmp=data;
  //       // var IndexRemove=-1;
  //       scope.remove=function(num){ 
  //         // IndexRemove=num;
  //         console.log(num);
  //         console.log(data);
  //         angular.forEach(tmp, function(value, key){
  //           console.log(key+" - "+value.getId+" - "+num);
  //           if ( num === parseInt(value.getId)) {
  //             angular.element(document.querySelector('#img-'+(num).toString())).css({'display':'none'});
  //             data.splice(key,1);
  //           }
  //         });
  //         console.log(data);
  //       }

  //       // scope.$watch(function(){
  //       //   return IndexRemove;
  //       // }, function(index){
  //       //   angular.element(document.querySelector('#img-'+(index).toString())).css({'display':'none'});
  //       //   data.splice(index,1);
  //       //   console.log(data);
  //       // });


  //     }
  //   }
  // })

  .directive('mdOpenFileMultiple', function(uploadFile, $compile, DataMultipleFile, DataResource, fb, $cookieStore, $timeout, $mdToast){
    return {
      restrict: 'E',
      scope:{
        match:'@'
      },
      template: '<div id="CreateContext" layout="row" layout-wrap>'+
                  '<div id="img-{{$index}}" style="margin:5px;" ng-repeat="img in galery">'+
                    '<div layout="row" layout-align="space-between">'+
                      '<div class="md-media-xl card-media" style="background-image: url({{img.imagen}});'+
                      'background-position: center center; background-repeat: no-repeat; background-size: 100% 100%;  width:384px; height:216px;">'+
                        '<div layout="row" class="info-Delete" layout-align="center center" style="height: inherit;">'+
                          '<div layout="column" layout-align="center center">'+
                             '<div layout="row" layout-align="center center"  ng-click="remove('+"'server'"+',img.id)" style="outline:0px; cursor: pointer;">'+
                              '<md-button class="md-icon-button" aria-label="remove image">'+
                                '<ng-md-icon icon="delete" style="fill:#ffffff" size="33" layout="row" layout-align="center center"></ng-md-icon>'+
                              '</md-button>'+
                              '<span class="md-caption" style="color:#fff">Eliminar</span>'+
                             '</div>'+
                          '</div>'+
                        '</div>'+
                      '</div>'+
                    '</div>'+ 
                    '</div>'+
                  '</div>',
      link: function(scope, elem, attr){


        scope.$watch(function(){return DataResource.getGaleria();}, function(val){
          if (val !== undefined) {
            scope.galery=val;
          }
        });
        scope.remove=function(tipo, index){
          console.log(tipo+" - "+index);
          var reference= fb.database().ref('galeria/'+DataResource.getCliente().id_restaurant+"/"+index).set(null);
          upDateGalery(reference);
        }

       

        var context=angular.element(elem[0].querySelector('#CreateContext'));
        var data=[];
        scope.$watch(function(){
          return uploadFile.getFile();
        }, function(val){
          if (val!==undefined  && uploadFile.getFile().relation===scope.match) {
            console.log(val);
              var reader= new FileReader();
              // reader.onload=function(e){
              //   var cadena='<div id="img-'+(data.length-1).toString()+'" style="margin:5px;">'+
              //                 '<div layout="row" layout-align="space-between">'+
              //                   '<div class="md-media-xl card-media" style="background-image: url('+"'"+((e.target.result)).toString()+"'"+');'+
              //                   'background-position: center center; background-repeat: no-repeat; background-size: 100% 100%;  width:384px; height:216px;">'+
                                  

              //                     '<div layout="row" class="info-Delete" layout-align="center center" style="height: inherit;">'+
              //                       '<div layout="column" layout-align="center center">'+

              //                         // '<div layout="column" layout-align="center center">'+
              //                         //   '<div style="background:#38823c; border-radius: 15px; padding:4px;">'+
              //                         //     '<ng-md-icon icon="done" style="fill:#fff" size="66" layout="row" layout-align="center center"></ng-md-icon>'+
              //                         //   '</div>'+
              //                         //   '<span class="md-caption" style="color:#fff">Guardado</span>'
              //                         // '</div>'+

              //                          '<div layout="row" layout-align="center center"  ng-click="remove('+"'local'"+','+(data.length-1).toString()+')" style="outline:0px; cursor: pointer;">'+
              //                           '<md-button class="md-icon-button" aria-label="remove image">'+
              //                             '<ng-md-icon icon="delete" style="fill:#ffffff" size="33" layout="row" layout-align="center center"></ng-md-icon>'+
              //                           '</md-button>'+
              //                           '<span class="md-caption" style="color:#fff">Eliminar</span>'+
              //                          '</div>'+


              //                       '</div>'+
              //                     '</div>'+

              //                     //'<md-progress-linear md-mode="progresss" ng-hide="progressLiner('+(data.length-1).toString()+')"></md-progress-linear>'+

              //                   '</div>'+
              //                 '</div>'+ 
              //                 '</div>';
              //   context.append($compile(cadena)(scope));
              // };
              reader.readAsDataURL(val.attach);
              console.log(val);
              data.push({getImage:val.attach, getId:(data.length).toString()});
              var reference= fb.database().ref('galeria/'+DataResource.getCliente().id_restaurant);
                  reference.once('value').then(function(answer){
                    var numero; var children;
                      if (!answer.hasChildren()) {numero='0000000000';
                      }else{numero=answer.numChildren();}
                      children=nodo((numero).toString());
                    var storage=fb.storage().ref();
                    var uploadTask=storage.child('platillos/'+$cookieStore.get('uid')+"/"+children);
                    uploadTask.put(val.attach).on('state_changed', function(snapshot){
                      var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                      // scope.progresss=progress;
                    }, function(error){
                      $mdToast.show(
                        $mdToast.simple()
                        .position('bottom right')
                        .textContent(error.message)
                        .hideDelay(5000));
                    }, function(){    
                      fb.storage().ref('platillos/'+$cookieStore.get('uid')+"/"+children).getDownloadURL().then(function(url){
                        reference.child(children).set({id:children, imagen:url}).then(function(){
                          scope.$apply(function(){
                            console.log('guardado Exitosamente');
                          });
                        }).catch(function(error){
                          $mdToast.show(
                            $mdToast.simple()
                            .position('bottom right')
                            .textContent(error.message)
                            .hideDelay(5000));
                        });
                      }).catch(function(error){
                        $mdToast.show(
                          $mdToast.simple()
                          .position('bottom right')
                          .textContent(error.message)
                          .hideDelay(5000));
                        $timeout(function(){
                        },5000);
                      });
                    });
                  }).catch(function(error){
                    $mdToast.show(
                      $mdToast.simple()
                      .position('bottom right')
                      .textContent(error.message)
                      .hideDelay(5000));
                  });
                  upDateGalery(reference);
            }
        });



        
        function upDateGalery(reference){
          if (reference !== undefined) {
            reference.on('child_added', function(snapshot){
              reference.once('value')
              .then(function(onResolve){
                DataResource.setGaleria(onResolve.val());
              })
              .catch(function(error){
                console.log(error);
              });
            });
            reference.on('child_changed', function(snapshot){
              reference.once('value')
              .then(function(onResolve){
                DataResource.setGaleria(onResolve.val());
              })
              .catch(function(error){
                console.log(error);
              });
            });
            reference.on('child_removed', function(snapshot){
              reference.once('value')
              .then(function(onResolve){
                DataResource.setGaleria(onResolve.val());
              })
              .catch(function(error){
                console.log(error);
              });
            });
            reference.on('child_moved', function(snapshot){
              reference.once('value')
              .then(function(onResolve){
                DataResource.setGaleria(onResolve.val());
              })
              .catch(function(error){
                console.log(error);
              });
            });
          }
        }


        


      }  
    }
  })
  .factory('DataMultipleFile', function(){
    var context={
      data:undefined,
      setFileMultiple:function(data){    
        context.data=data;
      },
      getFileMultiple:function(){
        return context.data;
      }
    }
    return context;
  })
  .factory('stateRestaurant', function(){
    var context={
      op:undefined,
      setOption:function(op){
        context.op=op;
      },
      getOption:function(){
        return context.op;
      }
    }
    return context;
  })
  .directive('ngRestaurantFeatures', function(){
    return {
      restrict: 'E',
      scope: {
        type: '@',
        label: '@',
        model: '='
      },
      templateUrl: 'featuresRestaurnat.tmpl.html',
      controller:function($scope, $q, $timeout) {
        var data = [];
        try{
          $scope.model={};
        }catch(e){console.log(e)}

        $scope.readonly = false;
        $scope.selectedItem = null;
        $scope.searchText = null;
        $scope.querySearch = querySearch;
        switch ($scope.type){
          case 'restaurant':
              data = [
            {'name': 'sano'},
            {'name': 'argentino'},
            {'name': 'mar'},
            {'name': 'vegetariano'},
            {'name': 'chino'},
            {'name': 'parrilla'},
            {'name': 'restaurant bar'},
            {'name': 'mexicano'},
            {'name': 'comida rapida'},
            {'name': 'gourmet'},
            {'name': 'sushi'},
            {'name': 'española'},
            {'name': 'peruana'}
          ];
            break;
          case 'cocina':
              data = [
            {'name': 'peruana'},
            {'name': 'griega'},
            {'name': 'mexicana'},
            {'name': 'sana'},
            {'name': 'italiana'},
            {'name': 'vegetariana'},
            {'name': 'gourmet'},
            {'name': 'mexicano'},
            {'name': 'comida organica'},
            {'name': 'artesanal'},
            {'name': 'Sierra Peruana'},
            {'name': 'Costa Peruana'},
            {'name': 'Selva Peruana'},
            {'name': 'chilena'}
          ];

            break;
          case 'ambiente':
              data = [
            {'name': 'lounge'},
            {'name': 'cafe bar'},
            {'name': 'cafe'},
            {'name': 'restaurant/bar'}
          ];
            break;
          case 'pago':
              data = [
            {'name': 'efectivo'},
            {'name': 'debito'},
            {'name': 'credito'}
          ];
            break;
        }
        $scope.types = loadTypes();
        $scope.transformChip = transformChip;

        function transformChip(chip) {
          if (angular.isObject(chip)) {
            return chip;
          }
           //return { name: chip};
        }

        function querySearch (query) {
          return $scope.types;
        }

        function createFilterFor(query) {
          var lowercaseQuery = angular.lowercase(query);

          return function filterFn(option) {
            return (option._lowername.indexOf(lowercaseQuery) === 0);
          };

        }

        function loadTypes() {
          return data.map(function (op) {
            op._lowername = op.name.toLowerCase();
            return op;
          });
        }



      }
    }
  })
  /*.directive('mdTipoRestaurant', function(){
    return {
      restrict: 'E',
      template:  '<md-chips  ng-model="restaurant.tipoRestaurant" md-autocomplete-snap="" md-transform-chip="transformChip($chip)" md-require-match="true">'+
          '<md-autocomplete md-selected-item="selectedItem" md-search-text="searchText" ng-focus="searchText='+"'a'"+'" ng-click="searchText='+"'a'"+'" md-items="item in querySearch(searchText)" md-item-text="item.name" placeholder="Tipo de Restaurante">'+
            '<span md-highlight-text="searchText">{{item.name}}</span>'+
          '</md-autocomplete>'+
          '<md-chip-template>'+
            '<span>'+
              '<strong>{{$chip.name}}</strong>'+
            '</span>'+
          '</md-chip-template>'+
        '</md-chips>',
      controller:function($scope, $q, $timeout) {
        var data = [];
        try{
          $scope.model={};
        }catch(e){console.log(e)}

        $scope.readonly = false;
        $scope.selectedItem = null;
        $scope.searchText = null;
        $scope.querySearch = querySearch;
        data = [
            {'name': 'sano'},
            {'name': 'argentino'},
            {'name': 'mar'},
            {'name': 'vegetariano'},
            {'name': 'chino'},
            {'name': 'parrilla'},
            {'name': 'restaurant bar'},
            {'name': 'mexicano'},
            {'name': 'comida rapida'},
            {'name': 'gourmet'},
            {'name': 'sushi'},
            {'name': 'española'},
            {'name': 'peruana'}
          ];
     
        $scope.types = loadTypes();
        $scope.transformChip = transformChip;

        function transformChip(chip) {
          if (angular.isObject(chip)) {
            return chip;
          }
           //return { name: chip};
        }

        function querySearch (query) {
          return $scope.types;
        }

        function createFilterFor(query) {
          var lowercaseQuery = angular.lowercase(query);

          return function filterFn(option) {
            return (option._lowername.indexOf(lowercaseQuery) === 0);
          };

        }

        function loadTypes() {
          return data.map(function (op) {
            op._lowername = op.name.toLowerCase();
            return op;
          });
        }



      }
    }
  })*/
  .factory('CompilationResturant', function(){
    var resource={
      data:undefined,
      setCompilation:function(data){
        resource.data=data;
      },
      getCompilation:function(){
        return resource.data;
      }
    };
    return resource;
  })
  .filter('TextToString', function(){
    return function(data){
      var tmp="";
      var space=", ";
      angular.forEach(data, function(value,key){
        if (key===data.length-1) {
          space="";
        }
        tmp=tmp+value.name+space;
      })
      return tmp;
    }
  })
  .directive('mdLoading', function(){
    return {
      restrict: 'E',
      scope:{
        visible: '=',
        progress: '=',
        text: '=',
        statetext: '=',
        finally: '=',
        imagen: '=',
        height: '='
      },
      templateUrl: 'loading.tmpl.html',
      link:function(scope, elem, attr){
        console.log(scope.height);
      }
    }
  })
  function Dialog($scope, $mdDialog, context){
    $mdDialog.show({
      templateUrl:context,
      parent: angular.element(document.body),
      clickOutsideToClose:false,
      fullscreen: $scope.customFullscreen,
      controller: function($scope, stateRestaurant){
        $scope.closeDialog=function(){
          $mdDialog.hide();
          stateRestaurant.setOption(false);
        };
        $scope.configRestaurant=function(){
          $mdDialog.hide();
          stateRestaurant.setOption(true);
        }
      }
    }).then(function(answer){
    });
  };
  function keySpace(space,type,input){
    var tmp='';
    angular.forEach(input, function(value){
      tmp=tmp+value+space;
    });
    return (type==="array")?(tmp.split(space)).pop():tmp.toString();
  };
  function RunItem($scope){
    angular.forEach($scope.currentViewRestaurant, function(value, key){
      var item=angular.element(document.querySelector(('#number-'+key).toString()));
      if (key!==$scope.part) {
        item.css({'opacity':'0.5'});
      }else{
        item.css({'opacity':'1'});
      }
    });
    if($scope.part===5){
      angular.forEach($scope.currentViewRestaurant, function(value,key){
        angular.element(document.querySelector(('#number-'+key).toString())).css({'opacity':'1'});
      })
    }
  };
  function nodo(d){
    var t=d.split('').length;
    var result="";
    if (t<10) {
      for (var i = 10 - t; i >= 1; i--) {
        result=result+"0";
      }
      result=result+d;
    }else{
      result=d;
    }
    return result;
  };

  function upFile(fb, uri, file, action, $mdToast, $timeout){
    var storage=fb.storage().ref();
    var uploadTask=storage.child(uri).put(file);
    uploadTask.on('state_changed', function(snapshot){

    }, function(error){
      $mdToast.show(
        $mdToast.simple()
        .position('bottom right')
        .textContent(error.message)
        .hideDelay(5000));
      $timeout(function(){
        action();
      },5000);

    }, function(){
      action();
    });
  };

  function downFile(fb, $scope, uri, action, $mdToast, $timeout, defaultImg, target){
    var getUrl=undefined;
    var reference=fb.storage().ref(uri);
    reference.getDownloadURL().then(function(url){
      $scope.$apply(function(){
        if (target) {
          window.open(url, "_target");
        }
        action();
        getUrl=url.toString();
        return getUrl;
      });
    }).catch(function(error){
      $mdToast.show(
        $mdToast.simple()
        .position('bottom right')
        .textContent(error.message)
        .hideDelay(5000));
      $timeout(function(){
        action();
      },5000);

    });
    console.log(getUrl);
    return getUrl===undefined?'':getUrl;
  };