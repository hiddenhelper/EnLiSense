import angular from 'angular';
import angularMeteor from 'angular-meteor';

import { Items } from '../../api/items';

const name = 'submitItemService';

function SubmitItemService(item) {

  if (!item) {
    return {};
  }

  item.owner = Meteor.userId();
  Items.insert(item);
  return {};
}

// create a module
export default angular.module(name, [
    angularMeteor
])
  .service(name, () => {
    return SubmitItemService;
  });
