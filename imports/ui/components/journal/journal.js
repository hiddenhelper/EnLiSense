import angular from 'angular';
import angularMeteor from 'angular-meteor';

import { Meteor } from 'meteor/meteor';
import { _ } from 'meteor/underscore';

import template from './journal.html';
import itemAddModal from '../itemAddTab/itemAddModal.html';
import { name as ItemsList } from '../itemsList/itemsList';
import { name as Search } from '../search/search';
import { name as AvatarImage } from '../avatarImage/avatarImage';
import { name as ItemAddTab } from '../itemAddTab/itemAddTab';
import { Profiles } from '../../../api/profiles';


class Journal {
  constructor($scope, $state, $reactive, $rootScope, journalDateService, viewService, $mdDialog, $mdMedia) {
    'ngInject';

    $reactive(this).attach($scope);

    this.$scope = $scope;
    this.viewService = viewService;
    this.$state = $state;
    this.$mdDialog = $mdDialog;
    this.$mdMedia = $mdMedia;

    this.journalDateService = journalDateService;
    $scope.conn = Meteor.absoluteUrl();
  }

  current() {
    this.journalDateService.currentDate = new Date();
    this.$scope.$broadcast("today-button-click", this.journalDateService.currentDate);
  }

  viewHandler(route, params) {
    // forward, back, enter, exit, swap
    this.viewService.nextDirection = 'forward';

    if (!params) {
      params = {}
    }

    // Grab the last view info & transition back
    this.$state.go(route, params);
  }

  open(event) {
    this.$mdDialog.show({
      controller($scope, $mdDialog, $state, viewService) {
        'ngInject';

        this.$state = $state;
        this.viewService = viewService;

        this.close = () => {
          $mdDialog.hide();
        }
      },
      controllerAs: 'itemAddModal',
      controller: function($scope, $mdDialog, $state, viewService) {
        'ngInject';

        $scope.done = () => {
          $mdDialog.hide();
        }

        $scope.viewHandler = (route, type) => {
          // forward, back, enter, exit, swap
          viewService.nextDirection = 'forward';

          // hide modal
          $mdDialog.hide();

          // Grab the last view info & transition back
          $state.go(route, {'type': type});
        }
      },
      template: itemAddModal,
      targetEvent: event,
      parent: angular.element(document.body),
      clickOutsideToClose: false,
      fullscreen: false,
      cssClass: '../itemAddTab/itemAddTab.less'
    });
  }
}

const name = 'journal';

// create a module
export default angular.module(name, [
  angularMeteor,
  ItemsList,
  AvatarImage,
  ItemAddTab,
  Search
])
  .component(name, {
  template,
  controllerAs: name,
  controller: Journal
})
  .config(config);

function config($stateProvider) {
  'ngInject';

  $stateProvider
    .state('journal', {
      url: '/journal',
      template: '<ion-view  hide-back-button="true" cache-view="false" can-swipe-back="false">' +
                ' <ion-nav-buttons side="left" ng-click="journal.viewHandler(\'home\')">' +
                '   <button class="button today-button" ng-click="journal.viewHandler(\'search\')">' +
                '      <i class="icon ion-ios-search"></i>' +
                '   </button>' +
                ' </ion-nav-buttons>' +
                ' <ion-nav-buttons side="right">' +
                '   <button class="button today-button" ng-click="journal.open($event)">' +
                '      <i class="icon ion-ios-plus"></i>' +
                '   </button>' +
                ' </ion-nav-buttons>' +
                '<ion-nav-title>' +
                '    <span style="font-family: \'neuropoliticalregular\', cursive; font-size: 120%;">My Journal</span>' +
                '</ion-nav-title>' +
                ' <journal></journal>' +
                '</ion-view>',
      controller: Journal,
      controllerAs: name,
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
