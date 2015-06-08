# {jsdoc-express-with-swagger}
**{jsdoc-express-with-swagger}** is a simple and clean solution to integrate [Swagger](http://swagger.io) with Express
using JSDoc.

## Supported Swagger Versions
* 2.0

## Install
    $ npm install jsdoc-express-with-swagger

## Quick Start
Initialize the module with `init(app, config)` where `app` is your Express app and `config` is the configuration object.

**{jsdoc-express-with-swagger}** parses the specified JavaScript files looking for JSDoc comments with the `@swagger` tag.
The body of the comment is a YAML object that gets added to the Swagger object under the `paths` property.

Add properties to the Swagger object by modifying the exported value `swaggerObject`.

    // app.js
    'use strict';

    var express = require('express'),
        swagger = require('jsdoc-express-with-swagger');

    var app = express();

    swagger.init(app, {
        info: {                    // This is the same info property in the Swagger 2.0 spec.
            title: 'Hello World',
            version: '1.0.0'
        },
        apiPath: '/api',          // Path that will serve the Swagger JSON object.
        apiFiles: ['./app.js']    // List of files to parse for Swagger documentation.
    });

    /**
     *  @swagger
     *  /:
     *    get:
     *      responses:
     *        200:
     *          description: hello world
     */
    app.get('/', function (req, res) {
        res.send('Hello World!');
    });

// Add properties to the Swagger object.
swagger.swaggerObject.schemes = [ 'http' ];

app.listen(3000);

The code above will serve the following Swagger JSON object at `localhost:3000/api`.

    {
      "info": {
        "title": "Hello World",
        "version": "1.0.0"
      },
      "paths": {
        "/": {
          "get": {
            "response": {
              "200": {
                "description": "hello world"
              }
            }
          }
        }
      },
      "schemes": [
        "http"
      ]
    }

## Example App
Clone the **{jsdoc-express-with-swagger}** repo and install the dev dependencies:

    $ git clone git://github.com/devlouisc/jsdoc-express-with-swagger.git
    $ cd jsdoc-express-with-swagger
    $ npm install

Run the example app:

    $ cd example
    $ node app.js

## References
* [Swagger 2.0 Specification](http://swagger.io/specification)
* [Swagger Live Demo](http://petstore.swagger.io)
* swagger-example.json is the JSON object that the Swagger live demo fetches.
