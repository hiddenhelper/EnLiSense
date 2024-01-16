import { Meteor } from 'meteor/meteor';

import { Insights } from './collection';

export function sampleInsights() {

  const insights = [{
    'owner': this.userId,
    'entryTimestamp': new Date('2016-01-01'),
    'title': 'Dubstep-Free Zone',
    'message': 'Fast just got faster with Nexus S.',
    'type': 'Food',
    'hidden': false,
    'sample': true
  }, {
    'owner': this.userId,
    'entryTimestamp': new Date('2016-02-01'),
    'title': 'All dubstep all the time',
    'message': 'Get it on!',
    'type': 'Food',
    'hidden': false,
    'sample': true
  }, {
    'owner': this.userId,
    'entryTimestamp': new Date('2016-03-01'),
    'title': 'All dubstep all the time',
    'message': 'Get it on!',
    'type': 'Food',
    'hidden': false,
    'sample': true
  }, {
    'owner': this.userId,
    'entryTimestamp': new Date('2016-04-01'),
    'title': 'All dubstep all the time',
    'message': 'Get it on!',
    'type': 'Food',
    'hidden': false,
    'sample': true
  }, {
    'owner': this.userId,
    'entryTimestamp': new Date('2016-05-01'),
    'title': 'All dubstep all the time',
    'message': 'Get it on!',
    'type': 'Food',
    'hidden': false,
    'sample': true
  }, {
    'owner': this.userId,
    'entryTimestamp': new Date('2016-01-01'),
    'title': 'All dubstep all the time',
    'message': 'Get it on!',
    'type': 'Drink',
    'hidden': false,
    'sample': true
  }, {
    'owner': this.userId,
    'entryTimestamp': new Date('2016-02-01'),
    'title': 'All dubstep all the time',
    'message': 'Get it on!',
    'type': 'Drink',
    'hidden': false,
    'sample': true
  }, {
    'owner': this.userId,
    'entryTimestamp': new Date('2016-03-01'),
    'title': 'All dubstep all the time',
    'message': 'Get it on!',
    'type': 'Drink',
    'hidden': false,
    'sample': true
  }, {
    'owner': this.userId,
    'entryTimestamp': new Date('2016-04-01'),
    'title': 'All dubstep all the time',
    'message': 'Get it on!',
    'type': 'Drink',
    'hidden': false,
    'sample': true
  }, {
    'owner': this.userId,
    'entryTimestamp': new Date('2016-05-01'),
    'title': 'All dubstep all the time',
    'message': 'Get it on!',
    'type': 'Drink',
    'hidden': false,
    'sample': true
  }, {
    'owner': this.userId,
    'entryTimestamp': new Date('2016-01-01'),
    'title': 'Savage lounging',
    'message': 'Leisure suit required. And only fiercest manners.',
    'type': 'Symptoms',
    'hidden': false,
    'sample': true
  }, {
    'owner': this.userId,
    'entryTimestamp': new Date('2016-02-01'),
    'title': 'Savage lounging',
    'message': 'Leisure suit required. And only fiercest manners.',
    'type': 'Symptoms',
    'hidden': false,
    'sample': true
  }, {
    'owner': this.userId,
    'entryTimestamp': new Date('2016-03-01'),
    'title': 'Savage lounging',
    'message': 'Leisure suit required. And only fiercest manners.',
    'type': 'Symptoms',
    'hidden': false,
    'sample': true
  }, {
    'owner': this.userId,
    'entryTimestamp': new Date('2016-04-01'),
    'title': 'Savage lounging',
    'message': 'Leisure suit required. And only fiercest manners.',
    'type': 'Symptoms',
    'hidden': false,
    'sample': true
  }, {
    'owner': this.userId,
    'entryTimestamp': new Date('2016-05-01'),
    'title': 'Savage lounging',
    'message': 'Leisure suit required. And only fiercest manners.',
    'type': 'Symptoms',
    'hidden': false,
    'sample': true
  }, {
    'owner': this.userId,
    'entryTimestamp': new Date('2016-06-01'),
    'title': 'Savage lounging',
    'message': 'Leisure suit required. And only fiercest manners.',
    'type': 'Symptoms',
    'hidden': false,
    'sample': true
  }, {
    'owner': this.userId,
    'entryTimestamp': new Date('2016-07-01'),
    'title': 'Savage lounging',
    'message': 'Leisure suit required. And only fiercest manners.',
    'type': 'Symptoms',
    'hidden': false,
    'sample': true
  }, {
    'owner': this.userId,
    'entryTimestamp': new Date('2016-01-01'),
    'title': 'All dubstep all the time',
    'message': 'Get it on!',
    'type': 'Exercise',
    'hidden': false,
    'sample': true
  }, {
    'owner': this.userId,
    'entryTimestamp': new Date('2016-02-01'),
    'title': 'All dubstep all the time',
    'message': 'Get it on!',
    'type': 'Exercise',
    'hidden': false,
    'sample': true
  }, {
    'owner': this.userId,
    'entryTimestamp': new Date('2016-03-01'),
    'title': 'All dubstep all the time',
    'message': 'Get it on!',
    'type': 'Exercise',
    'hidden': false,
    'sample': true
  }, {
    'owner': this.userId,
    'entryTimestamp': new Date('2016-04-01'),
    'title': 'All dubstep all the time',
    'message': 'Get it on!',
    'type': 'Exercise',
    'hidden': false,
    'sample': true
  }, {
    'owner': this.userId,
    'entryTimestamp': new Date('2016-05-01'),
    'title': 'All dubstep all the time',
    'message': 'Get it on!',
    'type': 'Exercise',
    'hidden': false,
    'sample': true
  }, {
    'owner': this.userId,
    'entryTimestamp': new Date('2016-06-01'),
    'title': 'All dubstep all the time',
    'message': 'Get it on!',
    'type': 'Exercise',
    'hidden': false,
    'sample': true
  }, {
    'owner': this.userId,
    'entryTimestamp': new Date('2016-07-01'),
    'title': 'All dubstep all the time',
    'message': 'Get it on!',
    'type': 'Exercise',
    'hidden': false,
    'sample': true
  }, {
    'owner': this.userId,
    'entryTimestamp': new Date('2016-01-01'),
    'title': 'All dubstep all the time',
    'message': 'Get it on!',
    'type': 'Medication',
    'hidden': false,
    'sample': true
  }, {
    'owner': this.userId,
    'entryTimestamp': new Date('2016-02-01'),
    'title': 'All dubstep all the time',
    'message': 'Get it on!',
    'type': 'Medication',
    'hidden': false,
    'sample': true
  }, {
    'owner': this.userId,
    'entryTimestamp': new Date('2016-03-01'),
    'title': 'All dubstep all the time',
    'message': 'Get it on!',
    'type': 'Medication',
    'hidden': false,
    'sample': true
  }, {
    'owner': this.userId,
    'entryTimestamp': new Date('2016-04-01'),
    'title': 'All dubstep all the time',
    'message': 'Get it on!',
    'type': 'Medication',
    'hidden': false,
    'sample': true
  }, {
    'owner': this.userId,
    'entryTimestamp': new Date('2016-05-01'),
    'title': 'All dubstep all the time',
    'message': 'Get it on!',
    'type': 'Medication',
    'hidden': false,
    'sample': true
  }, {
    'owner': this.userId,
    'entryTimestamp': new Date('2016-06-01'),
    'title': 'All dubstep all the time',
    'message': 'Get it on!',
    'type': 'Medication',
    'hidden': false,
    'sample': true
  }, {
    'owner': this.userId,
    'entryTimestamp': new Date('2016-07-01'),
    'title': 'All dubstep all the time',
    'message': 'Get it on!',
    'type': 'Medication',
    'hidden': false,
    'sample': true
  }, {
    'owner': this.userId,
    'entryTimestamp': new Date('2016-08-01'),
    'title': 'All dubstep all the time',
    'message': 'Get it on!',
    'type': 'Medication',
    'hidden': false,
    'sample': true
  }, {
    'owner': this.userId,
    'entryTimestamp': new Date('2016-09-01'),
    'title': 'All dubstep all the time',
    'message': 'Get it on!',
    'type': 'Medication',
    'hidden': false,
    'sample': true
  }, {
    'owner': this.userId,
    'entryTimestamp': new Date('2016-10-01'),
    'title': 'All dubstep all the time',
    'message': 'Get it on!',
    'type': 'Medication',
    'hidden': false,
    'sample': true
  }];

  insights.forEach((insight) => {
    Insights.insert(insight)
  });
  return true;
}

export function removeSampleInsights() {
  sampleIds = Insights.find({owner: this.userId, sample: true},{fields:{_id: 1}}).fetch();
  sampleIds = _.pluck(sampleIds, '_id');
  Insights.remove({_id: {$in:sampleIds}});
  return true;
}

export function sampleInsightsCount() {
  return Insights.find({owner: this.userId, sample: true}).count();
}

Meteor.methods({
  sampleInsights
 ,removeSampleInsights
 ,sampleInsightsCount
});
