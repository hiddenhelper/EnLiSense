import { Meteor } from 'meteor/meteor';
//import { Counts } from 'meteor/tmeasday:publish-counts';

import { Conditions } from './collection';

if (Meteor.isServer) {
  Meteor.publish('conditions', function() {

    /*
    Counts.publish(this, 'numberOfConditions', Conditions.find({owner: this.userId}), {
      noReady: true
    });
    */
    return Conditions.find({owner: this.userId});

  });
}
