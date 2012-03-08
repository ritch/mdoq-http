var request = require('request')
  , qs = require('querystring');

/**
 * Simple wrapper around `request`.
 */

var middleware = function(req, res, next, use) {
  var self = this
    , options = {}
    , query = qs.stringify(req.query);

  // transform req into request options
  options.url = req.url + (query && '?' + query) || '';
  options.method = req.method;
  options.json = req.data || true;
  options.headers = req.headers;

  request(options, function(err, response, body) {
    response && Object.keys(response).forEach(function (key) {
      res[key] = response[key];
    });
    
    res.data = body;
    next(err);
  });
}

/**
 * Utils
 */
 
middleware.addHeader = function (key, val) {
  (this.req.headers || (this.req.headers = {}))[key] = val;
  return this;
}

/**
 * Export the middleware
 */
 
module.exports = middleware;