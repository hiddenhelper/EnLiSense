import angular from 'angular';

const name = 'displayDateFilter';

function DisplayDateFilter(date) {
  if (!date) {
    return '';
  }

  if (!(date instanceof Date)) {
    return '';
  }

  return date.toDateString();
}

// create a module
export default angular.module(name, [])
  .filter(name, () => {
    return DisplayDateFilter;
  });
