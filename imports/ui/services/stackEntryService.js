import angular from 'angular';
import angularMeteor from 'angular-meteor';

import { Meteor } from 'meteor/meteor';

const name = 'stackEntryService';

function StackEntryService() {
  let stack = [];

  function add(value, params) {
    stack.push({'data': value, 'params': params});
    // console.debug('*** ADD ***');
    // console.debug(stack.length);
    // console.debug(JSON.stringify(stack));
  }

  function remove() {
    stack.pop();
    // console.debug('*** REMOVE ***');
    // console.debug(stack.length);
    // console.debug(JSON.stringify(stack));
  }

  function empty() {
    stack.length = 0;
    // console.debug('*** EMPTY ***');
    // console.debug(stack.length);
    // console.debug(JSON.stringify(stack));
  }


  return {
    add: add,
    remove: remove,
    empty: empty,
    stack: stack
  };
}

// create a module
export default angular.module(name, [
    angularMeteor
])
  .service(name, StackEntryService);
