/**
 * Created by matan on 11/5/15.
 */
var _ = require('lodash');
var api = require('./api');
var types = require('./types');

module.exports = _.extend(api, types);