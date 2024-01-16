import { Meteor } from 'meteor/meteor';

import { Images } from './collection';

if (Meteor.isServer) {
  Meteor.publish('image', function(options, itemId) {
    const selector = {
      $and: [{
        $or: [{
          // approved images
          $and: [{
            approved: true
          }, {
            approved: {
              $exists: true
            }
          }]
        }, {
          // when logged in user is the owner
          $and: [{
            owner: this.userId
          }, {
            owner: {
              $exists: true
            }
          }]
        }]
      },{
          itemId: itemId
      }]
    };
    return Images.find(selector, options);
  });


  Meteor.publish('userImages', function() {
    return Images.find({owner: this.userId},{limit: 100});
  })
}
