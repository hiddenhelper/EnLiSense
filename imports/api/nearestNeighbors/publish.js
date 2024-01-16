import { Meteor } from 'meteor/meteor';

import { NearestNeighbors } from './collection';

if (Meteor.isServer) {

  Meteor.publish('nearestNeighbors', function(_id) {
    return NearestNeighbors.find({});
  });

}
