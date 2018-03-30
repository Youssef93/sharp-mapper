'use strict';

const _ = require('lodash');

class ValueMapper {
  constructor(config, schema) {
    this.config = config;
    this.schema = schema;
  }

  mapValue(valueToMap, keyInMainObject) {
    if(_.isObject(valueToMap)) {
      throw new Error('Cannot have an object in the value mapping schema');
    }

    if(this._isFoundInSchema(keyInMainObject)) {
      return this._map(valueToMap, keyInMainObject);
    } 
    
    else {
      return this._returnSameValue(valueToMap, keyInMainObject);
    }
  }

  _returnSameValue(value, key) {
    const mappedObject = {};
    mappedObject[key] = value;
    return mappedObject;
  }

  _map(valueToMap, keyInMainObject) {
    const mappedObject = {};

    let schemaForThisKey = _.cloneDeep(_.get(this.schema, keyInMainObject));
    schemaForThisKey = this._replacePointerKeyword(schemaForThisKey, keyInMainObject);

    _.forOwn(schemaForThisKey, (enumCases, schemaKey) => {
      let mappedItem;

      if(_.has(enumCases, valueToMap)) {
        mappedItem = _.get(enumCases, valueToMap);
      } 
      
      else {
        mappedItem = this._loadDefault(enumCases);
      }

      _.set(mappedObject, schemaKey, mappedItem);
    });

    return mappedObject;
  }

  _isFoundInSchema(keyInMainObject) {
    return _.has(this.schema, keyInMainObject);
  }

  _loadDefault(schemaValue) {
    return _.get(schemaValue, this.config.valueMapping.defaultKeyword);
  }

  _replacePointerKeyword(schema, keyInMainObject) {
    if(_.has(schema, this.config.valueMapping.pointer)) {
      schema[keyInMainObject] = _.get(schema, this.config.valueMapping.pointer);
      _.unset(schema, this.config.valueMapping.pointer);
    }
    
    return schema;
  }
};

module.exports = ValueMapper;
