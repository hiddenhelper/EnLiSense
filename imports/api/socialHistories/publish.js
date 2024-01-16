import { Meteor } from 'meteor/meteor';

import { SocialHistories } from './collection';

if (Meteor.isServer) {
  Meteor.publish('socialHistory', function(options) {
    return SocialHistories.find({owner: this.userId});
  });
}
