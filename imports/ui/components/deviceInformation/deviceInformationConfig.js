import template from './deviceInformationConfig.html';
import emailModelTemplate from './emailModel.html';

export default [ '$stateProvider',
    function config($stateProvider) {
        'ngInject';

        $stateProvider
            .state('deviceInformation', {
                url: '/deviceInformation',
                template,
                controller: function($scope, $rootScope, $state, $ionicModal, $ionicPopup, viewService, $reactive) {
                    $reactive(this).attach($scope);

                    $scope.modal = $ionicModal.fromTemplate(emailModelTemplate, {
                        scope: $scope,
                        animation: 'slide-in-up'
                    });

                    this.status = Meteor.status();
                    this.autorun(() => {
                      this.getReactively('status');
                      $scope.connected = Meteor.status().connected;
                    });

                    $scope.deviceReadyValue = new ReactiveVar(false)
                    $scope.helpers({
                      deviceReady: function() {
                        return $scope.deviceReadyValue.get();
                      }
                    });

                    $rootScope.$on('deviceConnectionReady', function(){
                      $scope.deviceReadyValue.set(true)
                    });

                    $rootScope.$on('deviceConnectionReset', function(){
                      $scope.deviceReadyValue.set(false)
                    });

                    /*
                    $rootScope.$on('deviceConnectionReset', function(){
                      $scope.deviceReadyValue.set(false)
                    });
                    */

                    $scope.sendingEmail = false;
                    $scope.emailError = false;
                    $scope.email = {};
                    $scope.openModal = function() {
                        $scope.modal.show();
                        $scope.email.subject = $scope.selectedFiles.map((file) => file.header).join(',')
                    };
                    $scope.closeModal = function() {
                        $scope.modal.hide();
                    };
                    // Cleanup the modal when we're done with it!
                    $scope.$on('$destroy', function() {
                        $scope.modal.remove();
                    });
                    // Execute action on hide modal
                    $scope.$on('modal.hidden', function() {
                        // Execute action
                    });
                    // Execute action on remove modal
                    $scope.$on('modal.removed', function() {
                        // Execute action
                    });
                    $scope.selectedFiles = [];
                    $scope.$on('selectedFiles', function (event, selectedFiles) {
                        $scope.selectedFiles = selectedFiles;
                    })

                    $scope.goBackHandler = function() {

                        console.log("goBackHandler close address")
                        console.log(viewService.deviceAddress)

                        address = viewService.deviceAddress

                        bluetoothle.disconnect(function(success) {
                          console.log(success)
                          bluetoothle.close(function(success) {console.log(success)}, function(error) {console.log(error)}, {
                            "address": address
                          });
                        }, function(error) {
                          console.log(error)
                          bluetoothle.close(function(success) {console.log(success)}, function(error) {console.log(error)}, {
                            "address": address
                          });
                        }, {
                          "address": address
                        });

                        // forward, back, enter, exit, swap
                        viewService.nextDirection = 'back';
                        // always transition back to more
                        $state.transitionTo('more');
                    }
                    $scope.sendSelectedFilesInEmail = () => {
                        $scope.openModal();
                        console.log(" $scope.selectedFiles ###",  $scope.selectedFiles);
                    }
                    $scope.pushToS3 = () => {
                        $rootScope.$broadcast('s3sync');
                    }
                    $scope.clearDevice = () => {
                      $ionicPopup.confirm({
                          title: 'Clear Device',
                          template: 'Are you sure you want to clear device data?',
                          buttons: [{
                                  text: 'Back'
                              },
                              {
                                  text: 'Clear',
                                  type: 'button-assertive',
                                  onTap: (e) => {
                                      $scope.eraseDevice();
                                  }
                              }
                          ]
                      });
                    }
                    $scope.eraseDevice = () => {

                        var string = "erase";
                        var bytes = bluetoothle.stringToBytes(string);
                        var encodedString = bluetoothle.bytesToEncodedString(bytes);

                        params = {
                          "address": viewService.deviceAddress,
                          "service": "6e400001-b5a3-f393-e0a9-e50e24dcca9e",
                          "value": encodedString,
                          "characteristic": "6e400002-b5a3-f393-e0a9-e50e24dcca9e",
                          "type":"response"
                        }

                        console.log("erase")

                        bluetoothle.write(function(success){
                          console.log(success)

                        }, function(error){
                          console.log(error);
                        }, params);



                    }
                    $scope.deleteSelectedFiles = () => {
                        $ionicPopup.confirm({
                            title: 'Delete',
                            template: 'Are you sure you want to delete?',
                            buttons: [{
                                    text: 'Cancel'
                                },
                                {
                                    text: 'Delete',
                                    type: 'button-assertive',
                                    onTap: (e) => {
                                        $scope.selectedFiles.forEach((file) => {
                                            this.call('deleteReport', file._id)
                                        })
                                    }
                                }
                            ]
                        });
                    }
                    $scope.sendEmail = () => {
                        $scope.sendingEmail = true;
                        $scope.emailError = false;
                        this.call('sendEmail', $scope.email.to, 'apps@enlisense.com', $scope.email.subject, '', [
                            {   // use URL as an attachment
                                filename: '10-18-2021-4-12-PM-Quebec-BM05_2 output from AWS.txt',
                                path: 'http://localhost:3000/fonts/10-18-2021-4-12-PM-Quebec-BM05_2 output from AWS.txt'
                            },
                        ], (error, res) => {
                            $scope.sendingEmail = false;
                            if (error) {
                                $scope.emailError = true;
                            } else {
                                $scope.closeModal();
                            }
                        });
                    }
                }
            });
    }
]
