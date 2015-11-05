var _ = require('lodash');
var BaseEligibleError = require('./baseEligibleError');

function EligibleErrorResponse(eligibleResponse, rawJson) {
  var error = 'Eligible returned an error-response\n' +
    'Description: ' + eligibleResponse.error.reject_reason_description + '\n' +
    'Recommended follow-up: ' + eligibleResponse.error['follow-up_action_description'];

  BaseEligibleError.call(error);
  this.message = error;

  _.extend(this, eligibleResponse);
  this.raw = rawJson;
}

EligibleErrorResponse.prototype = Object.create(BaseEligibleError.prototype);

module.exports = EligibleErrorResponse;