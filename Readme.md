# mdoq-http

**HTTP** [request](https://github.com/mikeal/request) (**Node.js**) and [jQuery](http://api.jquery.com/jQuery.ajax/) (**browser**) middleware for [mdoq](https://github.com/ritch/mdoq).

## Installation

    npm install mdoq-http

## mdoq

[Mdoq](https://github.com/ritch/mdoq) provides a consistent **HTTP** style API that lets you re-use middleware across different sources of data in **Node.js** and the **browser**.

## JSON

Currently **mdoq-http** assumes the source of data is **JSON**. This will likely change in future versions.

## Examples

**Node.js**

    var mdoq = require('mdoq')
      , twitter = mdoq(require('mdoq-http')).use('https://api.twitter.com')
      , statuses = twitter.use('/1/statuses/public_timeline.json')
    ;

    statuses.get({count: 3, include_entities: true}, function(err, res) {
      console.info(res);
    });
    
**Browser**

    <script src="jquery.js"></script>
    <script src="mdoq.js"></script>
    <script>
      var twitter = mdoq.use('https://twitter.com/')
        , statuses = twitter.use('/1/statuses/public_timeline.json')
      ;

      statuses.get({count: 3, include_entities: true}, function(err, res) {
        console.log(res);
      });
    </script>

## Middleware

Combine with other [mdoq](https://github.com/ritch/mdoq) middleware to pipe data between multiple sources.

    statuses
      .use(function(next, use) {
        // tell mongodb middleware to store tweets
        if(this.res) {
          this.req.action = 'post';
          use(require('mdoq-mongodb'));
        }
    
        next();
      })
      .get({count: 20}, function(err, res) {
        console.info('These were returned from twitter and stored in mongodb', res);
      })
    ;

## API

See [mdoq](https://github.com/ritch/mdoq) for **API** documentation.