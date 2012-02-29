var request = require('request')
  , qs = require('querystring');

// mdoq-http
module.exports = function(req, res, next, use) {
  var self = this
    , options = {}
    , query = qs.stringify(req.query);

  // transform req into request options
  options.url = req.url + (query && '?' + query) || '';
  options.method = req.method;
  options.json = req.data || true;

  request(options, function(err, response, body) {
    res.data = body;
    next(err);
  });
}