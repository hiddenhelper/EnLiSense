import { Meteor } from 'meteor/meteor';

import { SupportLikes } from './collection';

if (Meteor.isServer) {
  Meteor.publish('supportLikes', function(options) {

    return SupportLikes.find({owner: this.userId});

  });
}
