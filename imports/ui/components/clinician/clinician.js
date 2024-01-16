import angular from 'angular';
import angularMeteor from 'angular-meteor';
import { Meteor } from 'meteor/meteor';
import template from './clinician.html';
import { Clinicians } from '../../../api/clinicians';
import { Dialogs } from 'ionic-native';

class Clinician {

  constructor($scope, $rootScope, $reactive, $state, viewService){
    'ngInject';

    $reactive(this).attach($scope);

    this.$state = $state;
    this.viewService = viewService;
    this.error = false;
    this.newEmail = '';
    this.currentEmail = '';

    $scope.clinicianError = this.error;

    //this.subscribe('clinicianData');
    this.helpers({
      clinicianData: () => Clinicians.findOne({'archive': false})
    });


    this.connected = Meteor.status();
    this.autorun(() => {
      this.getReactively('connected');
      this.connected = Meteor.status().connected;
    });

    clinician_this = this

    // called when any state changes.
    $scope.$on('$stateChangeSuccess', function(evt, toState, toParams, fromState, fromParams) {

      if (toState.name == 'clinician') {
        $scope.clinicianError = false;
        clinician_this.newEmail = ''
      }

    });

  }


  validateEmail(email) {
    var re = /\S+@\S+\.\S+/;
    return re.test(email);
  }

  viewHandler(route,params) {
    // forward, back, enter, exit, swap
    this.viewService.nextDirection = 'forward';

    // Grab the last view info & transition back
    this.$state.go(route, params);
  }

  removeButton() {
    if (this.clinicianData && this.clinicianData.hasOwnProperty('_id')) {
      Clinicians.update({_id: this.clinicianData._id},{$set:{'archive': true, 'removedTime': Date.now(), 'entryTimestamp': new Date()}})
    }

    this.newEmail = ''
    this.clinicianData.currentEmail = ''

    this.viewHandler("more")
  }

  updateButton() {

    if (this.validateEmail(this.newEmail)) {

      this.error = false;

      clinician_this = this

      Dialogs.alert(
        "By adding the clinician email, you are agreeing to share all data collected using this app, the device, and the sensor and any other information entered with the clinician.",
        "Clinician Sharing",
        "OK").then(function() {

          console.log(clinician_this.newEmail)
          console.log(clinician_this.clinicianData)

          if (clinician_this.clinicianData && clinician_this.clinicianData.hasOwnProperty('_id')) {
            Clinicians.update({_id: clinician_this.clinicianData._id},{$set:{'archive': true, 'removedTime': Date.now()}})
          }

          Clinicians.insert({owner: Meteor.userId(), "currentEmail": clinician_this.newEmail, 'archive': false, 'enteredTime': Date.now(), 'removedTime': undefined, 'entryTimestamp': new Date()})

          clinician_this.viewHandler("more")

        }

      )

    } else {

      $('#currentPassword').addClass('warning');

      this.error = true;
    }

  }


}

const name = 'clinician';

// create a module
export default angular.module(name, [
  angularMeteor
])
  .component(name, {
  template,
  controllerAs: name,
  controller: Clinician
})
  .config(config);

function config($stateProvider) {
  'ngInject';

  $stateProvider
    .state('clinician', {
      url: '/clinician',
      template: '<ion-view cache-view="true" can-swipe-back="false">' +
                '<ion-nav-buttons side="left">' +
                '  <button class="button-clear header-back-button" ng-click="goBackHandler()">' +
                '    <i class="ion-ios-arrow-back"></i> Cancel' +
                '  </button>' +
                '</ion-nav-buttons>' +
                '<ion-nav-title>' +
                '    <span style="font-family: \'neuropoliticalregular\', cursive; font-size: 120%;">Clinician</span>' +
                '</ion-nav-title>' +
                '<clinician></clinician>' +
                '</ion-view>',
      controller: function($scope, $state, viewService) {
        $scope.goBackHandler = function() {

          // forward, back, enter, exit, swap
          viewService.nextDirection = 'back';

          // always transition back to more
          $state.transitionTo('more');
        }
      },
      resolve: {
        currentUser($q) {
          if (Meteor.userId() === null) {
            return $q.reject('AUTH_REQUIRED');
          } else {
            return $q.resolve();
          }
        }
      }
    });
}
