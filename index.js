var request = require('request')
  , qs = require('querystring');

// mdoq-http
module.exports = function (next, use) {
  var self = this
    , req = this.req
    , options = {}
    , query = qs.stringify(req.query);
  
  // transform req into request options
  options.url = this.url + (query && '?' + query) || '';
  options.method = req.action.toUpperCase();
  options.json = req.data || true;
  
  request(options, function(err, res, body) {
    self.res = body;
    next(err);
  });
}