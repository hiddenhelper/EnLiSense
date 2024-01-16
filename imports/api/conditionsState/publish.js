import { Meteor } from 'meteor/meteor';

import { ConditionsState } from './collection';

if (Meteor.isServer) {
  Meteor.publish('conditionsState', function() {

    return ConditionsState.find({owner: this.userId});

  });
}
