/**
 * Created by matan on 11/4/15.
 */
var _ = require('lodash');
/**
 * @constructor
 * @param {string} payerId - Eligible API code for payers (Cigna/Atana/Blue cross etc)
 * @param {Number|[Number]} serviceTypes - A number or an array of service codes the patient will receive from the clinics
 * @param {EligibleProviderData} providerInfo - Preferably instance of EligibleProvider, holds the healthcare provider name, last name and npi.
 * @param {String |[String]} providerPrices - Price (or an array of prices) for said service issued by the different clinics
 * @param {string} networkContext - (use NetworkContext enum) Specifies whether to estimate price as in-network or out of network.
 * Legal values are IN or OUT
 * @param {Number} options.placeOfService - A coded number indicating the place the treatment was given (office/hospital/home etc.)
 * @param {String} options.memberId - Patient membership number.
 * @param {String} options.memberFirstName - Patient private name.
 * @param {String} options.memberLastName - Patient last name.
 * @param {Date} options.memberDateOfBirth - Patient date of birth.
 * @param {String} options.level - (use Level enum) "individual" if the patient is the insured individual or "family" if he is
 * insured due to family relation
 * */
function EligibleCostEstimateData (payerId, serviceTypes, providerInfo, providerPrices, networkContext, options) {
  options = options || {};
  // Mandatory fields
  this.payerId = payerId;
  this.providerPrices = _.isArray(providerPrices) ? providerPrices : [providerPrices];
  this.serviceTypes = _.isArray(serviceTypes) ? serviceTypes : [serviceTypes];
  this.providerFirstName = providerInfo.firstName;
  this.providerLastName = providerInfo.lastName;
  this.providerNpi = providerInfo.npi;
  this.network = networkContext;

  // Optional fields
  this.placeOfService = options.placeOfService || null;
  this.memberId = options.memberId || null;
  this.memberFirstName = options.memberFirstName || null;
  this.memberLastName = options.memberLastName || null;
  this.memberDateOfBirth = options.memberDateOfBirth || null;
  this.level = options.level || null;
}

module.exports = EligibleCostEstimateData;