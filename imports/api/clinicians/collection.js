import { Mongo } from 'meteor/mongo';

export const Clinicians = new Meteor.Collection('clinicians');
if (Meteor.isCordova) Ground.Collection(Clinicians);

Clinicians.allow({
  insert(userId, clinician) {
    return userId && clinician.owner === userId;
  },
  update(userId, clinician, fields, modifier) {
    return userId && clinician.owner === userId;
  },
  remove(userId, clinician) {
    return userId && clinician.owner === userId;
  }
});
