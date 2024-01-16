import { Meteor } from 'meteor/meteor';

import { DisplayPreferences } from './collection';

if (Meteor.isServer) {
  Meteor.publish('displayPreferences', function(options) {
    return DisplayPreferences.find({owner: this.userId});
  });
}
