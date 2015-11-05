/**
 * Created by matan on 11/4/15.
 */
function BaseEligibleError(message){
  Error.call(message);
  this.message = message;
  this.name = this.constructor.name;

  if (Error.captureStackTrace){
    Error.captureStackTrace(this, this.constructor.name);
  }
}

BaseEligibleError.prototype = Object.create(Error.prototype);

module.exports = BaseEligibleError;