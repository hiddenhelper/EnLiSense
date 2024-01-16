import angular from 'angular';

const name = 'displayEmailFilter';

function DisplayEmailFilter(email) {

  if (!email) {
    return '';
  }

  l = email.length
  f2 = email.substring(0, 2)
  l2 = email.substring(email.length-2, email.length)
  dots = ''

  for (let i = 0; i < l-4; i++)  {
    dots = dots + '.'
  }

  return f2 + dots + l2;
}

// create a module
export default angular.module(name, [])
  .filter(name, () => {
    return DisplayEmailFilter;
  });
