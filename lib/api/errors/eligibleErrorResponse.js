var _ = require('lodash');
var BaseEligibleError = require('./baseEligibleError');

function EligibleErrorResponse(eligibleResponse, rawJson) {
  var error = 'Eligible returned an error-response\n' +
    'Description: ' + eligibleResponse.error.reject_reason_description + '\n' +
      // This OR is here because fo an Eligible bug, sometimes 'follow_up_action_description' is returned and sometimes 'follow-up_action_description'
    'Recommended follow-up: ' + (eligibleResponse.error['follow_up_action_description'] || eligibleResponse.error['follow-up_action_description']);

  BaseEligibleError.call(error);
  this.message = error;

  _.extend(this, eligibleResponse);
  this.raw = rawJson;
}

EligibleErrorResponse.prototype = Object.create(BaseEligibleError.prototype);

module.exports = EligibleErrorResponse;