'use strict';

const _ = require('lodash');

class ValueMapper {
  constructor(config) {
    this.config = config;
  }

  map(objectToMap, schema) {
    const mappedObject = {};

    _.forOwn(objectToMap, (valueToMap, key) => {
      if(this._isFoundInSchema(key, schema)) {
        if(_.isArray(valueToMap) && this._isArrayofPrimitiveValues(valueToMap)) {
          const mappedValues = {}; 

          const mappedArrinNonPrimitiveForm = _.map(valueToMap, (primitiveValue) => {
            return this._mapValue(primitiveValue, key, schema);
          });

          _.forEach(mappedArrinNonPrimitiveForm, (item) => {
            _.forOwn(item, (value, itemKey) => {
              if(!mappedValues[itemKey]) mappedValues[itemKey] = [];
              if(!_.isUndefined(value)) mappedValues[itemKey].push(value);
            });
          });

          _.merge(mappedObject, mappedValues);
        }
        else if (_.isArray(valueToMap)) {
          const arrayElementsSchema = _.head(_.get(schema, key));

          const mappedArray = _.map(valueToMap, (arrayItem) => {
            return this.map(arrayItem, arrayElementsSchema);
          });
    
          _.set(mappedObject, key, mappedArray);
        }

        else if(_.isObject(valueToMap)) {
          const subSchemaForObject = _.get(schema, key);
          const mappedSubObject = this.map(valueToMap, subSchemaForObject);
          _.set(mappedObject, key, mappedSubObject);
        }
    
        else {
          const mappedData = this._mapValue(valueToMap, key, schema);
          _.merge(mappedObject, mappedData);
        }
      }

      else {
        mappedObject[key] = valueToMap;
      }
    });

    return mappedObject;
  }

  _isArrayofPrimitiveValues(array) {
    return !_.find(array, (item) => _.isObject(item));
  }

  _mapValue(valueToMap, keyInMainObject, schema) {
    if(_.isObject(valueToMap)) {
      throw new Error(`Cannot have an object in the value mapping schema at ${keyInMainObject}`);
    }

    if(this._isFoundInSchema(keyInMainObject, schema)) {
      return this._map(valueToMap, keyInMainObject, schema);
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

  _map(valueToMap, keyInMainObject, schema) {
    const mappedObject = {};

    let schemaForThisKey = _.cloneDeep(_.get(schema, keyInMainObject));
    schemaForThisKey = this._replacePointerKeyword(schemaForThisKey, keyInMainObject);

    _.forOwn(schemaForThisKey, (enumCases, schemaKey) => {
      let mappedItem;

      if(_.has(enumCases, valueToMap)) {
        mappedItem = _.get(enumCases, valueToMap);
      } 
      
      else {
        mappedItem = this._loadDefault(enumCases, valueToMap);
      }

      _.set(mappedObject, schemaKey, mappedItem);
    });

    return mappedObject;
  }

  _isFoundInSchema(keyInMainObject, schema) {
    return _.has(schema, keyInMainObject);
  }

  _loadDefault(schemaValue, originalValue) {
    const defaultValue = _.get(schemaValue, this.config.valueMapping.defaultKeyword);

    if(defaultValue === this.config.valueMapping.sameKeyword) {
      return originalValue;
    }

    return defaultValue;
  }

  _replacePointerKeyword(schema, keyInMainObject) {
    if(_.has(schema, this.config.valueMapping.pointer)) {
      schema[keyInMainObject] = _.get(schema, this.config.valueMapping.pointer);
      _.unset(schema, this.config.valueMapping.pointer);
    }
    
    return schema;
  }
}

module.exports = ValueMapper;
