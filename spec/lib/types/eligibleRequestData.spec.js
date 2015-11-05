/**
 * Created by matan on 11/4/15.
 */
var types = require('../../../lib/types');
var EligibleProviderData = types.EligibleProviderData;
var enums = require('../../../lib/types/enum/');
var NetworkContext = enums.NetworkContext;
var Level = enums.Level;

var EligibleCostEstimateData = types.EligibleCostEstimateData;


describe("Eligible-Provider", function () {
  it("Test Constructor", function () {
    var provider = new EligibleProviderData("Matan", "Lieberman", 11223344);
    expect(provider.firstName).toEqual("Matan");
    expect(provider.lastName).toEqual("Lieberman");
    expect(provider.npi).toEqual(11223344);
  })
});

describe("Eligible-Data-Request", function () {
  beforeAll(function () {
    // Mandatory fields
    this.provider = new EligibleProviderData("Matan", "Liebereman", 11223344);
    this.payerId = 123;
    this.services = [1, 2];
    this.prices = [150, 205.5];
    this.network = NetworkContext.IN;

    // Optional fields
    this.options = {
      placeOfService: 11,
      memberId: "U4209348928",
      memberFirstName: "Shmoopy",
      memberLastName: "McDuck",
      memberDateOfBirth: new Date(1992, 4, 15),
      level: Level.INDIVIDUAL
    };
  });

  it("Test-Constructor mandatory fields only", function () {
    var request = new EligibleCostEstimateData(this.payerId, this.services, this.provider, this.prices, this.network);
    expect(request.payerId).toEqual(this.payerId);
    expect(request.serviceTypes).toEqual(this.services);
    expect(request.providerFirstName).toEqual(this.provider.firstName);
    expect(request.providerLastName).toEqual(this.provider.lastName);
    expect(request.providerNpi).toEqual(this.provider.npi);
    expect(request.providerPrices).toEqual(this.prices);
    expect(request.network).toEqual(this.network);
  });

  it("Test-Constructor optional fields", function () {
    var request = new EligibleCostEstimateData(this.payerId, this.services, this.provider, this.prices, this.network, this.options);

    expect(request.placeOfService).toEqual(this.options.placeOfService);
    expect(request.memberId).toEqual(this.options.memberId);
    expect(request.memberFirstName).toEqual(this.options.memberFirstName);
    expect(request.memberLastName).toEqual(this.options.memberLastName);
    expect(request.memberDateOfBirth).toEqual(this.options.memberDateOfBirth);
    expect(request.level).toEqual(this.options.level);
  });
});
