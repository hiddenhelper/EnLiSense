import { Meteor } from 'meteor/meteor';

import { Symptoms } from './collection';

if (Meteor.isServer) {
  Meteor.publish('symptoms', function(options) {
    return Symptoms.find({owner: this.userId});
  });
}
