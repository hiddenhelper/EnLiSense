import { Meteor } from 'meteor/meteor';
//import { Counts } from 'meteor/tmeasday:publish-counts';

import { Clinicians } from './collection';

if (Meteor.isServer) {
  Meteor.publish('clinicians', function() {

    return Clinicians.find({owner: this.userId});

  });
}
