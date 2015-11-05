/**
 * Created by matan on 11/4/15.
 */
var BaseEligibleError = require('./baseEligibleError');

function InvalidEligibleRequestError(invalidFields) {
  var error = 'Request data was at invalid format, the flowing fields had invalid values:';


  invalidFields.forEach(function (field) {
    error += '\nfield ' + field.name + ' value was ' + field.value + ', expectation from field: ' + field.type;
  });

  BaseEligibleError.call(error);
  this.message = error;
}

InvalidEligibleRequestError.prototype = Object.create(BaseEligibleError.prototype);

module.exports = InvalidEligibleRequestError;