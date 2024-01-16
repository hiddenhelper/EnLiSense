import { Meteor } from 'meteor/meteor';

import { Moods } from './collection';

if (Meteor.isServer) {
  Meteor.publish('moods', function(options) {
    return Moods.find({owner: this.userId});
  });
}
