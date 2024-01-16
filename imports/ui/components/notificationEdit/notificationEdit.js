import angular from 'angular';
import angularMeteor from 'angular-meteor';
import { Meteor } from 'meteor/meteor';
import template from './notificationEdit.html';

import { Notifications } from '../../../api/notifications';

class NotificationEdit {
  constructor($scope, $state, $reactive, viewService){
    'ngInject';

    $reactive(this).attach($scope);

    this.viewService = viewService;
    this.$state = $state;

    this.notificationsNew = {
      "journalReminder": true,
      "syncReminder": true
    }

    this.subscribe('notification');
    this.helpers({
      notification() {
        return Notifications.findOne({});
      }
    });

    this.autorun(() => {
      this.getReactively('notification');
      if (this.notification) {
        this.notificationsNew = this.notification
      }
    });
  }

  update() {

    if (this.notificationsNew.journalReminder === true) {

      cordova.plugins.notification.local.cancel([2000])

      cordova.plugins.notification.local.schedule([
        {
          id: 2000,
          title: "IBD AWARE: Add A Journal Entry",
          text: 'How are your feeling today? Complete a survey to track your progress.',
          foreground: true,
          trigger: {
            every: {
              hour: 7,
              minute: 0,
              second: 0
            }
          }
        }
      ])

    } else if (this.notificationsNew.journalReminder === false) {

      cordova.plugins.notification.local.cancel([2000])

    }

    if (this.notificationsNew.syncReminder === true) {

      cordova.plugins.notification.local.cancel([2001, 2002])

      cordova.plugins.notification.local.schedule([
        {
          id: 2001,
          title: 'IBD AWARE: Sync Your Device',
          text: 'Add or sync your device with the app. We recommend syncing every 8-12 hrs.',
          foreground: true,
          trigger: {
            every: {
              hour: 14,
              minute: 0
            }
          }
        },
        {
          id: 2002,
          title: 'IBD AWARE: Sync Your Device',
          text: 'Add or sync your device with the app. We recommend syncing every 8-12 hrs.',
          foreground: true,
          trigger: {
            every: {
              hour: 21,
              minute: 0
            }
          }
        }
      ])

    } else if (this.notificationsNew.syncReminder === false) {

      cordova.plugins.notification.local.cancel([2001, 2002])

    }

    // new entry
    if (!this.notificationsNew.hasOwnProperty('_id')) {
      this.notificationsNew.owner = Meteor.userId();
      Notifications.insert(this.notificationsNew);
    } else {
      Notifications.update({
        _id: this.notificationsNew._id
      }, {
        $set: {
          journalReminder: this.notificationsNew.journalReminder,
          syncReminder: this.notificationsNew.syncReminder
        }
      });
    }

    // forward, back, enter, exit, swap
    this.viewService.nextDirection = 'forward';

    // always goes back to more
    this.$state.transitionTo('more');

  }

}

const name = 'notificationEdit';

// create a module
export default angular.module(name, [
  angularMeteor
])
  .component(name, {
  template,
  controllerAs: name,
  controller: NotificationEdit
})
  .config(config);

function config($stateProvider) {
  'ngInject';

  $stateProvider
    .state('notificationEdit', {
      url: '/notificationEdit',
      template: '<ion-view can-swipe-back="false">' +
                '<ion-nav-buttons side="left">' +
                '  <button class="button-clear header-back-button" ng-click="goBackHandler()">' +
                '    <i class="ion-ios-arrow-back"></i> Cancel' +
                '  </button>' +
                '</ion-nav-buttons>' +
                '<ion-nav-title>' +
                '    <span style="font-family: \'neuropoliticalregular\', cursive; font-size: 120%;">Notifications</span>' +
                '</ion-nav-title>' +
                '<notification-edit></notification-edit>' +
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
