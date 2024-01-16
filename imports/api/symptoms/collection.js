import { Mongo } from 'meteor/mongo';

export const Symptoms = new Meteor.Collection('symptoms');
if (Meteor.isCordova) Ground.Collection(Symptoms);

Symptoms.allow({
  insert(userId, symptom) {
    return userId && symptom.owner === userId;
  },
  update(userId, symptom, fields, modifier) {
    return userId && symptom.owner === userId;
  },
  remove(userId, symptom) {
    return userId && symptom.owner === userId;
  }
});
