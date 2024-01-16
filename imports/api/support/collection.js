import { Mongo } from 'meteor/mongo';

export const Support = new Meteor.Collection('support');
if (Meteor.isCordova) Ground.Collection(Support);
