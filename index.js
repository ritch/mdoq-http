var request = require('request')
  , qs = require('querystring');

// mdoq-http
module.exports = function (next, use) {
  var self = this
    , operation = this.operation
    , options = {}
    , query = qs.stringify(operation.query);
  
  // transform operation into request options
  options.url = this.url + (query && '?' + query) || '';
  options.method = operation.action.toUpperCase();
  options.json = operation.data || true;
  
  request(options, function(err, res, body) {
    self.res = body;
    next(err);
  });
}