/**
 * Created by matan on 11/4/15.
 */
/**
 * This is a dummy class to use instead of eligibleRestAPI in demos.
 * Since Eligible sandbox returns the same response for every call you can use this class for system testing
 * or demoing when you are not testing the eligible service itself.
 */
function MockEligible(){}

MockEligible.prototype = {
  /**
   * Mock price estimation, maps every price to itself, member pays for everything
   * @param {[Number]} requestData.providerPrices An array of provider prices
   * @returns {Object|undefined} a map for every price to itself.
   * returns undefined if requestData does not have property providerPrices.
   */
  costEstimate: function (requestData, apiKey, callback) {
    if(!requestData.providerPrices) return;

    var priceMap = {};
    requestData.providerPrices.forEach(function(price) {
      priceMap[price] = price
    });

    callback(undefined, {costEstimates: priceMap, raw: 'Not supported yet'});
  }
};

module.exports = MockEligible;