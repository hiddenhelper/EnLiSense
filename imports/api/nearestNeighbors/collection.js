import { Mongo } from 'meteor/mongo';

export const NearestNeighbors = new Meteor.Collection('nearestNeighbors');
if (Meteor.isCordova) Ground.Collection(NearestNeighbors);

NearestNeighbors.allow({
  insert(userId, nn) {
    return userId && nn.owner === userId;
  },
  update(userId, nn, fields, modifier) {
    return userId && nn.owner === userId;
  },
  remove(userId, nn) {
    return userId && nn.owner === userId;
  }
});
