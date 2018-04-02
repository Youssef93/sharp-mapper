'use strict';

const _ = require('lodash');
const moment = require('moment');

const comparators = {
  equal: function (firstValue, secondValue) {
    return _.toString(firstValue) === _.toString(secondValue);
  },

  notEqual: function (firstValue, secondValue) {
    return _.toString(firstValue) !== _.toString(secondValue);
  },

  greaterThan: function (firstValue, secondValue) {
    let result;
    firstValue = parseInt(firstValue);
    secondValue = parseInt(secondValue);

    if (_.isNumber(firstValue) && _.isNumber(secondValue)) {
      result = firstValue > secondValue;
    } else {
      result = null;
    }

    return result;
  },

  lessThan: function (firstValue, secondValue) {
    let result;
    firstValue = parseInt(firstValue);
    secondValue = parseInt(secondValue);

    if (_.isNumber(firstValue) && _.isNumber(secondValue)) {
      result = firstValue < secondValue;
    } else {
      result = null;
    }

    return result;
  }
};

class Mapper {
  constructor(config) {
    this.config = config;
    this.comparators = comparators;
  }

  map(data, schema, currentPath) {
    currentPath = _.toString(currentPath);
    const mappedObject = {};

    _.forOwn(schema, (schemaValue, schemaKey) => {
      const desiredOutput = _.cloneDeep(schemaValue);

      if (_.isArray(desiredOutput)) {
        const mappedArray = this._mapArray({ data, schema, schemaKey, currentPath });
        _.set(mappedObject, schemaKey, mappedArray);
      } 
      
      else if (_.isObject(desiredOutput)) {
        const subSchemaForObject = _.get(schema, schemaKey);
        const subMappedObject = this.map(data, subSchemaForObject, currentPath);
        _.set(mappedObject, schemaKey, subMappedObject);
      }
      
      else {
        const mappedItem = this._mapBasedOnSchema(data, desiredOutput, currentPath);
        _.set(mappedObject, schemaKey, mappedItem);
      }
    });

    return mappedObject;
  }

  constant(data, constant) {
    return constant;
  }

  variable(data, path, currentPath) {
    path = this._replacePointer(path, currentPath);
    path = this._removeVariableIdentifier(path);
    return _.get(data, path);
  }

  date(data, path, currentPath) {
    const { dates } = this.config;
    path = path.replace(dates.head, '');

    let expressionParts = path.split(dates.formatter);
    expressionParts = _.map(expressionParts, (exp) => _.trim(exp));

    const dateObjectToCalculate = _.head(expressionParts);

    const dateFormat = _.last(expressionParts);

    const dateValue = this._mapBasedOnSchema(data, dateObjectToCalculate, currentPath);

    if (_.isNil(dateValue))
      return null;

    return moment(dateValue).format(dateFormat);
  }

  ifConditions(data, path, currentPath) {
    const expParts = path.match(this.config.conditionRegexs.caseReg);
    let result = null;

    // loop on cases (all if conditions written)
    _.forEach(expParts, (caseExp) => {
      const compResult = this._compare(data, caseExp, currentPath);
      if (compResult) {
        result = compResult;
        return false;
      }
    });

    // if no cases match, look for otherwise
    if (result === null) {
      let otherwise = _.head(path.match(this.config.conditionRegexs.otherwiseReg));
      if (otherwise) {
        otherwise = otherwise.split(' ')[2];
        if (otherwise) {
          result = this._mapBasedOnSchema(data, otherwise, currentPath);
        }
      }
    }

    return result;
  }

  concat(data, path, currentPath) {
    const valuesToConcat = _.split(path, this.config.concatination.splitter);

    const concatParts = _.map(valuesToConcat, (valueToCalculate) => {
      const concatenationData = this._prepareForConcatenation(valueToCalculate);
      concatenationData.concatValue = this._mapBasedOnSchema(data, concatenationData.itemToCalculate, currentPath);
      return concatenationData;
    });

    let finalStr = '';
    _.forEach(concatParts, (concatData) => {
      finalStr += concatData.joiner + concatData.concatValue;
    });

    return _.trim(finalStr);
  }

