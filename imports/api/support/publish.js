import { Meteor } from 'meteor/meteor';

import { Support } from './collection';

if (Meteor.isServer) {
  Meteor.publish('support', function(options) {

    return Support.find({});

  });
}
