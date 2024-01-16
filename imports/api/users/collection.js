if (Meteor.isCordova) Ground.Collection(Meteor.users);

Meteor.users.allow({

});

Meteor.users.deny({
  update: function() {
    return true;
  }
});