  getPaths(data, currentPath, repeatValue) {
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

  _prepareForConcatenation(item) {
    item = _.trim(item);

    const concatenationData = {
      joiner: ' ',
      itemToCalculate: item
    };

    if (_.startsWith(item, this.config.concatination.customConcat)) {
      const start = _.indexOf(item, '\'');
      const end = _.lastIndexOf(item, '\'');
      concatenationData.joiner = item.substring(start + 1, end);
      concatenationData.itemToCalculate = _.trim(item.substring(end + 1));
    }

    return concatenationData;
  }

  _mapArray({ data, schema, schemaKey, currentPath }) {
    const { arrayIdentifier } = this.config;
    const repeatValue = _.get(schema[schemaKey][0], arrayIdentifier);
    
    if(_.isNil(repeatValue)) {
      throw new Error (`missing array identifier is ${JSON.stringify(schema[schemaKey])}`);
    }

    let mappedArray;

    // not an object & not an array
    if(!_.isObject(repeatValue)) {
      mappedArray = this._mapBasedOnArrayNames({ data, schema, schemaKey, currentPath, repeatValue });
    }

    else if (!_.isArray(repeatValue)) {
      throw new Error (`cannot have an object in the ${arrayIdentifier} value`);
    }

    else {
      mappedArray = this._constructArrayFromData({ data, currentPath, repeatValue });
    }

    return mappedArray;
  }

  _constructArrayFromData({ data, currentPath, repeatValue }) {
    return _.map(repeatValue, (valueToPush) => {
      if(_.isObject(valueToPush)) {
        return this.map(data, valueToPush, currentPath);
      }

      else {
        return this._mapBasedOnSchema(data, valueToPush, currentPath);
      }
    });
  }

  _mapBasedOnArrayNames({ data, schema, schemaKey, currentPath, repeatValue }) {
    const { mapper } = _.find(this.config.arrayMappingTypes, (mType) => {
      return repeatValue.match(mType.regex);
    });
  
    const actualArrayPaths = this[mapper](data, currentPath, repeatValue);
    const subSchemaForArrayItem = this._getSubSchemaForArray(schema, schemaKey);
    return _.map(actualArrayPaths, (path) => {
      return this.map(data, subSchemaForArrayItem, path);
    });
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

  _compare(data, path, currentPath) {
    const expValues = this._formatStrArray(path
      .replace(this.config.conditionRegexs.expValuesReg, '%|%')
      .split('%|%'));

    const firstValue = this._mapBasedOnSchema(data, expValues[0], currentPath);

    const secondValue = this._mapBasedOnSchema(data, expValues[1], currentPath);

    const returnValue = this._mapBasedOnSchema(data, expValues[2], currentPath);

    const comparator = this._getComparator(path);

    if (_.isNil(firstValue)) {
      return null;
    }

    let comparisonResult = null;

    const compareFunction = this.comparators[comparator];

    if (!_.isFunction(compareFunction)) {
      throw new Error(`unsupported comparator in the expression >> ${path}`);
    }

    comparisonResult = compareFunction(firstValue, secondValue);

    if (comparisonResult) {
      return returnValue;
    }

    return null;
  }

  _getComparator(path) {
    const comparatorInSchema = _.head(path.match(this.config.conditionRegexs.comparatorReg));

    if (!comparatorInSchema) {
      throw new Error('No comparator detected in ' + path);
    }

    return _.camelCase(comparatorInSchema);
  }

  _formatStrArray(strArr) {
    return _.map(_.compact(strArr), (x) => x.trim());
  }

  _removeVariableIdentifier(path) {
    return path.replace('@', '');
  }

  _mapBasedOnSchema(data, mappingValue, currentPath) {
    const { mapper } = this._getMappingType(mappingValue);
    return this[mapper](data, mappingValue, currentPath);
  }

  _getMappingType(value) {
    value = _.toString(value);
    return  _.find(this.config.mappingTypes, (mType) => {
      return value.match(mType.regex);
    });
  }

  _replacePointer(path, currentPath) {
    const pointer = _.head(path.match(this.config.pointerRegex));

    if(_.isNil(pointer)) {
      return path;
    }

    let numberOfPathsToDrop = _.head(_.compact(pointer.match(/[0-9]*/g)));

    if(_.isNil(numberOfPathsToDrop)) {
      numberOfPathsToDrop = 0;
    } 
    
    else {
      numberOfPathsToDrop = parseInt(numberOfPathsToDrop);
    }

    const splittedPath = currentPath.split('.');

    if(numberOfPathsToDrop > splittedPath.length) {
      throw new Error ('Number in the \'this\' keyword is too big');
    }

    const pathToOverride = _.join(_.dropRight(splittedPath, numberOfPathsToDrop), '.');

    return path.replace(this.config.pointerRegex, pathToOverride);
  }
};

module.exports = Mapper;
