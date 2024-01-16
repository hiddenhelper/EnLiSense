import { Meteor } from 'meteor/meteor';

import { Notifications } from './collection';

if (Meteor.isServer) {
  Meteor.publish('notification', function(options) {
    return Notifications.find({owner: this.userId});
  });
}
