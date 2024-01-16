import angular from 'angular';

const name = 'displayFtoCFilter';

function DisplayFtoCFilter(temp) {

  if (!temp) {
    return '';
  }

  try {
    c = (parseFloat(temp) - 32) / 1.8000
  } catch (e) {
    return '';
  }

  return c.toFixed(2);
}

// create a module
export default angular.module(name, [])
  .filter(name, () => {
    return DisplayFtoCFilter;
  });
