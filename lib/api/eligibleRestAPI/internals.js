/**
 * Created by matan on 11/4/15.
 */
var SimpleSchema = require("node-simple-schema");
var moment = require('moment');
var https = require('https');
var _ = require('lodash');

var enums = require('../../types/enum');
var NetworkContext = enums.NetworkContext;
var Level = enums.Level;

var errors = require('../errors');
var InvalidEligibleRequestError = errors.InvalidEligibleRequestError;
var EligibleErrorResponse = errors.EligibleErrorResponse;

var EligibleRequestSchema = new SimpleSchema({
  payerId: {
    type: String
  },
  providerPrices: {
    type: [Number],
    decimal: true
  },
  serviceTypes: {
    type: [String],
    decimal: true
  },
  providerFirstName: {
    type: String
  },
  providerLastName: {
    type: String
  },
  providerNpi: {
    type: String
  },
  network: {
    type: String,
    allowedValues: Object.keys(NetworkContext)
  },
  memberId: {
    type: String,
    optional: true
  },
  memberFirstName: {
    type: String,
    optional: true
  },
  memberLastName: {
    type: String,
    optional: true
  },
  memberDateOfBirth: {
    type: Date,
    optional: true
  },
  level: {
    type: String,
    allowedValues: Object.keys(Level),
    optional: true
  }
});

const ELIGIBLE_API_ENDPOINT = process.env.ELIGIBLE_API_ENDPOINT || "https://gds.eligibleapi.com/v1.5";
var EligibleRestApiInternal = {
  debugMode: false,
  /**
   * Intended to be a private method.
   * Checks if a given cost estimation request is in a valid format.
   * @param {EligibleCostEstimateData} eligibleRequest - Preferably an instance of EligibleCostEstimateData,
   * is the validated request.
   * @returns {undefined} NO RETURN VALUE. methods throws an error if invalid.
   * @throws InvalidEligibleRequestError in case the inputted request is invalid.
   * */
  validateRequest: function (eligibleRequest) {
    var req = _.extend({}, eligibleRequest);
    EligibleRequestSchema.clean(req);
    var context = EligibleRequestSchema.newContext();
    if (!context.validate(req)) {
      throw new InvalidEligibleRequestError(context.invalidKeys())
    }
  },

  /**
   * Intended to be a private method.
   * Converts a normal cost estimation request to a format expected by eligible api.
   * @param {EligibleCostEstimateData} requestData - Preferably an instance of EligibleCostEstimateData,
   * is the request to be converted.
   * @param {String} apiKey - A private api key issued by Eligible-API (can either be live, staging or sandbox).
   * @returns {object} Anonymous objects with the fields named as expected by eligible, with converted values in depending on the fields.
   * */
  convertToUrlParams: function (requestData, apiKey) {
    var options = {
      api_key: apiKey,
      // If array, spread to "value1,value2,value3"
      provider_price: Array.isArray(requestData.providerPrices) ? requestData.providerPrices.join(",") : requestData.providerPrices.toString(),
      service_type: Array.isArray(requestData.serviceTypes) ? requestData.serviceTypes.join(",") : requestData.serviceTypes.toString(),
      network: requestData.network.toString(),
      payer_id: requestData.payerId.toString(),
      provider_last_name: requestData.providerLastName.toString(),
      provider_first_name: requestData.providerFirstName.toString(),
      provider_npi: requestData.providerNpi.toString()
    };

    // Optional Fields
    if (requestData.placeOfService) {
      options.place_of_service = requestData.placeOfService.toString();
    }
    if (requestData.memberId) {
      options.member_id = requestData.memberId.toString();
    }
    if (requestData.memberFirstName) {
      options.member_first_name = requestData.memberFirstName.toUpperCase();
    }
    if (requestData.memberLastName) {
      options.member_last_name = requestData.memberLastName.toUpperCase();
    }
    if (requestData.memberDateOfBirth) {
      var dateWrapper = new moment(requestData.memberDateOfBirth);
      options.member_dob = dateWrapper.format("YYYY-MM-DD");
    }
    if (requestData.level) {
      options.level = requestData.level.toString();
    }

    return options;
  },

  /**
   * Sends request to eligible and perform basic handling
   * @param {string} endpoint Required eligible service, for example: 'coverage/cost_estimates.json'
   * @param {object} eligibleParams Represents the parameters required to perform an cost estimation by eligible.
   * Filed names should be in eligible API naming format.
   * @returns {object} The eligible original json response in an object form, plus these additional fields:
   * raw - In case activated in debugMod, raw original json response
   * @throws {EligibleErrorResponse} Thrown in case Eligible returns a logical response-error
   */
    estimationRequest: function(endpoint, eligibleParams, callback){
    var url = ELIGIBLE_API_ENDPOINT + '\\' + endpoint;
    if(eligibleParams){
      url += '?';
      var first = true;
      for (var paramName in eligibleParams){
        var suffix = paramName + '=' + eligibleParams[paramName];

        if (!first) suffix = '&' + suffix;
        first = false;

        url += suffix;
      }
    }

    var self = this;
    https.get(url, function (incomingMessage) {
      var stringData = '';
      incomingMessage.on('data', function (chunk) {
        stringData += chunk.toString('utf8');
      });

      incomingMessage.on('end', function () {
        try {
          var dataObj = JSON.parse(stringData);
          if (dataObj.error) {
            callback(new EligibleErrorResponse(dataObj, stringData), undefined);
          } else {
            callback(undefined, self.debugMode ? _.extend({raw: stringData}, dataObj) : dataObj);
          }
        } catch (exception) {
          callback(exception instanceof SyntaxError ? new Error(stringData) : exception, undefined);
        }
      });

      incomingMessage.on('error', function (err) {
        callback(err, undefined);
      })
    });
  }
};

module.exports = EligibleRestApiInternal;