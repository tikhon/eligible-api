/**
 * Created by matan on 11/4/15.
 */
var internals = require("./internals");

const COST_ESTIMATE_API = process.env.COST_ESTIMATE_API || "coverage/cost_estimates.json";

/**
 * Creates an instance of EligibleRestAPI
 * @param {boolean} debugMode Optional, if set to true callback result will contain the full json response in 'raw' property
 * @constructor
 */
function EligibleRestAPI(debugMode){
  internals.debugMode = debugMode || false;
}

EligibleRestAPI.prototype = {
    /**
   * Request a cost estimation from Eligible-API.
   * @param {EligibleCostEstimateData} requestData - Preferably an instance of EligibleCostEstimateData,
   * holds all relevant data needed to query the eligible service.
   * @param {string} apiKey - A private api key issued by Eligible-API (can either be live, staging or sandbox).
   * @returns {object} The eligible original json response in an object form, plus these additional fields:
   * costEstimates - Object mapping original price to estimated customer-pay price (if success)
   * raw - In case class has been created with debugMode true, raw will contain the original json response.
   * @throws {EligibleErrorResponse} Thrown in case Eligible returns a logical response-error
   * */
  costEstimate: function(requestData, apiKey, callback) {
    internals.validateRequest(requestData);
    internals.estimationRequest(COST_ESTIMATE_API, internals.convertToUrlParams(requestData, apiKey),
      function (error, result) {
        if (error){
          callback(error, undefined);
        } else {
          var priceMap = {};
          result.cost_estimates.forEach(function(priceEstimation) {
            priceMap[priceEstimation.provider_price] = priceEstimation.cost_estimate
          });

          result.costEstimates = priceMap;

          callback(undefined, result)
        }
      });
  }
};

module.exports = EligibleRestAPI;
