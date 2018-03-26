'use strict';

const _ = require('lodash');

class ValueMapper {
  constructor(config, schema) {
    this.config = config;
    this.schema = schema;
  }

  mapValue(value, key) {
    if(_.isObject(value)) {
      throw new Error('Cannot have an object in the value mapping schema');
    }

    if(this._isFoundInSchema(key)) {
      return this._map(value, key);
    } else {
      const mappedObject = {};
      mappedObject[key] = value;
      return mappedObject;
    }
  }

  _map(value, key) {
    const mappedObject = {};
    let mappingSchema = _.cloneDeep(this.schema[key]);
    mappingSchema[key] = mappingSchema[this.config.valueMapping.pointer];
    _.unset(mappingSchema, this.config.valueMapping.pointer);

    mappingSchema = _.pickBy(mappingSchema, (schemaValue) => {
      return ! _.isNil(schemaValue);
    });

    _.forOwn(mappingSchema, (schemaValue, schemaKey) => {
      let mappedItem;
      if(_.has(schemaValue, value)) {
        mappedItem = schemaValue[value];
      } else {
        mappedItem = schemaValue[this.config.valueMapping.defaultKeyword];
      }

      mappedObject[schemaKey] = mappedItem;
    });

    return mappedObject;
  }

  _isFoundInSchema(key) {
    return _.has(this.schema, key);
  }
};

module.exports = ValueMapper;
