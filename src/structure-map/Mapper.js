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
        const mappedArray = this.mapArray({ data, schema, schemaKey, currentPath }, this);
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
}

module.exports = Mapper;