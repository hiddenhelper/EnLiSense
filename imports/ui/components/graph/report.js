import angular from 'angular';
import angularMeteor from 'angular-meteor';

import template from './report.html';
import config from './reportConfig';
import { Reports, ReportsContent } from '../../../api/devices';

class Report {
  constructor($scope, $reactive, $state, viewService, $stateParams) {
    'ngInject';

    $reactive(this).attach($scope);

    this.$state = $state;
    this.viewService = viewService;

    this.limit = 5;
    $scope.subscribe('reports-content', () => [$stateParams.id, 0, this.getReactively('limit')], {
      onStart: function () {
        console.log("New subscribtion has been started");
      },
      onReady: function () {
        console.log("onReady And the Items actually Arrive", arguments);
        $scope.$broadcast('scroll.infiniteScrollComplete');
        // subscriptionHandle.stop();  // Stopping the subscription, will cause onStop to fire
      },
      onStop: function (error) {
        if (error) {
          console.log('An error happened - ', error);
        } else {
          console.log('The subscription stopped');
        }
      }
    });

    $scope.loadMore = () => {
      this.limit = this.limit + 5;
    }

    $scope.$on('$stateChangeSuccess', function() {
      $scope.loadMore();
    });


    $scope.helpers({
      states: () => ReportsContent.find({ reportId: $stateParams.id }),
      report: () => Reports.findOne({ _id: $stateParams.id }),
    });

  }
}


const name = 'report';

// create a module
export default angular.module(name, [angularMeteor])
  .component(name, { template, controllerAs: name, controller: Report})
    .config(config);


