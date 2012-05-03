var request = require('request')
  , qs = require('querystring');

/**
 * Simple wrapper around `request`.
 */

var middleware = function(req, res, next, use) {
  var self = this
    , options = {}
    , query = qs.stringify(req.query)
    , stream
  ;

  // build options
  options.url = req.url + (query && '?' + query) || '';
  options.method = req.method;
  options.headers = req.headers;

  switch(req.method) {
    case 'POST':
    case 'PUT':
      if(req.body && req.body.readable && typeof req.body.pipe === 'function') {
        stream = req.body
        break;
      } else if(Buffer.isBuffer(req.body || req.data)) {
        options.body = req.body || req.data;
      } else if(typeof req.body === 'object') {
        options.json = req.body;
      } else {
        options.body = req.body || req.data;
      }
    case 'GET':
    case 'DELETE':
    default:
    break;
  }
  
  // exec
  var r = request(options, function (err, response, body) {
    
    // merge response objects
    response && Object.keys(response).forEach(function (key) {
      res[key] = response[key];
    });
    
    // parse if json
    if(isJSON(response, body)) {
      body = res.data = JSON.parse(response.body);
    }
    
    // mdoq compatability
    res.data = body;
    
    next(err);
  });
  
  // stream up
  if(stream) {
    stream.pipe(r);
    stream.resume();
  }
  
  // stream down
  req.destinationStream && r.pipe(req.destinationStream);
}

/**
 * Utils
 */
 
function isJSON(response, body) {
  return response
    && typeof body === 'string'
    && response.headers['content-type']
    && ~response.headers['content-type'].indexOf('application/json')
  ;
}
 
middleware.addHeader = function (key, val) {
  ((this.req = this.req || {}).headers || (this.req.headers = {}))[key] = val;
  return this;
}

middleware.pipe = function (destination) {
  this.req.destinationStream = destination;
  return this;
}

/**
 * Export the middleware
 */
 
module.exports = middleware;