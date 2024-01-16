import template from './reportConfig.html';
import { Reports } from '../../../api/devices';

export default function config($stateProvider) {
    'ngInject';

    $stateProvider
        .state('report', {
            url: '/reports',
            template,
            params: {
              id: undefined
            },
            controller: function($scope, $state, viewService, $reactive, $stateParams) {
                $reactive(this).attach($scope);

                this.status = Meteor.status();
                this.autorun(() => {
                  this.getReactively('status');
                  $scope.connected = Meteor.status().connected;
                });

                $scope.goBackHandler = function() {
                    // forward, back, enter, exit, swap
                    viewService.nextDirection = 'back';
                    // always transition back to more
                    $state.transitionTo('home');
                }
            }
        });
}
