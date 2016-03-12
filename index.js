'use strict'

const doctrine = require('doctrine')
const fs = require('fs')
const jsYaml = require('js-yaml')
const path = require('path')

/**
 * Parses the Swagger documentation and serves the resulting JSON object at the specified route.
 * @param {Object} app - Express application
 * @param {Object} config - Configuration
 *  {
 *    {String} version - Swagger version
 *    {Object} info - Swagger info
 *    {String[]} files - Files to parse
 *    {String} route - Route to serve the Swagger object on
 *  }
 * @param {Function} callback - (err, swaggerObject)
 * @returns {Promise} Resolves with the Swagger object
 */
module.exports.doc = function (app, config, callback) {
  callback = callback || function () {}

  return new Promise(function (resolve, reject) {
    // Validate the config parameter.
    if (!config || !config.version || !config.info || !config.files || !config.route) {
      return reject(new Error('Invalid config parameter.'))
    }

    // Validate the Swagger version.
    if (config.version !== '2.0') {
      return reject(new Error('Unsupported Swagger version.'))
    }

    // Resolve with the initial Swagger object.
    return resolve({
      swagger: config.version,
      info: config.info,
      paths: {}
    })
  })
  .then(function (swaggerObject) {
    // Parse the API files and add the data to the Swagger object.

    // for (let i = 0; i < config.files.length; i++) {
    //   let jsDocComments = parseApiFile(config.files[i])
    //   let swaggerJsDocComments = filterJsDocComments(jsDocComments)
    //   addDataToSwaggerObject(swaggerObject, swaggerJsDocComments)
    // }

    // Parse the files for Swagger JSDoc comments.
    let promises = []

    for (let i = 0; i < config.files.length; i++) {
      promises.push(parseSwaggerJsdocComments(config.files[i]))
    }

    return Promise.all(promises)
      .then(function (swaggerJsdocComments) {
        // Merge the comments.

      })
      .then(function (comments) {
        // Add the results to the Swagger object.

        return swaggerObject
      })
  })
  .then(function (swaggerObject) {
    // Validate the Swagger object.
    if (module.exports.validate(swaggerObject) === false) {
      throw new Error('Invalid Swagger object:\n' + JSON.stringify(swaggerObject))
    }

    return swaggerObject
  })
  .then(function (swaggerObject) {
    // Add Express route to serve the Swagger object.
    app.get(config.path, function (req, res) {
      res.json(swaggerObject)
    })

    return swaggerObject
  })
  .catch(function (err) {
    callback(err, null)
    return Promise.reject(err)
  })
}

/**
 * Validates the Swagger object.
 * @param {Object} swaggerObject - Swagger object
 * @returns {Boolean}
 */
module.exports.validate = function (swaggerObject) {

}

// -- Parsing ----------------------------------------------------------------------------------------------------------

function parseSwaggerJsdocComments (file) {
  return new Promise(function (resolve, reject) {
    // Read the file contents.
    fs.readFile(file, { encoding: 'utf-8'}, function (err, data) {
      return err ? reject(err) : resolve(data)
    })
  })
  .then(function (fileContent) {
    // Parse the JSDoc comments.
    const jsdocRegex = /\/\*\*([\s\S]*?)\*\//gm
    let jsdocRegexResults = fileContent.match(jsdocRegex)
    let jsdocComments = []

    if (jsdocRegexResults) {
      for (let i = 0; i < jsdocRegexResults.length; i++) {
        let jsdocComment = doctrine.parse(regexResults[i], { unwrap: true })
        jsdocComments.push(jsdocComment)
      }
    }

    return jsdocComments
  })
  .then(function (jsdocComments) {
    // Filter for comments tagged with '@swagger'.
    let swaggerJsdocComments = []

    for (let i = 0; i < jsdocComments.length; i++) {
      let jsdocComment = jsdocComments[i]
      for (let j = 0; j < jsDocComment.tags.length; j++) {
        let tag = jsDocComment.tags[j]
        if (tag.title === 'swagger') {
          swaggerJsdocComments.push(jsYaml.safeLoad(tag.description))
        }
      }
    }

    return swaggerJsdocComments
  })
}

/**
 * Adds the data in the Swagger JSDoc comments to the swagger object.
 * @param {Object} Swagger object
 * @param {Array} JSDoc comments tagged with '@swagger'
 */
function addDataToSwaggerObject (swaggerObject, swaggerJsDocComments) {
  for (let i = 0; i < swaggerJsDocComments.length; i++) {
    let pathObject = swaggerJsDocComments[i]
    let propertyNames = Object.getOwnPropertyNames(pathObject)

    for (let j = 0; j < propertyNames.length; j++) {
      let propertyName = propertyNames[j]
      if (swaggerObject.paths.hasOwnProperty(propertyName)) {
        for (let k in Object.keys(pathObject[propertyName])) {
          let childPropertyName = Object.keys(pathObject[propertyName])[k]
          swaggerObject.paths[propertyName][childPropertyName] = pathObject[propertyName][childPropertyName]
        }
      } else {
        swaggerObject.paths[propertyName] = pathObject[propertyName]
      }
    }
  }
}
