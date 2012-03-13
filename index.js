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
  options.headers = req.headers;

  if((req.method === 'POST' || req.method === 'PUT') && req.body && req.body.readable) {
    req.body.pause();
    req.body.pipe(request(options, function(err, response, body) {
      response && Object.keys(response).forEach(function (key) {
        res[key] = response[key];
      });

      res.data = body;
      next(err);
    }));
    req.body.resume();
  } else {
    if(typeof req.body === 'object') {
      options.json = req.data || true;
    }
    
    request(options, function(err, response, body) {
      // json content type
      if(response && response.headers['content-type'] && ~response.headers['content-type'].indexOf('application/json') && typeof body === 'string') {
        body = JSON.parse(response.body);
      }
      
      response && Object.keys(response).forEach(function (key) {
        res[key] = response[key];
      });

      res.data = body;
      next(err);
    });
  }


}

/**
 * Utils
 */
 
middleware.addHeader = function (key, val) {
  ((this.req = this.req || {}).headers || (this.req.headers = {}))[key] = val;
  return this;
}

/**
 * Export the middleware
 */
 
module.exports = middleware;