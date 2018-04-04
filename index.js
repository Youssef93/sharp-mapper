'use strict';

const _ = require('lodash');
const config = require('./config');
const ValueMapper = require('./src/ValueMapper');
const StructureMapper = require('./src/StructureMapper');

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
  const structureMapper = new StructureMapper(config);
  const mappedObject = structureMapper.map(data, schema, '');
  return format(mappedObject, removeUndefinedFlag);
};

const valueMap = function(objectToMap, schema, removeUndefinedFlag) {
  const valueMapper = new ValueMapper(config, schema);
  const mappedObject = valueMapper.map(objectToMap, schema);
  return format(mappedObject, removeUndefinedFlag);
};

module.exports = { structureMap, valueMap };
