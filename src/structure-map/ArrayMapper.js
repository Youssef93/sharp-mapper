'use strict';

const _ = require('lodash');
const SchemaMapper = require('./SchemaMapper');

class ArrayMapper extends SchemaMapper {
  constructor(config) {
    super(config);
  }

  mapArray({ data, schema, schemaKey, currentPath }, mainMapper) {
    const { arrayIdentifier } = this.config;
    const repeatValue = _.get(schema[schemaKey][0], arrayIdentifier);
    
    if(_.isNil(repeatValue)) {
      throw new Error (`missing array identifier is ${JSON.stringify(schema[schemaKey])}`);
    }

    let mappedArray;

    // not an object & not an array
    if(!_.isObject(repeatValue)) {
      mappedArray = this._mapBasedOnArrayNames({ data, schema, schemaKey, currentPath, repeatValue }, mainMapper);
    }

    else if (!_.isArray(repeatValue)) {
      throw new Error (`cannot have an object in the ${arrayIdentifier} value`);
    }

    else {
      mappedArray = this._constructArrayFromData({ data, currentPath, repeatValue }, mainMapper);
    }

    return mappedArray;
  }

  _constructArrayFromData({ data, currentPath, repeatValue }, mainMapper) {
    return _.map(repeatValue, (valueToPush) => {
      if(_.isObject(valueToPush)) {
        return mainMapper.map(data, valueToPush, currentPath);
      }

      else {
        return this.mapBasedOnSchema(data, valueToPush, currentPath);
      }
    });
  }

  _mapBasedOnArrayNames({ data, schema, schemaKey, currentPath, repeatValue }, mainMapper) {
    const { mapper } = _.find(this.config.arrayMappingTypes, (mType) => {
      return repeatValue.match(mType.regex);
    });
  
    const actualArrayPaths = this[mapper](data, currentPath, repeatValue);
    const subSchemaForArrayItem = this._getSubSchemaForArray(schema, schemaKey);
    return _.map(actualArrayPaths, (path) => {
      return mainMapper.map(data, subSchemaForArrayItem, path);
    });
  }

  _getPaths(data, currentPath, repeatValue) {
    currentPath = _.toString(currentPath);

    let valuesToRepeatMappingOn = repeatValue.split(this.config.arrayToArraySplitter);
    valuesToRepeatMappingOn = _.map(valuesToRepeatMappingOn, (item) => _.trim(item));
    let allPaths = [];

    _.forEach(valuesToRepeatMappingOn, (path) => {
      const actualPaths = this._changeWrittenPathToActualPaths(data, path, currentPath);
      allPaths = _.concat(allPaths, actualPaths);
    });

    return allPaths;
  }

  _changeWrittenPathToActualPaths(data, writtenPath, currentPath) {
    let subPathsList = this._splitBasedOnPath(writtenPath);
    const headSubPath = _.head(subPathsList);
    let extractedPaths = this._repeatPathBasedOnArrayLength(headSubPath, data, currentPath);

    subPathsList = _.tail(subPathsList);
    while(! _.isEmpty(subPathsList)) {

      let concatinatedPaths = [];
      _.forEach(extractedPaths, (mainPath) => {
        try {
          const newExtractedPaths = this._repeatPathBasedOnArrayLength(mainPath + '.' + _.head(subPathsList), data, currentPath);
          concatinatedPaths = _.concat(concatinatedPaths, newExtractedPaths);
        }

        catch(e) {
          // continue lodash for loop without calculating the path
          return true;
        }
      });

      extractedPaths = _.cloneDeep(concatinatedPaths);
      subPathsList = _.tail(subPathsList);
    }

    return extractedPaths;
  }

  /*
    if first item in the path contains the this pointer (example @this.drivers...)
    we need to keep the first item @this.drivers while splitting the remainder path
    because the mapper can understand @this.drivers while cannot understand @this only
  */
  _splitBasedOnPath(path) {
    path = path.split('.');
    if(_.head(path).match(/^@this[0-9]*/)) {
      const newHead = _.head(path) + '.' + path[1];
      const newTail = _.drop(path, 2);
      path = _.concat([newHead], newTail);
    }

    return path;
  }

  _calculateNewCurrentPath(currentPath) {
    if(currentPath === '') {
      return '';
    }

    return currentPath + '.';
  }

  _repeatPathBasedOnArrayLength(pathName, data, currentPath) {
    pathName = this._replacePointer(pathName, currentPath);
    const starter = this._calculateNewCurrentPath(currentPath);
    const dataToGet = this.variable(data, pathName, currentPath);

    if(_.isNil(dataToGet)) {
      // Error will be caught
      throw new Error('not an array');
    }

    if(! _.isArray(dataToGet)) {
      return [pathName];
    }

    return _.map(dataToGet, (item, index) => pathName + '[' + index + ']');
  }

  _getSubSchemaForArray (schema, schemaKey) {
    const arrayMapping = _.get(schema, schemaKey);
    const itemInsideArrayMapping = _.cloneDeep(_.head(arrayMapping));
    _.unset(itemInsideArrayMapping, this.config.arrayIdentifier);
    return itemInsideArrayMapping;
  }
};

module.exports = ArrayMapper;
