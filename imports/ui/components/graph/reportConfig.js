import template from './reportConfig.html';
import { Reports } from "../../../api/devices";

export default function config($stateProvider) {
    'ngInject';

    $stateProvider
        .state('report', {
            url: '/reports/{id}',
            template,
            controller: function($scope, $state, viewService, $reactive, $stateParams) {
                $reactive(this).attach($scope);
                $scope.helpers({
                    report: () => Reports.findOne({ _id: $stateParams.id })
                });
                $scope.goBackHandler = function() {
                    // forward, back, enter, exit, swap
                    viewService.nextDirection = 'back';
                    // always transition back to more
                    $state.transitionTo('deviceInformation');
                }
            }
        });
}
