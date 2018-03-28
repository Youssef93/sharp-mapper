'use strict';

/*
  write test cases for the following:
   -- mapping array not found
   -- mapping array which found to be either object or primitive value
   -- mapping of array.object.array, example: vehicles.otherDetails.claims
   -- mapping of object.array, example: otherDetails.vehicles
  solve "null" item found in array mapping
*/

const _ = require('lodash');
const config = require('./config');
const schemaMapper = require('./src/structure-map/SchemaMapper');
const arrayMapper = require('./src/structure-map/ArrayMapper');
const valueMapper = require('./src/value-map/ValueMapper');
const SchemaMapper = new schemaMapper(config);
const ArrayMapper = new arrayMapper(config);

const getArrayPaths = function(data, schema, key, currentPath) {
  const { arrayIdentifier } = config;
  const identifierValue = schema[key][0][arrayIdentifier];

  if(_.isNil(identifierValue)) {
    throw new Error ('missing array identifier');
  }

  const { mapper } = _.find(config.arrayMappingTypes, (mType) => {
    return identifierValue.match(mType.regex);
  });

  return ArrayMapper[mapper](data, currentPath, identifierValue);
};

const getSubSchemaForArray = function(schema, schemaKey) {
  const arrayMapping = _.get(schema, schemaKey);
  const itemInsideArrayMapping = _.cloneDeep(_.head(arrayMapping));
  _.unset(itemInsideArrayMapping, config.arrayIdentifier);
  return itemInsideArrayMapping;
}

const _structureMap = function(data, schema, currentPath) {
  currentPath = _.toString(currentPath);
  const mappedObject = {};

  _.forOwn(schema, (schemaValue, schemaKey) => {
    const desiredOutput = _.cloneDeep(schemaValue);

    if(_.isArray(desiredOutput)) {
      const actualArrayPaths = getArrayPaths(data, schema, schemaKey, currentPath);
      const mappedArray = _.map(actualArrayPaths, (path) => {
        const subSchemaForArrayItem = getSubSchemaForArray(schema, schemaKey);
        return _structureMap(data, subSchemaForArrayItem, path);
      });

      _.set(mappedObject, schemaKey, mappedArray);
    }

    else if(_.isObject(desiredOutput)) {
      const subSchemaForObject = _.get(schema, schemaKey);
      const subMappedObject = _structureMap(data, subSchemaForObject, currentPath);
      _.set(mappedObject, schemaKey, subMappedObject);
    }

    else {
      const mappedItem = SchemaMapper.mapBasedOnSchema(data, desiredOutput, currentPath);
      _.set(mappedObject, schemaKey, mappedItem);
    }
  });

  return mappedObject;
};

const structureMap = function(data, schema) {
  return _structureMap(data, schema, '');
};

const valueMap = function(objectToMap, schema) {
  const ValueMapper = new valueMapper(config, schema);

  const mappedObject = {};

  _.forOwn(objectToMap, (valueToMap, key) => {
    if(_.isArray(valueToMap)) {
      const mappedArray = _.map(valueToMap, (arrayItem) => {
        const schemaForArrayItem = _.head(_.get(schema, key));
        return valueMap(arrayItem, schemaForArrayItem);
      });

      _.set(mappedObject, key, mappedArray);
    }

    else if(_.isObject(valueToMap)) {
      const subSchemaForObject = _.get(schema, key);
      const mappedSubObject = valueMap(valueToMap, subSchemaForObject);
      _.set(mappedObject, key, mappedSubObject);
    }

    else {
      const mappedData = ValueMapper.mapValue(valueToMap, key);
      _.merge(mappedObject, mappedData);
    }
  });

  return mappedObject;
};

module.exports = { structureMap, valueMap };
