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
      qs: req.url.split('?')[1],
      headers: req.headers
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
        .get(function(err, body, req, res) {
          expect(body).to.exist;
          expect(body.method).to.equal('GET');
          expect(err).to.not.exist;
          expect(body).to.be.a('object');
          expect(body.url).to.equal('/test');
          expect(res).to.exist;
          expect(res.statusCode).to.equal(200);
          done(err);
        })
      ;
    })
    
    it('should stringify queries', function(done){
      var statuses = http.get({count: 3, include_entities: true});
      
      expect(statuses.req.query).to.be.a('object');
      expect(statuses.req.query.count).to.equal(3);
      
      statuses.get(function(err, body, req, res) {
        expect(body.method).to.equal('GET');
        expect(body.qs).to.equal('count=3&include_entities=true');
        expect(res).to.exist;
        expect(res.statusCode).to.equal(200);
        done(err);
      })
    })
    
    it('should still work even if there is not a response', function(done) {
      mdoq
        .require('mdoq-http')
        .use('http://this-url-does-not-exist.flargnargs/foo/bar/' + Math.random())
        .get(function(err, body, req, res) {
          expect(err).to.exist;
          expect(err.code).to.equal('ENOTFOUND');
          expect(res).to.not.exist;
          done();
        })
      ;
    })
    
  })
  
  describe('mdoq.post()', function(){
    
    it('should send the provided data to the server as a post', function(done){
      http.post({test: 123}, function(err, body, req, res) {
        expect(body.method).to.equal('POST');
        expect(body.body.test).to.equal(123);
        expect(res).to.exist;
        expect(res.statusCode).to.equal(200);
        
        done(err);
      })
    })

  })
  
  describe('mdoq.put()', function(){
    
    it('should send the provided data to the server as a put', function(done){
      http.put({test: 123}, function(err, body, req, res) {
        expect(body.method).to.equal('PUT');
        expect(body.body.test).to.equal(123);
        expect(res).to.exist;
        expect(res.statusCode).to.equal(200);
        done(err);
      })
    })

  })
  
  describe('mdoq.update()', function(){
    
    it('should send the provided data to the server as a put', function(done){
      http.update({test: 123}, function(err, body, req, res) {
        expect(body.method).to.equal('PUT');
        expect(body.body.test).to.equal(123);
        expect(res).to.exist;
        expect(res.statusCode).to.equal(200);
        done(err);
      })
    })

  })
  
  describe('mdoq.del()', function(){
    
    it('should send the provided data to the server as a delete', function(done){
      http.del({test: 123}, function(err, body, req, res) {
        expect(body.method).to.equal('DELETE');
        expect(res).to.exist;
        expect(res.statusCode).to.equal(200);
        done(err);
      })
    })

  })
  
  describe('Modifiers', function(){
    describe('client.addHeader(key, val)', function(){
      it('should add the header to the request', function(done) {
        http.addHeader('foo', 'bar').get(function (err, res) {
          expect(res.headers).to.exist;
          expect(res.headers.foo).to.equal('bar');
          done(err);
        })
      })
    })
  })
  
})