import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { HTTP } from 'meteor/http';

export function riskEngineScore(entryId, userId) {
  check(entryId, String);
  check(userId, String);
  this.unblock();

  let janaruRiskEngineUrl = process.env.RISK_ENGINE_URL || Meteor.settings.private.janaruRiskEngine.url;
  let janaruRiskEngineToken = process.env.RISK_ENGINE_TOKEN || Meteor.settings.private.janaruRiskEngine.token;


  try {
    var result = HTTP.call("GET",janaruRiskEngineUrl,{
      params: {
        entryId: entryId,
        userId: userId,
        token: janaruRiskEngineToken
      }
    });

    return result;
  } catch (e) {
    // Got a network error, time-out or HTTP error in the 400 or 500 range.
    throw new Meteor.Error(400, "Error connecting to risk engine");
  }
}


Meteor.methods({
  riskEngineScore
});
