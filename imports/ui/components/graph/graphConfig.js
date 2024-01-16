import template from './graphConfig.html';

export default function config($stateProvider) {
    'ngInject';

    $stateProvider
        .state('graph', {
            url: '/graph/{id}',
            template,
            controller: function($scope, $state, viewService, $reactive, $stateParams) {
                $reactive(this).attach($scope);
                $scope.goBackHandler = function() {
                    // forward, back, enter, exit, swap
                    viewService.nextDirection = 'back';
                    // always transition back to more
                    $state.transitionTo('report', { id: $stateParams.id });
                    // $window.history.back()
                }
            }
        });
}
