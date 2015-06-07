'use strict';

var express = require('express'),
    routes = require('./routes'),
    swagger = require('..');

var app = express();

swagger.init(app, {
        apiPath: '/api',
        apis: ['./routes.js']
    },
    {
        title: 'Hello World',
        version: '1.0.0'
    }
});

routes.setup(app);

var server = app.listen(3000, function () {
    var host = server.address().address;
    var port = server.address().port;

    console.log('Example app listening at http://%s:%s', host, port);
});
