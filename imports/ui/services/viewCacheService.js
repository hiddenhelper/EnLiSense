import angular from 'angular';
import angularMeteor from 'angular-meteor';

const name = 'viewCacheService';

function ViewCacheService() {
  'ngInject';

  symptoms = [];
  symptomItem = {};
  moods = [];
  moodItem = {};

  return {
    symptoms: symptoms,
    symptomItem: symptomItem,
    moods: moods,
    moodItem: moodItem
  };
}

// create a module
export default angular.module(name, [
    angularMeteor
])
  .service(name, ViewCacheService);
