'use strict';

const ArrayMapper = require('./ArrayMapper');
const _ = require('lodash');

class Mapper extends ArrayMapper {
  constructor(config) {
    super(config);
  }

  map(data, schema, currentPath) {
    currentPath = _.toString(currentPath);
    const mappedObject = {};

    _.forOwn(schema, (schemaValue, schemaKey) => {
      const desiredOutput = _.cloneDeep(schemaValue);

      if (_.isArray(desiredOutput)) {
        const actualArrayPaths = this._getArrayPaths(data, schema, schemaKey, currentPath);
        const mappedArray = _.map(actualArrayPaths, (path) => {
          const subSchemaForArrayItem = this._getSubSchemaForArray(schema, schemaKey);
          return this.map(data, subSchemaForArrayItem, path);
        });

        _.set(mappedObject, schemaKey, mappedArray);
      } 
      
      else if (_.isObject(desiredOutput)) {
        const subSchemaForObject = _.get(schema, schemaKey);
        const subMappedObject = this.map(data, subSchemaForObject, currentPath);
        _.set(mappedObject, schemaKey, subMappedObject);
      }
      
      else {
        const mappedItem = this.mapBasedOnSchema(data, desiredOutput, currentPath);
        _.set(mappedObject, schemaKey, mappedItem);
      }
    });

    return mappedObject;
  }

  _getArrayPaths (data, schema, key, currentPath) {
    const { arrayIdentifier } = this.config;
    const identifierValue = _.get(schema[key][0], arrayIdentifier);
  
    if(_.isNil(identifierValue)) {
      throw new Error (`missing array identifier is ${schema[key]}`);
    }
  
    const { mapper } = _.find(this.config.arrayMappingTypes, (mType) => {
      return identifierValue.match(mType.regex);
    });
  
    return this[mapper](data, currentPath, identifierValue);
  };

  _getSubSchemaForArray (schema, schemaKey) {
    const arrayMapping = _.get(schema, schemaKey);
    const itemInsideArrayMapping = _.cloneDeep(_.head(arrayMapping));
    _.unset(itemInsideArrayMapping, this.config.arrayIdentifier);
    return itemInsideArrayMapping;
  }
}

module.exports = Mapper;