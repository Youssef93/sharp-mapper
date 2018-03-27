"use strict";

const _ = require('lodash');
const config = require('./config');
const schemaMapper = require('./src/structure-map/SchemaMapper');
const arrayMapper = require('./src/structure-map/ArrayMapper');
const valueMapper = require('./src/value-map/ValueMapper');
const SchemaMapper = new schemaMapper(config);
const ArrayMapper = new arrayMapper(config);

const { mappingTypes } = config;

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

const _structureMap = function(data, schema, currentPath) {
  currentPath = _.toString(currentPath);
  let mappedObject = {};

  _.forOwn(schema, (schemaValue, schemaKey) => {
    const desiredOutput = schemaValue;

    if(_.isArray(desiredOutput)) {
      const arrayPathsToGet = getArrayPaths(data, schema, schemaKey, currentPath);
      mappedObject[schemaKey] = _.map(arrayPathsToGet, (path) => {
        let mappedArray = _structureMap(data, schema[schemaKey][0], path);
        mappedArray = _.pickBy(mappedArray, (item) => ! _.isNil(item));
        return mappedArray;
      });
    }

    else if(_.isObject(desiredOutput)) {
      mappedObject[schemaKey] = _structureMap(data, schema[schemaKey], currentPath);
    }

    else {
      mappedObject[schemaKey] = SchemaMapper.mapBasedOnSchema(data, desiredOutput, currentPath);
    }
  });

  _.unset(mappedObject, config.arrayIdentifier)
  return mappedObject;
};

const structureMap = function(data, schema) {
  return _structureMap(data, schema, "");
};

const valueMap = function(data, schema) {
  const ValueMapper = new valueMapper(config, schema);

  let mappedObject = {};
  _.forOwn(data, (dataValue, dataKey) => {
    if(_.isArray(dataValue)) {
      const mappedArray = _.map(dataValue, (item) => {
        const subSchema = _.get(schema, dataKey);
        return valueMap(item, _.head(subSchema));
      });

      mappedObject[dataKey] = _.cloneDeep(mappedArray);
    } else if(_.isObject(dataValue)) {
      const subSchema = _.get(schema, dataKey);
      mappedObject[dataKey] = valueMap(dataValue, subSchema);
    } else {
      mappedObject = _.merge(mappedObject, ValueMapper.mapValue(dataValue, dataKey));
    }
  });

  return mappedObject;
}

module.exports = { structureMap, valueMap };
