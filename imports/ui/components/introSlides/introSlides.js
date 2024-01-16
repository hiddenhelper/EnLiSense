import angular from 'angular';
import angularMeteor from 'angular-meteor';
import { Meteor } from 'meteor/meteor';
import template from './introSlides.html';

class IntroSlides {

  constructor($scope, $reactive, $state, $ionicSlideBoxDelegate, viewService){
    'ngInject';

    $reactive(this).attach($scope);

    this.viewService = viewService;
    this.$state = $state;

    this.$ionicSlideBoxDelegate = $ionicSlideBoxDelegate;

    this.slideIndex = 0;
    this.set = false;

  }

  slideChanged = function(index) {
    this.slideIndex = index;
    if (this.slideIndex === 3) {
      this.set = true;
    }
  };

  next() {
    if (this.set) {
      this.goToJournal();
    } else {
      this.$ionicSlideBoxDelegate.next();
    }
  };

  goToJournal() {
    // forward, back, enter, exit, swap
    this.viewService.nextDirection = 'forward';

    // always transition back to more
    this.$state.transitionTo('home');
  }

  previous() {
    this.$ionicSlideBoxDelegate.previous();
  };

  slide(index) {
    this.$ionicSlideBoxDelegate.slide(index);
  };

  reset(index) {
    this.slide(0);
  };

}

const name = 'introSlides';

// create a module
export default angular.module(name, [
  angularMeteor
])
  .component(name, {
  template,
  controllerAs: name,
  controller: IntroSlides
})
  .config(config);

function config($stateProvider) {
  'ngInject';

  $stateProvider
    .state('introSlides', {
      url: '/introSlides',
      template: '<ion-view title="Introduction" cache-view="false" can-swipe-back="false" hide-nav-bar="true">' +
                '<!--ion-nav-buttons side="right">' +
                '  <button class="button today-button" ui-sref="journal">' +
                '    <p>Skip</p>' +
                '  </button>' +
                '</ion-nav-buttons-->' +
                '<intro-slides></intro-slides>' +
                '</ion-view>',
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
