import { Meteor } from 'meteor/meteor';
import { Email } from 'meteor/email'
import { ReportsContent, Reports } from './collection';
import { check } from 'meteor/check'
import { Promise } from 'meteor/promise';

import { Items } from '../items';

Meteor.methods({
  addOrUpdateNote(reportId, note) {
    if (Meteor.isServer) {
      const exists = Reports.findOne(
          { _id: reportId, 'notes.userId':  this.userId},
          { fields: { 'notes.$': 1 } }
      )
      if (exists) {
        return Reports.update({ _id: reportId, 'notes.userId':  this.userId },
            {
              $set: { 'notes.$.note': note }
            }
        )
      } else {
        return Reports.update({ _id: reportId },
            {
              $push: { notes: { userId: this.userId, note } }
            }
        )
      }
    }
  },
  deleteReport(reportId) {
    if (Meteor.isServer) {
      Reports.update({ _id: reportId  }, {$set:{'archive': true}})
      ReportsContent.update({ reportId }, {$set:{'archive': true}})
    }
  },
  sendEmail(to, from, subject, text, attachments = []) {
    if (!Meteor.isServer) return;
    // Make sure that all arguments are strings.
    check([to, from, subject, text], [String]);
    check(attachments, [{
      filename: String,
      path: String
    }]);

    // Let other method calls from the same client start running, without
    // waiting for the email sending to complete.
    this.unblock();

    Email.send({ to, from, subject, text, attachments });
  },
  async currentReport(header) {
    if (Meteor.isServer) {
      res = await Reports.findOne({$and:[{"header":header},{"archive":false}]});
      return res
    }
  },
  async reportGraph(ownerId, startTime, endTime, key = 'degC') {
    if (Meteor.isServer) {

      res = await ReportsContent.rawCollection().aggregate([
        {
          '$match': {
            $and: [
              {'owner': ownerId},
              {'time': { $gte: startTime / 1000.0 }},
              {'time': { $lte: endTime / 1000.0 }}
            ],
            'row': {
              '$exists': false
            }
          }
        },{
          $sort: { "time": 1 }
        },{
          '$project': {
            'date': {
              '$toLong': {
                '$multiply': [
                  {
                    '$toDecimal': '$time'
                  }, 1000
                ]
              }
            },
            'value': '$' + key
          }
        }
      ]).toArray();
      return res

    }
  },
  async reportDataPoints(ownerId, startTime, endTime) {
    if (Meteor.isServer) {

      res = await ReportsContent.findOne({'owner': ownerId, time:{$gte:startTime / 1000.0, $lte:endTime / 1000.0}})
      return res

    }
  },
  async reportDataDates(ownerId, timezone) {
    if (Meteor.isServer) {

      res = Promise.await(ReportsContent.rawCollection().aggregate([
        {
          '$match':{
              $and: [
                {'owner': ownerId},
                {'time': {$ne: 0}}
              ]
            }
          },{
            $addFields: {
              day: {
                $toDate: {
                  $toLong: {$multiply: ["$time", 1000]}
                }
              }
            }
          },
          {
            $group: {
              _id: {
                $dateToString: {
                  format: "%Y-%m-%d",
                  date: "$day",
                  timezone: timezone
                }
              },
              count: { $sum: 1 }

            }
          }
        ], { allowDiskUse: true }).toArray());
      //console.log(res)
      return res

    }
  },
  async journalDataDates(ownerId, timezone) {
    if (Meteor.isServer) {

      res = Promise.await(Items.rawCollection().aggregate([
        {
          '$match':{'owner': ownerId}
          },{
            $addFields: {
              "day": {
                  "$convert": {
                      "input": "$entryTimestamp",
                      "to": "date"
                  }
              }
            }
          },
          {
            $group: {
              _id: {
                $dateToString: {
                  format: "%Y-%m-%d",
                  date: "$day",
                  timezone: timezone
                }
              },
              count: { $sum: 1 }

            }
          }
        ], { allowDiskUse: true }).toArray());
      //console.log(res)
      return res

    }
  },
  async reportStats(ownerId, startTime, endTime, keys) {
    if (Meteor.isServer) {

      //console.log(endTime / 1000.0)

      res = Promise.await(ReportsContent.rawCollection().aggregate([
        {
          '$match': {
            $and: [
              {'owner': ownerId},
              {'time': { $gte: startTime / 1000.0 }},
              {'time': { $lte: endTime / 1000.0 }}
            ],
            'row': {
              '$exists': false
            }
          }
        }, {
          '$group': {
            '_id': null,
            'degCAverage': {
              '$avg': '$degC'
            },
            'RHAverage': {
              '$avg': '$RH'
            },
            'Gluco1Average': {
              '$avg': '$' + keys['s1']
            },
            'Gluco2Average': {
              '$avg': '$' + keys['s2']
            },
            'Gluco3Average': {
              '$avg': '$' + keys['s3']
            },
            'Gluco4Average': {
              '$avg': '$' + keys['s4']
            },
            'degCMax': {
              '$max': '$degC'
            },
            'RHMax': {
              '$max': '$RH'
            },
            'Gluco1Max': {
              '$max': '$' + keys['s1']
            },
            'Gluco2Max': {
              '$max': '$' + keys['s2']
            },
            'Gluco3Max': {
              '$max': '$' + keys['s3']
            },
            'Gluco4Max': {
              '$max': '$' + keys['s4']
            },
            'degCMin': {
              '$min': '$degC'
            },
            'RHMin': {
              '$min': '$RH'
            },
            'Gluco1Min': {
              '$min': '$' + keys['s1']
            },
            'Gluco2Min': {
              '$min': '$' + keys['s2']
            },
            'Gluco3Min': {
              '$min': '$' + keys['s3']
            },
            'Gluco4Min': {
              '$min': '$' + keys['s4']
            },
            'degCStdDev': {
              '$stdDevSamp': '$degC'
            },
            'RHStdDev': {
              '$stdDevSamp': '$RH'
            },
            'Gluco1StdDev': {
              '$stdDevSamp': '$' + keys['s1']
            },
            'Gluco2StdDev': {
              '$stdDevSamp': '$' + keys['s2']
            },
            'Gluco3StdDev': {
              '$stdDevSamp': '$' + keys['s3']
            },
            'Gluco4StdDev': {
              '$stdDevSamp': '$' + keys['s4']
            }
          }
        }, {
          '$project': {
            'average': {
              'degC': {
                '$round': [
                  '$degCAverage', 2
                ]
              },
              'rh': {
                '$round': [
                  '$RHAverage', 2
                ]
              },
              'glucose1': {
                '$round': [
                  '$Gluco1Average', 2
                ]
              },
              'glucose2': {
                '$round': [
                  '$Gluco2Average', 2
                ]
              },
              'glucose3': {
                '$round': [
                  '$Gluco3Average', 2
                ]
              },
              'glucose4': {
                '$round': [
                  '$Gluco4Average', 2
                ]
              }
            },
            'maximum': {
              'degC': '$degCMax',
              'rh': '$RHMax',
              'glucose1': '$Gluco1Max',
              'glucose2': '$Gluco2Max',
              'glucose3': '$Gluco3Max',
              'glucose4': '$Gluco4Max'
            },
            'minimum': {
              'degC': '$degCMin',
              'rh': '$RHMin',
              'glucose1': '$Gluco1Min',
              'glucose2': '$Gluco2Min',
              'glucose3': '$Gluco3Min',
              'glucose4': '$Gluco4Min'
            },
            'stdDev': {
              'degC': {
                '$round': [
                  '$degCStdDev', 2
                ]
              },
              'rh': {
                '$round': [
                  '$RHStdDev', 2
                ]
              },
              'glucose1': {
                '$round': [
                  '$Gluco1StdDev', 2
                ]
              },
              'glucose2': {
                '$round': [
                  '$Gluco2StdDev', 2
                ]
              },
              'glucose3': {
                '$round': [
                  '$Gluco3StdDev', 2
                ]
              },
              'glucose4': {
                '$round': [
                  '$Gluco4StdDev', 2
                ]
              }
            }
          }
        }
      ]).toArray());
      //console.log(res)
      return res
    }
  },
});
