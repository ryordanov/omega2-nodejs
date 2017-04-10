var http = require('http');
var fs = require('fs');
var url = require('url');

var PORT = 8888;

var routes = { 
    get: function (route, fn) {
        this['GET:' + route] = fn;
    },
    post: function (route, fn) {
        this['POST:' + route] = fn;
    }
};

routes.get('/', function (req, res) {
    var index = fs.readFileSync('index.html');
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(index);
});

routes.get('/favicon.ico', function (req, res) {
    var file = fs.readFileSync('favicon.ico');
    res.writeHead(200, { 'Content-Type': 'image/x-icon' });
    res.end(file);
});

routes.get('/omega_pinout.png', function (req, res) {
    var file = fs.readFileSync('omega_pinout.png');
    res.writeHead(200, { 'Content-Type': 'image/png' });
    res.end(file);
});

routes.post('/doMagic', function (req, res) {
    var jsonString = '';

    req.on('data', function (data) {
        jsonString += data;
    });

    req.on('end', function () {
        letThereBeLight(JSON.parse(jsonString));
    });

    res.writeHeader(200, {'Content-type': 'applicaton/json'});
    res.write('{"status": "bravo"}');
    res.end();
});

// routes.get('/about', function (req, res) {
//     res.writeHeader(200, {'Content-type': 'text/html'});
//     res.write('<h1>About</h1>');
//     res.end();
// });


function onRequest(req, res) {
    var purl = url.parse(req.url);
    var pathname = purl.pathname;
    console.log('url pathname', pathname);
    
    var key = req.method + ':' + pathname;
    console.dir( key);
    
    if (typeof routes[key] === 'function') {
        routes[key](req, res);
    } else {
        res.writeHeader(404);
        res.end();
    }
}

var server = http.createServer(onRequest);
server.listen(PORT);
console.log('Server listening on port ', PORT);

function letThereBeLight(OnOffObject) {
    var GPIOHelper = require('./gpiohelper');
    var allOff = OnOffObject.allOff;
    var allOn = OnOffObject.allOn;
    console.log('Off pins: ', allOff, 'On pins: ', allOn);

    var helper = new GPIOHelper();

    allOff.forEach(function(pin) {
        helper.setPinSync(pin, false);
    });

    allOn.forEach(function(pin) {
        helper.setPinSync(pin, true);
    });        
}


// https://groups.google.com/forum/#!topic/nodejs/AwiBZcRzHEY
// https://github.com/ajlopez/NodeSamples/blob/master/WebServer/server4.js
