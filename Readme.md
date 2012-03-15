# mdoq-http

**HTTP** [request](https://github.com/mikeal/request) (**Node.js**) and [jQuery](http://api.jquery.com/jQuery.ajax/) (**browser**) middleware for [mdoq](https://github.com/ritch/mdoq).

## Installation

    npm install mdoq-http

## **mdoq**

[Mdoq](https://github.com/ritch/mdoq) provides a consistent **HTTP** style API that lets you re-use middleware across different sources of data in **Node.js** and the **browser** (expiremenatl).

## Examples

**Node.js**

    var mdoq = require('mdoq')
      , twitter = mdoq.require('mdoq-http').use('https://api.twitter.com')
      , statuses = twitter.use('/1/statuses/public_timeline.json')
    ;

    statuses.get({count: 3, include_entities: true}, function(err, res) {
      console.info(res);
    });

## Middleware

Combine with other [mdoq](https://github.com/ritch/mdoq) middleware to pipe data between multiple sources.

    statuses
      .use(function(req, res, next, use) {
        // tell mongodb middleware to store tweets
        if(res) {
          req.method = 'post';
          use(require('mdoq-mongodb'));
        }
    
        next();
      })
      .get({count: 20}, function(err, res) {
        console.info('These were returned from twitter and stored in mongodb', res);
      })
    ;

## Streaming Files

Post a file to stream over HTTP.

    require('mdoq')
      .require('mdoq-http')
      .use('http://foo.com/upload')
      .post(fs.createReadStream('./file.jpg'), function(err) {
        console.info(err || 'uploaded!');
      })
    ;

Pipe the output of the response to a stream.

    require('mdoq')
      .require('mdoq-http')
      .use('http://foo.com/file.jpg')
      .pipe(fs.createWriteStream('./file.jpg'))
      .get(function(err) {
        if(err) console.info('the stream error', err);
        else console.info('the stream finished without error');
        
        // if you need the output stream
        console.info(this.req.destinationStream);
      })

## API

See [mdoq](https://github.com/ritch/mdoq) for **API** documentation.