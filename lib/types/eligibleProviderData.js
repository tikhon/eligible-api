/**
 * Created by matan on 11/4/15.
 */
/**
 * @constructor
 * Represents a healthcare provider
 * @param {string} firstName - Provider (person or organization) name
 * @param {string} lastName - Provider (person or organization) last name
 * @param {string} npi - National Provider Identifier, every registered provider is identified by one
 * */
function EligibleProviderData (firstName, lastName, npi) {
  this.firstName = firstName;
  this.lastName = lastName;
  this.npi = npi;
}

module.exports = EligibleProviderData;