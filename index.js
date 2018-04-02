'use strict';

const _ = require('lodash');
const config = require('./config');
const ValueMapper = require('./src/value-map/ValueMapper');
const Mapper = require('./src/structure-map/Mapper');
const mapper = new Mapper(config);

const removeUndefinedValues = function(object) {
  return JSON.parse(JSON.stringify(object));
};

const format = function(mappedObject, removeUndefinedFlag) {
  if(removeUndefinedFlag) {
    mappedObject = removeUndefinedValues(mappedObject);
  }

  return mappedObject;
};

const structureMap = function(data, schema, removeUndefinedFlag) {
  const mappedObject = mapper.map(data, schema, '');
  return format(mappedObject, removeUndefinedFlag);
};

const valueMap = function(objectToMap, schema, removeUndefinedFlag) {
  const valueMapper = new ValueMapper(config, schema);

  const mappedObject = {};

  _.forOwn(objectToMap, (valueToMap, key) => {
    if(_.isArray(valueToMap)) {
      const mappedArray = _.map(valueToMap, (arrayItem) => {
        const schemaForArrayItem = _.head(_.get(schema, key));
        return valueMap(arrayItem, schemaForArrayItem);
      });

      _.set(mappedObject, key, mappedArray);
    }

    else if(_.isDate(valueToMap)) {
      valueToMap = JSON.stringify(valueToMap);
      const mappedData = valueMapper.mapValue(valueToMap, key);
      _.merge(mappedObject, mappedData);
    }

    else if(_.isObject(valueToMap)) {
      const subSchemaForObject = _.get(schema, key);
      const mappedSubObject = valueMap(valueToMap, subSchemaForObject);
      _.set(mappedObject, key, mappedSubObject);
    }

    else {
      const mappedData = valueMapper.mapValue(valueToMap, key);
      _.merge(mappedObject, mappedData);
    }
  });

  return format(mappedObject, removeUndefinedFlag);
};

module.exports = { structureMap, valueMap };
