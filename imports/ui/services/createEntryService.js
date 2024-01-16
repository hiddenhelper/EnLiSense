import angular from 'angular';
import angularMeteor from 'angular-meteor';

import { Meteor } from 'meteor/meteor';

import { Entries } from '../../api/entries';

const name = 'createEntryService';

function CreateEntryService(_id, type) {

  if (!_id) {
    return  {
      'route': 'entryAdd',
      'entryTimestamp': new Date(),
      '_id': new Meteor.Collection.ObjectID().valueOf(),
      'type': type,
      'name': '',
      'brand': '',
      'barcode': '',
      'category': '',
      'notes': '',
      'parents': [],
      'children': [],
      'selected': []
    };
  }

  tmpEntry = Entries.findOne({_id: _id });

  if (!tmpEntry) {
    return  {
      'route': 'entryAdd',
      'entryTimestamp': new Date(),
      '_id': new Meteor.Collection.ObjectID().valueOf(),
      'type': type,
      'name': '',
      'brand': '',
      'barcode': '',
      'category': '',
      'notes': '',
      'parents': [],
      'children': [],
      'selected': []
    };
  }

  return  {
    'route': 'entryAdd',
    'entryTimestamp': new Date(),
    '_id': new Meteor.Collection.ObjectID().valueOf(),
    'type': tmpEntry.type,
    'name': tmpEntry.name,
    'brand': tmpEntry.brand,
    'barcode': tmpEntry.barcode,
    'category': tmpEntry.category,
    'notes': tmpEntry.notes,
    'parents': tmpEntry.parents,
    'children': tmpEntry.children,
    'selected': tmpEntry.children
  };

}

// create a module
export default angular.module(name, [
    angularMeteor
])
  .service(name, () => {
    return CreateEntryService;
  });
