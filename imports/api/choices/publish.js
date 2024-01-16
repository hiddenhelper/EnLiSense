import { Meteor } from 'meteor/meteor';

import { Choices } from './collection';

if (Meteor.isServer) {
  Meteor.publish('choices', function(options) {

    return Choices.find({owner: this.userId});

  });
}
