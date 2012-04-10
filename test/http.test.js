var mdoq = require('mdoq')
  , express = require('express')
  , expect = require('chai').expect
  , PORT = 1234
  , fs = require('fs')
;

var app;

beforeEach(function(done){
  app = express.createServer();
  app.use(express.bodyParser());
  
  app.get('/file', function (req, res, next) {
    // res.download(__dirname + '/support/eg.jpg');
    fs.createReadStream(__dirname + '/support/eg.jpg').pipe(res);
  })
  
  app.use(function(req, res) {
    
    if(req.url === '/empty') return res.end();
    
    if(req.method == 'POST' && ~req.headers['content-type'].indexOf('jpeg')) { 
      res.header('Content-Type', req.header('Content-Type'));
      req.pipe(res);
    } else {
      res.send({
        method: req.method,
        query: req.query,
        url: req.url,
        body: req.body,
        qs: req.url.split('?')[1],
        headers: req.headers,
        resHeaders: res.headers
      })
    }
  });
  
  app.once('listening', function () {
    done();
  })
  
  app.listen(PORT);
})

afterEach(function(){
  app.close();
})

var http = mdoq.use(require('../')).use('http://localhost:' + PORT);

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
  
  describe('Nested Requests', function(){
    it('should not lose context', function(done) {
      http.use('/test').get(function(err, body, req, res) {
        expect(body).to.exist;
        expect(body.method).to.equal('GET');
        expect(err).to.not.exist;
        expect(body).to.be.a('object');
        expect(body.url).to.equal('/test');
        expect(res).to.exist;
        expect(res.statusCode).to.equal(200);
        http.use('/test1').put({test: 123}, function(err, body, req, res) {
          expect(body.method).to.equal('PUT');
          expect(body.body.test).to.equal(123);
          expect(body.url).to.equal('/test1');
          expect(res).to.exist;
          expect(res.statusCode).to.equal(200);
          http.use('/empty').post({test: 123}, function(err, body, req, res) {
            expect(body).to.not.exist;
            http.use('/test2').del(function(err, body, req, res) {
              expect(body.method).to.equal('DELETE');
              expect(res).to.exist;
              expect(res.statusCode).to.equal(200);
              expect(body.url).to.equal('/test2');
              done(err);
            })
          })
        })
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
  
  describe('Streaming File', function(){
    it('should stream the file to the server', function(done) {
      var file = require('fs').createReadStream(__dirname + '/support/eg.jpg');
      
      http.post(file, function (err, res) {
        expect(res).to.exist;
        done(err);
      });
    });
    
    it('should stream the file', function(done) {
      var out = fs.createWriteStream(__dirname + '/support/got-eg.jpg');
      
      http.use('/file').pipe(out).get(function (err) {
        done(err);
      });
    })
  })
})