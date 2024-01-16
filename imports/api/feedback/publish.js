import { Meteor } from 'meteor/meteor';

import { Feedback } from './collection';

if (Meteor.isServer) {
  Meteor.publish('feedback', function(options) {
    return Feedback.find({owner: this.userId});
  });
}
