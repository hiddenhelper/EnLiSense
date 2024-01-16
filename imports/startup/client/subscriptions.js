import { Meteor } from 'meteor/meteor';

const subs = new SubsManager();
let subscribed = false;

Meteor.startup(() => {
  Tracker.autorun(() => {

    if (Meteor.user() && !subscribed) {
      //subs.subscribe('allMyEntries');
      //subs.subscribe('nearestNeighbors');
      subs.subscribe('userImages');
      subs.subscribe('items');
      subs.subscribe('moods');
      subs.subscribe('choices');
      subs.subscribe('notification');
      subs.subscribe('profile');
      subs.subscribe('symptoms');
      subs.subscribe('profileImage');
      subs.subscribe('socialHistory');
      subs.subscribe('conditions');
      subs.subscribe('entry');
      subs.subscribe('devices');
      subs.subscribe('support');
      subs.subscribe('conditionsState');
      subs.subscribe('clinicians');
      subs.subscribe('feedback');
      subs.subscribe('displayPreferences');


      subscribed = true;
    }
  });
});
