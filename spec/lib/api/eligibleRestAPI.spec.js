/**
 * Created by matan on 11/4/15.
 */
var _ = require('lodash');
var types = require('../../../lib/types');
var EligibleProviderData = types.EligibleProviderData;
var EligibleCostEstimateData = types.EligibleCostEstimateData;
var NetworkContext = types.NetworkContext;
var Level = types.Level;

var errors = require('../../../lib/api/errors');
var InvalidEligibleRequestError = errors.InvalidEligibleRequestError;
var EligibleErrorResponse = errors.EligibleErrorResponse;

var EligibleRestApiInternal = require('../../../lib/api/eligibleRestAPI/internals');
var EligibleRestAPI = require('../../../lib/api/eligibleRestAPI');

describe("BookMdthis.eligibleApi.convertRequestToUrlParams", function () {
  
  beforeAll(function () {
    this.eligibleApi = EligibleRestApiInternal;
    this.provider = new EligibleProviderData("Big", "Daddy", '286123');
    this.optinalFileds = ["place_of_service", "member_id", "member_first_name", "member_last_name", "member_dob", "level"];
    this.mandatoryFileds = ["api_key", "payer_id", "service_type", "provider_first_name", "provider_last_name", "provider_npi", "provider_price", "network"]
  });

  beforeEach(function () {
    this.request = new EligibleCostEstimateData(123, 1, this.provider, 150.5, NetworkContext.IN);
    this.apiKey = "veryveryrandomkey!";
    this.expectedObject = {
      api_key: this.apiKey,
      payer_id: '123',
      service_type: '1',
      provider_first_name: "Big",
      provider_last_name: "Daddy",
      provider_npi: '286123',
      provider_price: '150.5',
      network: "IN"
    };
  });

  it("Check valid mandatory fields", function () {
    var params = this.eligibleApi.convertToUrlParams(this.request, this.apiKey);
    expect(params).toEqual(this.expectedObject);
  });

  it("Check for no optional fields", function () {
    var params = this.eligibleApi.convertToUrlParams(this.request, this.apiKey);
    for (var i = 0; i > this.optinalFileds.length; ++i) {
      expect(this.optinalFileds[i] in params).toBe(false);
    }
  });

  it("Check optional fields added", function () {
    this.request.placeOfService = 11;
    this.request.memberId = "U9843294132";
    this.request.memberFirstName = "Shmoopy";
    this.request.memberLastName = "McDuck";
    this.request.memberDateOfBirth = new Date(1992, 0, 15);
    this.request.level = Level.INDIVIDUAL;

    _.extend(this.expectedObject, {
      place_of_service: '11',
      member_id: 'U9843294132',
      member_first_name: 'SHMOOPY',
      member_last_name: "MCDUCK",
      member_dob: "1992-01-15",
      level: 'INDIVIDUAL'
    });

    var params = this.eligibleApi.convertToUrlParams(this.request, this.apiKey);
    expect(params).toEqual(this.expectedObject);
  });

  it("Check no additional fields", function () {
    this.request.placeOfService = 11;
    this.request.memberId = "U9843294132";
    this.request.memberFirstName = "Shmoopy";
    this.request.memberLastName = "McDuck";
    this.request.memberDateOfBirth = new Date(1992, 4, 15);
    this.request.level = Level.INDIVIDUAL;
    var params = this.eligibleApi.convertToUrlParams(this.request, this.apiKey);

    var allFields = this.mandatoryFileds.concat(this.optinalFileds);
    for (var fieldName in params) {
      expect(allFields.indexOf(fieldName)).not.toEqual(-1);
    }
  });

  it("Check prices array spread correctly", function () {
    this.request.providerPrices = [100, 312, 423, 23, 75];
    var params = this.eligibleApi.convertToUrlParams(this.request, this.apiKey);

    expect(params.provider_price).toEqual("100,312,423,23,75");
  });

  it("Check service types array spread correctly", function () {
    this.request.serviceTypes = [11, 4, 35, 67];
    var params = this.eligibleApi.convertToUrlParams(this.request, this.apiKey);

    expect(params.service_type).toEqual("11,4,35,67");
  });
});

