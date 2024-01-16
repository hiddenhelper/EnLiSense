import { Meteor } from 'meteor/meteor';

import { Profiles } from './collection';

if (Meteor.isServer) {
  Meteor.publish('profile', function(options) {
    return Profiles.find({owner: this.userId});
  });
}
