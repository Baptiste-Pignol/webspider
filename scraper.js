'use strict';
 
/**
 * Web Scraper
 */
// Instead of the default console.log, you could use your own augmented console.log !
// var console = require('./console');
 
// Url regexp from http://daringfireball.net/2010/07/improved_regex_for_matching_urls
var EXTRACT_URL_REG = /\b((?:https?:\/\/|www\d{0,3}[.]|[a-z0-9.\-]+[.][a-z]{2,4}\/)(?:[^\s()<>]+|\(([^\s()<>]+|(\([^\s()<>]+\)))*\))+(?:\(([^\s()<>]+|(\([^\s()<>]+\)))*\)|[^\s`!()\[\]{};:'".,<>?«»“”‘’]))/gi;
var PORT            = 3000;
 
var request         = require('request');
 
// See: http://expressjs.com/guide.html
var express         = require('express');
var app             = express();
app.set('views', __dirname+"/html2");
app.engine('html', require('ejs').renderFile);
app.use('/dist', express.static(__dirname + '/html2/dist'));
app.use('/js', express.static(__dirname + '/html2/js'));

 
// You should (okay: could) use your OWN implementation here!
// My own implementation of EventEmitter
var EventEmitter    = require('./eventEmitter.js').EventEmitter;
 
// We create a global EventEmitter (Mediator pattern: http://en.wikipedia.org/wiki/Mediator_pattern )
var em              = new EventEmitter();

var _ = require('lodash');
 
/**
 * Remainder:
 * queue.push("http://..."); // add an element at the end of the queue
 * queue.shift(); // remove and get the first element of the queue (return `undefined` if the queue is empty)
 *
 * // It may be a good idea to encapsulate queue inside its own class/module and require it with:
 * var queue = require('./queue');
 */
var queue        = []; // All links found whith the scraper
var linkScrapped = []; // All page already scraped
var contentHtml = [];  // All page html content already scraped
var linkError = [];    // All page with scrap error


// Other variables
var notJs = false; // don't scrap javascript pages
var nbAdr = -1;    // number of page to scrap (infity if negative)
var domain = {};
var nbTextPages = 0;
var nbImagePages = 0;
var nbAudioPages = 0;
var nbVideoPages = 0;
 
/**
 * Get the page from `page_url`
 * @param  {String} page_url String page url to get
 *
 * `get_page` will emit
 */
function get_page(page_url){
  em.emit('page:scraping', page_url);
 
  // See: https://github.com/mikeal/request
  request({
    url:page_url,
  }, function(error, http_client_response, html_str){

    if (http_client_response) {
      if (domain[http_client_response.request.host]) {
        domain[http_client_response.request.host] += 1;
      }
      else {
        domain[http_client_response.request.host] = 1;
      }
    }

    if (http_client_response && (http_client_response.headers['content-type'].indexOf('text') != -1)) {
      nbTextPages ++;
    }
    if (http_client_response && (http_client_response.headers['content-type'].indexOf('image') != -1)) {
      nbImagePages ++;
    }
    if (http_client_response && (http_client_response.headers['content-type'].indexOf('audio') != -1)) {
      nbAudioPages ++;
    }
    if (http_client_response && (http_client_response.headers['content-type'].indexOf('video') != -1)) {
      nbVideoPages ++;
    }
    /**
     * The callback argument gets 3 arguments.
     * The first is an error when applicable (usually from the http.Client option not the http.ClientRequest object).
     * The second is an http.ClientResponse object.
     * The third is the response body String or Buffer.
     */
    /**
     * You may improve what get_page is returning by:
     * - emitting HTTP headers information like:
     *  -> page size
     *  -> language/server behind the web page (php ? apache ? nginx ? using X-Powered-By)
     *  -> was compression active ? (Content-Encoding: gzip ?)
     *  -> the Content-Type
     */

    if(error || (http_client_response && (notJs && (http_client_response.headers['content-type'].indexOf('text/javascript') != -1)))){
      em.emit('page:error', page_url, error);
      return;
    }
    em.emit('page', page_url, html_str);
  });
}
 
/**
 * Extract links from the web pagr
 * @param  {String} html_str String that represents the HTML page
 *
 * `extract_links` should emit an `link(` event each
 */
function extract_links(page_url, html_str){
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/match
  // "match" can return "null" instead of an array of url
  // So here I do "(match() || []) in order to always work on an array (and yes, that's another pattern).
  (html_str.match(EXTRACT_URL_REG) || []).forEach(function(url){
    // see: http://nodejs.org/api/all.html#all_emitter_emit_event_arg1_arg2
    // Here you could improve the code in order to:
    // - check if we already crawled this url
    // - ...
    em.emit('url', page_url, html_str, url);
  });
  em.emit('beforeScraping', page_url, html_str);
 
}

function scrapNextPage(page_url, html_str) {
  if ((nbAdr < 0) || (linkScrapped.length < nbAdr)) {
    var linkFound = false;

    if (html_str) {
      contentHtml.push(html_str);
      linkScrapped.push(page_url);
    }
    else {
      linkError.push(page_url);
    }
    
    queue = _.uniq(queue);
    queue.forEach(function (val) {
      if ((!linkFound) && (linkScrapped.indexOf(val) === -1) && (linkError.indexOf(val) === -1)) {
        get_page(val);
        linkFound = true;
      }
    });
  }
}
 
function handle_new_url(from_page_url, from_page_str, url){
  // Add the url to the queue
  queue.push(url);
 
  // ... and may be do other things like saving it to a database
  // in order to then provide a Web UI to request the data (or monitoring the scraper maybe ?)
  // You'll want to use `express` to do so
}

function searchLink(mySearch,typeSearch) {
  var listFound = [];

  if (typeSearch === "word in url") {
    linkScrapped.forEach(function(val, idx){
      if (val.indexOf(mySearch) !== -1) {
        listFound.push(val);
      }
    })
  }
  else {
    contentHtml.forEach(function(val, idx){
      if (val.indexOf(mySearch) !== -1) {
        listFound.push(linkScrapped[idx]);
      }
    })
  }
  

  return listFound;
}
 
 
em.on('page:scraping', function(page_url){
  console.log('Loading... ', page_url);
});
 
// Listen to events, see: http://nodejs.org/api/all.html#all_emitter_on_event_listener
em.on('page', function(page_url, html_str){
  console.log('We got a new page!', page_url);
  console.log(queue.length);
});
 
em.on('page:error', function(page_url, error){
  console.error('Oops an error occured on', page_url, ' : ', error);
  em.emit('beforeScraping', page_url);
});
 
em.on('page', extract_links);
 
em.on('url', function(page_url, html_str, url){
  console.log('We got a link! ', url);
});
 
em.on('url', handle_new_url);

em.on('beforeScraping', scrapNextPage);
 
 
// A simple (non-REST) API
// You may (should) want to improve it in order to provide a real-GUI for:
// - adding/removing urls to scrape
// - monitoring the crawler state
// - providing statistics like
//    - a word-cloud of the 100 most used word on the web
//    - the top 100 domain name your crawler has see
//    - the average number of link by page on the web
//    - the most used top-level-domain (TLD: http://en.wikipedia.org/wiki/Top-level_domain )
//    - ...
 
// You should extract all the following "api" related code into its own NodeJS module and require it with
// var api = require('./api');
// api.listen(PORT);

app.use(express.bodyParser());
 
app.get('/', function(req, res){
  // See: http://expressjs.com/api.html#res.json
  res.json(200, {
    title:'YOHMC - Your Own Home Made Crawler',
    endpoints:[{
      url:'http://127.0.0.1:'+PORT+'/queue/size',
      details:'the current crawler queue size'
    }, {
      url:'http://127.0.0.1:'+PORT+'/queue/add?url=http%3A//voila.fr',
      details:'immediately start a `get_page` on voila.fr.'
    }, {
      url:'http://127.0.0.1:'+PORT+'/queue/list',
      details:'the current crawler queue list.'
    }]
  });
});
 
app.get('/queue/size', function(req, res){
  res.setHeader('Content-Type', 'text/plain');
  res.json(200, {queue:{length:queue.length}});
});
 
app.get('/queue/add', function(req, res){
  var url = req.param('url');
  get_page(url);
  res.json(200, {
    queue:{
      added:url,
      length:queue.length,
    }
  });
});
 
app.get('/queue/list', function(req, res){
  res.json(200, {
    queue:{
      length:queue.length,
      urls:queue
    }
  });
});

app.get('/queueScrapped/list', function(req, res){
  res.json(200, {
    linkScrapped:{
      length:linkScrapped.length,
      urls:linkScrapped
    }
  });
});

app.get('/home', function(req, res){
  res.render('home.html');
});

app.get('/index', function(req, res){
  res.render('index.html');
});

app.get('/search', function(req, res){
  res.render('search.html');
});

app.get('/statistic', function(req, res){
  res.render('statistic.html');
});

app.get('/list', function(req, res){
  res.render('list.html');
});

app.post('/index', function(req, res){
  var adr = req.body.adr;
  nbAdr = req.body.nbAdr;
  if (isNaN(nbAdr)) {
    nbAdr = -1;
  }
  notJs = req.body.notJs;
  get_page(adr);
  res.render('index.html');
});

app.post('/queue/listScrap', function(req, res){
  res.json(200, {
    listScrap:{
      length:linkScrapped.length,
      urls:linkScrapped
    },
    listNotScrap:{
      length:queue.length,
      urls:queue
    },
    listError: {
      length:linkError.length,
      urls:linkError
    }
  });
});

app.post('/search/result', function(req, res){
  var mySearch = req.body.mySearch;
  var typeSearch = req.body.typeSearch;
  res.json(200, {
    listLinkFound:searchLink(mySearch,typeSearch)
  })
});

app.post('/statistic/result', function(req, res){
  res.json(200, {
    result:domain
  })
});

app.post('/statistic/pourcentage', function(req, res){
  res.json(200, {
    text: nbTextPages,
    image: nbImagePages,
    audio: nbAudioPages,
    video: nbVideoPages
  })
});

app.listen(PORT);
console.log('Web UI Listening on port '+PORT);
 
// #debug Start the crawler with a link
//get_page('http://twitter.com/FGRibreau');