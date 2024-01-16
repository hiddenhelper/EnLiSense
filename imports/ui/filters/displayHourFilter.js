import angular from 'angular';

const name = 'displayHourFilter';

function DisplayHourFilter(hours) {
  if (!hours) {
    return '';
  }

  return Math.floor(hours);
}

// create a module
export default angular.module(name, [])
  .filter(name, () => {
    return DisplayHourFilter;
  });
