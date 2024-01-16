import angular from 'angular';
import angularMeteor from 'angular-meteor';
import { Meteor } from 'meteor/meteor';
import template from './profileEdit.html';
import { Profiles } from '../../../api/profiles';
import { Camera } from 'ionic-native';

import { ProfileImages } from '../../../api/profileImages';

import { name as ProfileUsername } from '../profileUsername/profileUsername';
import { name as ProfileEmail } from '../profileEmail/profileEmail';
import { name as ProfilePassword } from '../profilePassword/profilePassword';

import { name as DisplayEmailFilter } from '../../filters/displayEmailFilter';

class ProfileEdit {

  constructor($scope, $rootScope, $reactive, $state, viewService){
    'ngInject';

    $reactive(this).attach($scope);

    this.$scope = $scope;
    this.$state = $state;
    this.$rootScope = $rootScope;
    this.viewService = viewService;
    $scope.viewService = viewService;
    //this.currentUser = Meteor.user();

    this.subscribe('profileImages');
    this.subscribe('profile');

    this.helpers({
      profile() {
        return Profiles.findOne({owner: Meteor.userId()});
      },
      currentUser() {
        return Meteor.user();
      },
      image() {
        return ProfileImages.find({owner: Meteor.userId()},{sort: {entryTimestamp: -1}}).fetch();
      }
    });

    this.status = Meteor.status();
    this.autorun(() => {
      this.getReactively('status');
      $scope.connected = Meteor.status().connected;
    });

    Meteor.startup(() => {
      if (Meteor.user()) {
        this.username = Meteor.user().username;
      }
    });


    this.autorun(() => {
      this.getReactively('currentUser');
      this.getReactively('username');

      let email = '';

      if (this.currentUser && this.currentUser.emails && this.currentUser.emails.length > 0) {
        email = this.currentUser.emails[0].address;
      }
      this.user = {
        'username': this.username,
        'email': email,
        'password': 'placeholder'
      };
    });

    profileEdit_this = this;

    this.autorun(() => {
      this.getReactively('image');

      if (this.image && this.image.length > 0 && this.image[0].imageData){

        Meteor.setTimeout(function() {
          profileEdit_this.displayImage(profileEdit_this.image[0].imageData);
        }, 50)

      }
    })

    if (Meteor.isCordova) {
      Meteor.startup(function() {

        $scope.getPicture = function(selection) {

          var options = {
            quality: 50,
            destinationType: Camera.DestinationType.DATA_URL,
            sourceType: Camera.PictureSourceType.SAVEDPHOTOALBUM,
            allowEdit: true,
            correctOrientation: true,
            encodingType: Camera.EncodingType.JPEG,
            saveToPhotoAlbum: false
          };

          Camera.getPicture(options).then((imageData) => {

            base64Image = 'data:image/jpeg;base64,' + imageData;

            profileEdit_this.displayImage(base64Image);

            profileEdit_this.imageRecord = {
              'owner': Meteor.userId(),
              'imageData': base64Image,
              'entryTimestamp': new Date(),
              'profile': true
            };

          });

        }
      }
    )}
  }

  displayImage(imgData) {

    var elem = document.getElementById('imageFile');
    if (elem) {
      elem.src = imgData;
    }

    // remove icon
    $("#cameraIcon").remove();

    // add edit icon
    $("#imageInnerCont").remove();
    $("#imageContainer").append(
    '<div id="imageInnerCont">Edit <i id="editIcon" class="ion-edit edit-input"></i></div>'
    );

  }

  viewHandler(route,params) {
    // forward, back, enter, exit, swap
    this.viewService.nextDirection = 'forward';

    // Grab the last view info & transition back
    this.$state.go(route, params);
  }

  runCamera() {

    if (Meteor.isCordova) {
      this.$scope.getPicture();
    }

  }

  update() {

    if (this.imageRecord) {
      ProfileImages.insert(this.imageRecord);
    }

    Profiles.update({
      _id: this.profile._id
    }, {
      $set: {
        zipCode: this.profile.zipCode,
        birthdate: this.profile.birthdate,
        gender: this.profile.gender
      }
    });

    // forward, back, enter, exit, swap
    this.viewService.nextDirection = 'forward';

    // always goes back to more
    this.$state.transitionTo('more');
  }

}

const name = 'profileEdit';

// create a module
export default angular.module(name, [
  angularMeteor,
  ProfileUsername,
  ProfileEmail,
  ProfilePassword,
  DisplayEmailFilter
])
  .component(name, {
  template,
  controllerAs: name,
  controller: ProfileEdit
})
  .config(config);

function config($stateProvider) {
  'ngInject';

  $stateProvider
    .state('profileEdit', {
      url: '/profileEdit',
      template: '<ion-view cache-view="true" can-swipe-back="false">' +
                '<ion-nav-buttons side="left">' +
                '  <button class="button-clear header-back-button" ng-click="goBackHandler()">' +
                '    <i class="ion-ios-arrow-back"></i> Cancel' +
                '  </button>' +
                '</ion-nav-buttons>' +
                '<ion-nav-title>' +
                '    <span style="font-family: \'neuropoliticalregular\', cursive; font-size: 120%;">Edit Profile</span>' +
                '</ion-nav-title>' +
                '<profile-edit></profile-edit>' +
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