describe("BookMdeligibleApi.costEstimate", function () {
  beforeAll(function () {
    this.eligibleApi = EligibleRestApiInternal;
    this.apiKey = "whatalovelyrandomstring";
  });

  beforeEach(function () {
    options = {
      placeOfService: 11,
      memberId: "U9843294132",
      memberFirstName: "Shmoopy",
      memberLastName: "McDuck",
      memberDateOfBirth: new Date(1992, 0, 15),
      level: Level.INDIVIDUAL
    };
    this.request = new EligibleCostEstimateData("0001", 1, new EligibleProviderData("Big", "Daddy", "8405830571"), [250.3, 150.2],
      NetworkContext.IN, options);
  });

  describe("Request-Validation", function () {
    var prefix = "Buthead";
    beforeAll(function () {
      errors = {
        PAYER_ID: /payerId.*null.*required/,
        NO_PRICE: /providerPrices.*null.*required/,
        PRICE_FORMAT: /providerPrices.*expectedArray/,
        NO_SERVICE_TYPE: /serviceTypes.*null.*required/,
        SERVICE_TYPE_FORMAT: /serviceTypes.*expectedArray/,
        MISSING_PROVIDER_NPI: /providerNpi.*null.*required/,
        MISSING_PROVIDER_FIRST_NAME: /providerFirstName.*null.*required/,
        MISSING_PROVIDER_LAST_NAME: /providerLastName.*null.*required/,
        MISSING_NETWORK: /network.*null.*required/,
        NETWORK_FORMAT: /network.*notAllowed/,
        BIRTH_DATE_FORMAT: /memberDateOfBirth.*expectedConstructor/,
        LEVEL_FORMAT: /level.*notAllowed/,
      };
    });

    it("Check payer id missing", function () {
      this.request.payerId = undefined;
      expect(() => {
        this.eligibleApi.validateRequest(this.request)
      }).toThrowError(InvalidEligibleRequestError, errors.PAYER_ID);
    });

    it("Check provider price missing", function () {
      this.request.providerPrices = undefined;
      expect(() => {
        this.eligibleApi.validateRequest(this.request)
      }).toThrowError(InvalidEligibleRequestError, errors.NO_PRICE);
    });

    it("Check provider price bad format", function () {
      this.request.providerPrices = "supercalifragilisticexpialidocious!";
      expect(() => {
        this.eligibleApi.validateRequest(this.request)
      }).toThrowError(InvalidEligibleRequestError, errors.PRICE_FORMAT);
    });

    it("Check service type missing", function () {
      this.request.serviceTypes = undefined;
      expect(() => {
        this.eligibleApi.validateRequest(this.request)
      }).toThrowError(InvalidEligibleRequestError, errors.NO_SERVICE_TYPE);
    });

    it("Check service type bad format", function () {
      this.request.serviceTypes = "supercalifragilisticexpialidocious!";
      expect(() => {
        this.eligibleApi.validateRequest(this.request)
      }).toThrowError(InvalidEligibleRequestError, errors.SERVICE_TYPE_FORMAT);
    });

    it("Check provider detail missing", function () {
      this.request.providerFirstName = undefined;
      expect(() => {
        this.eligibleApi.validateRequest(this.request)
      }).toThrowError(InvalidEligibleRequestError, errors.MISSING_PROVIDER_FIRST_NAME);

      this.request.providerFirstName = "Shmoopy";
      this.request.providerLastName = undefined;
      expect(() => {
        this.eligibleApi.validateRequest(this.request)
      }).toThrowError(InvalidEligibleRequestError, errors.MISSING_PROVIDER_LAST_NAME);

      this.request.providerLastName = "McDuck";
      this.request.providerNpi = undefined;
      expect(() => {
        this.eligibleApi.validateRequest(this.request)
      }).toThrowError(InvalidEligibleRequestError, errors.MISSING_PROVIDER_NPI);
    });

    it("Check network missing", function () {
      this.request.network = undefined;
      expect(() => {
        this.eligibleApi.validateRequest(this.request)
      }).toThrowError(InvalidEligibleRequestError, errors.MISSING_NETWORK);
    });

    it("Check network format", function () {
      this.request.network = "supercalifragilisticexpialidocious!";
      expect(() => {
        this.eligibleApi.validateRequest(this.request)
      }).toThrowError(InvalidEligibleRequestError, errors.NETWORK_FORMAT);
    });

    it("Check member birth date bad format", function () {
      this.request.memberDateOfBirth = "supercalifragilisticexpialidocious!";
      expect(() => {
        this.eligibleApi.validateRequest(this.request)
      }).toThrowError(InvalidEligibleRequestError, errors.BIRTH_DATE_FORMAT);
    });

    it("Check level field bad format", function () {
      this.request.level = "supercalifragilisticexpialidocious!";
      expect(() => {
        this.eligibleApi.validateRequest(this.request)
      }).toThrowError(InvalidEligibleRequestError, errors.LEVEL_FORMAT);

      this.request.level = 15;
      expect(() => {
        this.eligibleApi.validateRequest(this.request)
      }).toThrowError(InvalidEligibleRequestError, errors.LEVEL_FORMAT);
    });
  });

  describe("Request-Response", function () {
    beforeAll(function () {
      this.eligibleApi = new EligibleRestAPI(false);
      this.apiKey = process.env.ELIGIBLE_TESTING_KEY;
    });

    it("Invalid API key", function (done) {
      this.eligibleApi.costEstimate(this.request, "WrongApiKey", function(err, res){
        if (res) done.fail();

        expect(err instanceof Error).toBeTruthy();
        expect(err.message).toMatch(/authenticate.*re-try.*valid API key/);
        done();
      });
    });

    // Sending this member Id to eligible sandbox will result in an Invalid/Missing subscriber error been returned.
    const eligibleInvalidSubscriberTrigger = 'U1212ERR72';
    it('Handle returned error', function (done) {
      expect(this.apiKey).toBeDefined();

      this.request.memberId = eligibleInvalidSubscriberTrigger;
      this.eligibleApi.costEstimate(this.request, this.apiKey, function (err, res) {
        if (res) done.fail();

        expect(err instanceof EligibleErrorResponse).toBeTruthy();
        expect(err.message).toMatch(/Invalid\/Missing Subscriber Id(.|\n)*Please Correct and Resubmit/m);
        done();
      });
    });

    it("Valid request", function (done) {
      expect(this.apiKey).toBeDefined();

      this.eligibleApi.costEstimate(this.request, this.apiKey, function (err, res) {
        if (err) done.fail();

        // Currently Eligible-API sandbox always returns the same answer regardless of the request.
        // For know, check for exact amount. When Eligible will return a proper response, this test will fail, and
        // we will know we can write more and better test.
        expect(Object.keys(res.costEstimates).length).toBe(5);
        expect(res.costEstimates[100]).toBe(20);
        expect(res.costEstimates[500]).toBe(100);
        expect(res.costEstimates[1000]).toBe(200);
        expect(res.costEstimates[5000]).toBe(1000);
        expect(res.costEstimates[10000]).toBe(2000);
        done();
      });
    });
  })
});