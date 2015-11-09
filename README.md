[![Circle CI](https://circleci.com/gh/bookmd/eligible-api.svg?style=shield)](https://circleci.com/gh/bookmd/eligible-api)

# eligible-api
Node implementation for Eligible (https://eligible.com/) REST API

* [Install](#install)
* [General](#general)
* [Usage](#usage)
    * [Cost Estimations](#cost-estimations)
* [Mocking](#mocking)
* [Configuration](configuration)

## Install
`npm install eligible-api`
Note: Version 0.1.0 is the first stable version, avoid using versions 0.0.x.

## General
This package is aimed to help users of EligibleAPI to gain quick, simple and easy access to the REST API services.

The package currently contains implementation only to the cost_estimations service, but more will be added in the future, and anyone is welcome to contribute.

## Usage
In normal usage of this package, you should normally only require eligible-api (i.e `require('eligible-api)`). The returned object should containing all the types, enums & error you will normally use.

The only types not included in said object is mocking class. Check out [Mocking](#mocking) to learn more.

Following below are the main modules, how interact with the eligible services and how they are used.

### Cost Estimations
Correlates to cost_estimates service.
Create an instance of `EligibleRestAPI`, and call `costEstimate`. The function takes the following parameters:
- requestData - An instance of `EligibleCostEstimateData`, a data type containing all the fields required to perform a cost estimation.
- apiKey - Your api key issued by Eligible.
- callback - `function (err, res)`

If all goes well the function will return via the provided callback a price mapping, i.e an object containing a property for each original price, and it's value is the estimated price the consumer will pay based on eligible response.

The function may return the following errors
- `InvalidEligibleRequestError` - In case the provided request data is not in the valid format. The error message will contain the invalid fields and what was actually expected. 
- `EligibleErrorResponse` - Returned in case a error-response was returned from Eligible (for example in case the memberId does not match the member name).
- `Error` - Returned in case an unexpected has occurred or in case an invalid apiKey had been used.

Example:
```javascript
var eligibleApi = require('eligible-api');

// Optional fields for CostEstimationData
var options = {
    placeOfService: 12,
    memberId: 'U1212ERR72',
    memberFirstName: 'Shmoopy',
    memberLastName: 'McDuck',
    memberDateOfBirth: new Date(), // Should be an acctual date
    level: eligibleApi.Level.INDIVIDUAL
};

var provider = new eligibleApi.EligibleProviderData('Snake', 'Oil', '123456');

var estimationData = new eligibleApi.EligibleCostEstimateData ('68475', 11, provider, 1500, eligibleApi.NetworkContext.IN, options);

var eligibleRestApi = new eligibleApi.EligibleRestAPI();
var estimationMap = eligibleRestApi.costEstimate(estimationData, 'YouApiKeyHere', function(err, res){
    if (err){
        // Handle errors and what not
    } else {
        for (var price in res.costEstimates){
            console.log ('Original price: ' + price);
            console.log('Out of that, consumer portion is' + res.costEstimates[price]);
        }
    }
}
```
## Mocking
The package includes a mocking class which can be used for testing or outside of the prod environment in case you don't whant your system quring Eligible in your dev & staging environment.

This class, named `MockEligible`, is not included in the basic require statment, in if you wish to use it you mast require it specificly via `require('eligible-api/lib/api/mockEligible')`.

The class includes mocking implementation of all methods public methods included in `EligibleRestAPI`. These methods are defined with the same signture but return a faek answer without acctually quireing Eligible, threfore you can replace the instance in your system for the mock.

### Mock Cost Estimation
The costEstimation mock returns the same form of map returned by the real implementation but instead of quireing Eligible for the estimated prices, the map keys and values are equal, meaning that for a price of X the cost estimation will be X as well.

## Configuration
There are several environment variables used by the package. In code related to prod a default value is used in case not environment variable is defined. In the test-suite some environment variable do not have a default value an if no value is set the test will fail.

### Prod Values
* __ELIGIBLE_API_ENDPOINT__
    * Usage - Defines the prefix all Eligible services url.
    * Default Value - https://gds.eligibleapi.com/v1.5
* __COST_ESTIMATE_API__
    * Usage - Defines the suffix of the cost estimation service url.
    * Default Value - coverage/cost_estimates.json

### Test Valus
* __ELIGIBLE_TESTING_KEY__
    * Usage - Defines the sandbox API key issued by Eligible to you.
    * Default Value - Non. If not configured some test will fail.
