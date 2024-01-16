import { Meteor } from 'meteor/meteor';

import { Items } from './collection';

if (Meteor.isServer) {

  Meteor.publish('items', function(options) {

    return Items.find({owner: this.userId}, {fields:{location: 0}});

  });

}
