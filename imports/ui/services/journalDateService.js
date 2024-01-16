import angular from 'angular';
import angularMeteor from 'angular-meteor';

const name = 'journalDateService';

function JournalDateService() {
  'ngInject';

  currentDate = new Date();

  return {
    currentDate: currentDate
  }
}

// create a module
export default angular.module(name, [
    angularMeteor
])
  .service(name, JournalDateService);
