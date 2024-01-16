import { Meteor } from 'meteor/meteor';


if (Meteor.isServer) {
  Meteor.publish('user', function(options, idArray) {

    if(this.userId) {
      return Meteor.users.find({
        _id: this.userId
      },{
        fields:{
          'username':1,
          'emails':1,
          '_id':1
        }
      });
    }
  });
}
