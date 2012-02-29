var mdoq = require('mdoq')
  , express = require('express')
  , expect = require('chai').expect
  , PORT = 1234
;

function ready(req, res, next) {
  var app = express.createServer();
  
  app.use(express.bodyParser());
  app.use(function(req, res) {
    res.send({
      method: req.method,
      query: req.query,
      url: req.url,
      body: req.body,
      qs: req.url.split('?')[1]
    })
  });
  
  app.on('listening', function() {
    app.isRunning = true;
    next();
  });
  
  app.listen(PORT);
  
  req.app = app;
}

function close(req, res, next) {
  if(req.app.isRunning) {
    req.app.close();
    next();
  }
}

var http = mdoq.use(ready).use(require('../')).use(close).use('http://localhost:' + PORT);

describe('MDOQ HTTP', function(){
  
  describe('mdoq.get()', function(){
    
    it('should receive a response', function(done) {
      http
        .use('/test')
        .get(function(err, res) {
          expect(res).to.exist;
          expect(res.method).to.equal('GET');
          expect(err).to.not.exist;
          expect(res).to.be.a('object');
          expect(res.url).to.equal('/test');
          done(err);
        })
      ;
    })
    
    it('should stringify queries', function(done){
      var statuses = http.get({count: 3, include_entities: true});
      
      expect(statuses.req.query).to.be.a('object');
      expect(statuses.req.query.count).to.equal(3);
      
      statuses.get(function(err, res) {
        expect(res.method).to.equal('GET');
        expect(res.qs).to.equal('count=3&include_entities=true');
        done(err);
      })
    })
    
  })
  
  describe('mdoq.post()', function(){
    
    it('should send the provided data to the server as a post', function(done){
      http.post({test: 123}, function(err, res) {
        expect(res.method).to.equal('POST');
        expect(res.body.test).to.equal(123);
        done(err);
      })
    })

  })
  
  describe('mdoq.put()', function(){
    
    it('should send the provided data to the server as a put', function(done){
      http.put({test: 123}, function(err, res) {
        expect(res.method).to.equal('PUT');
        expect(res.body.test).to.equal(123);
        done(err);
      })
    })

  })
  
  describe('mdoq.update()', function(){
    
    it('should send the provided data to the server as a put', function(done){
      http.update({test: 123}, function(err, res) {
        expect(res.method).to.equal('PUT');
        expect(res.body.test).to.equal(123);
        done(err);
      })
    })

  })
  
  describe('mdoq.del()', function(){
    
    it('should send the provided data to the server as a delete', function(done){
      http.del({test: 123}, function(err, res) {
        expect(res.method).to.equal('DELETE');
        done(err);
      })
    })

  })
  
})