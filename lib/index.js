'use strict';

var doctrine = require('doctrine'),
    fs = require('fs'),
    jsYaml = require('js-yaml'),
    path = require('path');

// This is the Swagger object that conforms to the Swagger 2.0 specification.
module.exports.swaggerObject = {
    swagger: '2.0',
    paths: {}
};

/**
 *  Initializes the module. This is intended to be called only once.
 *  @param {object} app - Express application
 *  @param {object} info - Swagger info property
 *  @param {object} config - Module configurations
 */
module.exports.init = function (app, info, config) {
    if (!info) {
        throw new Error('\'info\' is required.');
    }
    else if (!config) {
        throw new Error('\'config\' is required.');
    }
    else if (!config.apiPath) {
        throw new Error('\'config.apiPath\' is required.');
    }
    else if (!config.apiFiles) {
        throw new Error('\'config.apisFiles\' is required.');
    }

    module.exports.swaggerObject.info = config.info;

    // Parse the documentation in the API files.
    for (var i = 0; i < config.apiFiles.length; i++) {
        parseApiFile(config.apis[i]);
    }

    // Add Express route to serve the Swagger JSON object.
    app.get(config.apiPath, function (req, res) {
        res.json(module.exports.swaggerObject);
    });
};

// ---------------------------------------------------------------------------------------------------------------------

/**
 *  Parses the provided API file and attaches the fields to the Swagger object.
 *  @param {string} file - File to be parsed
 */
function parseApiFile(file) {
    var fileExtension = path.extname(file);

    if (fileExtension === '.js') {
        parseJsFile(file);
    }
    else {
        throw new Error('Unsupported extension \'' + fileExtension + '\'.');
    }
}

/**
 *  Parse the JSDoc comments from a JavaScript file.
 *  @param {string} file - File to parse
 */
function parseJsFile(file) {
    var sourceCode = fs.readFileSync(file, { encoding: 'utf8' });
    var jsDocComments = parseJsDoc(sourceCode);
    var swaggerJsDocComments = filterSwaggerTags(jsDocComments);

    // Attach the findings to the Swagger object.
    for (var i = 0; i < swaggerJsDocComments.length; i++) {
        var pathObject = swaggerJsDocComments[i];
        var propertyNames = Object.getOwnPropertyNames(pathObject);

        for (var j = 0; j < propertyNames.length; j++) {
            var propertyName = propertyNames[j];
            module.exports.swaggerObject.paths[propertyName] = pathObject[propertyName];
        }
    }
}

/**
 *  Parses the jsDoc comments from JavaScript source code.
 *  @param {string} sourceCode - Source code to parse
 *  @returns {array}
 */
function parseJsDoc(jsSourceCode) {
    var jsDocRegex = /\/\*\*([\s\S]*?)\*\//gm;
    var fragments = jsSourceCode.match(jsDocRegex);
    var jsDocs = [];

    if (fragments) {
        for (var i = 0; i < fragments.length; i++) {
            var fragment = fragments[i];
            var jsDoc = doctrine.parse(fragment, { unwrap: true });
            jsDocs.push(jsDoc);
        }
    }

    return jsDocs;
}

/**
 *  Filter out jsDoc comments that do not have '@swagger' tag and parses the YAML description of those that do.
 *  @param {array} jsDocs - jsDoc comments
 *  @returns {array}
 */
function filterSwaggerTags(jsDocs) {
    var swaggerJsDocs = [];

    for (var i = 0; i < jsDocs.length; i++) {
        var jsDoc = jsDocs[i];
        for (var j = 0; j < jsDoc.tags.length; j++) {
            var tag = jsDoc.tags[j];
            if (tag.title === 'swagger') {
                swaggerJsDocs.push(jsYaml.safeLoad(tag.description));
            }
        }
    }

    return swaggerJsDocs;
}
