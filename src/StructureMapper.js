"use strict";

const _ = require("lodash");
const dayjs = require('dayjs');

const utilities = require('./Utilities');

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

    if (utilities.isNumber(firstValue) && utilities.isNumber(secondValue)) {
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

    if (utilities.isNumber(firstValue) && utilities.isNumber(secondValue)) {
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

  // main fuction, recursive
  map(data, schema, currentPath, condition) {
    currentPath = _.toString(currentPath);
    const mappedObject = {};

    Object.keys(schema).forEach(schemaKey => {
      const schemaValue = schema[schemaKey];
      const desiredOutput = _.cloneDeep(schemaValue);

      let itemToSet;

      if (utilities.isArray(desiredOutput)) itemToSet = this._mapArray({ data, schema, schemaKey, currentPath });
      else if (utilities.isObject(desiredOutput)) itemToSet = this.map(data, _.get(schema, schemaKey), currentPath);
      else itemToSet = this._mapBasedOnSchema(data, desiredOutput, currentPath);

      if (!condition) _.set(mappedObject, schemaKey, itemToSet);
      else if (this.ifConditions(data, condition, currentPath)) _.set(mappedObject, schemaKey, itemToSet);
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
    path = path.replace(dates.head, "");

    let expressionParts = path.split(dates.formatter);
    expressionParts = expressionParts.map(exp => exp.trim());

    const dateObjectToCalculate = expressionParts[0];

    const dateFormat = expressionParts[expressionParts.length - 1];

    const dateValue = this._mapBasedOnSchema(data, dateObjectToCalculate, currentPath);

    if (_.isNil(dateValue)) return undefined;

    return dayjs(dateValue).format(dateFormat);
  }

  ifConditions(data, path, currentPath) {
    const expParts = path.match(this.config.conditionRegexs.caseReg);
    let result = null;

    // loop on cases (all if conditions written)
    expParts.forEach(caseExp => {
      const compResult = this._compare(data, caseExp, currentPath);
      if (compResult) {
        result = compResult;
        return false;
      }
    });

    // if no cases match, look for otherwise
    if (result === null) {
      let otherwise = path.match(this.config.conditionRegexs.otherwiseReg);
      if (otherwise) {
        otherwise = otherwise[0].split(" ")[2];
        if (otherwise) {
          result = this._mapBasedOnSchema(data, otherwise, currentPath);
        }
      }
    }

    return result;
  }

  concat(data, path, currentPath) {
    const valuesToConcat = path.split(this.config.concatination.splitter);

    const concatParts = valuesToConcat.map(valueToCalculate => {
      const concatenationData = this._prepareForConcatenation(valueToCalculate);
      concatenationData.concatValue = this._mapBasedOnSchema(data, concatenationData.itemToCalculate, currentPath) || "";
      return concatenationData;
    });

    let finalStr = "";
    concatParts.forEach(concatData => {
      if (!_.isEmpty(concatData.concatValue)) {
        const starterString = _.isEmpty(finalStr) ? "" : concatData.joiner;
        finalStr += starterString + concatData.concatValue;
      }
    });

    return finalStr.trim();
  }

  getPaths(data, currentPath, repeatValue) {
    currentPath = _.toString(currentPath);

    let valuesToRepeatMappingOn = repeatValue.split(this.config.arrayToArraySplitter);
    valuesToRepeatMappingOn = valuesToRepeatMappingOn.map(item => item.trim());
    let allPaths = [];

    valuesToRepeatMappingOn.forEach(path => {
      const actualPaths = this.changeWrittenPathToActualPaths(data, path, currentPath);
      allPaths = [...allPaths, ...actualPaths];
    });

    return allPaths;
  }

  changeWrittenPathToActualPaths(data, writtenPath, currentPath) {
    const subPathsList = this._splitBasedOnPath(writtenPath);
    const headSubPath = subPathsList[0];

    let extractedPaths;

    try {
      extractedPaths = this._repeatPathBasedOnArrayLength(headSubPath, data, currentPath);
    } catch (e) {
      return [];
    }

    subPathsList.shift();
    while (subPathsList.length) {
      let concatinatedPaths = [];

      extractedPaths.forEach(mainPath => {
        try {
          const newExtractedPaths = this._repeatPathBasedOnArrayLength(mainPath + "." + subPathsList[0], data, currentPath);
          concatinatedPaths = [...concatinatedPaths, ...newExtractedPaths];
        } catch (e) {
          // continue for loop without calculating the path
          return true;
        }
      });

      extractedPaths = _.cloneDeep(concatinatedPaths);
      subPathsList.shift();
    }

    return extractedPaths;
  }

  _prepareForConcatenation(item) {
    item = item.trim();

    const concatenationData = {
      joiner: " ",
      itemToCalculate: item
    };

    if (_.startsWith(item, this.config.concatination.customConcat)) {
      const start = _.indexOf(item, "'");
      const end = _.lastIndexOf(item, "'");
      concatenationData.joiner = item.substring(start + 1, end);
      concatenationData.itemToCalculate = item.substring(end + 1).trim();
    }

    return concatenationData;
  }

  _validateArraySchema({ find, filter, pick, map }) {
    if ((!map && !pick) || (map && pick)) throw new Error('Subschema of type array must have either pick or map keywords');
    if (find && filter) throw new Error('Subschema of type array can not contain both find & filter at the same time');
    return;
  }

  _mapArray({ data, schema, schemaKey, currentPath }) {
    const schemaBody = _.get(schema, schemaKey)[0];

    this._validateArraySchema(schemaBody);
    const { arrays, find, filter, pick, map } = schemaBody;

    const condition = filter || find;

    if (arrays) {
      const actualArrayPaths = this.getPaths(data, currentPath, arrays);

      let result;

      if (map) {
        result = actualArrayPaths.map(path => {
          return this.map(data, map, path, condition);
        });

        if (filter) result = result.filter(x => Object.keys(x).length);
        else if (find) result = result.find(x => Object.keys(x).length);
      }

      else if (pick) {
        result = actualArrayPaths.map(path => {
          return this.map(data, { '##TEMP##': pick }, path, condition);
        }).map(x => x['##TEMP##']);

        if (filter) result = result.filter(x => x);
        else if (find) result = result.find(x => x);
      }

      return result;
    }

    else if (map) {
      if (!utilities.isArray(map)) throw new Error('map attribute must be an array in case the attribute \'arrays\' is absent.');
      return map.map(mapSubItem => this.map(data, mapSubItem, this._calculateNewCurrentPath(currentPath) + schemaKey));
    }

    else if (pick) {
      if (!utilities.isArray(pick)) throw new Error('pick attribute must be an array in case the attribute \'arrays\' is absent.');
      return pick.map(p => this._mapBasedOnSchema(data, p, currentPath));
    }
  }

  /*
    if first item in the path contains the this pointer (example @this.drivers...)
    we need to keep the first item @this.drivers while splitting the remainder path
    because the mapper can understand @this.drivers while cannot understand @this only
  */
  _splitBasedOnPath(path) {
    path = path.split(".");
    if (path[0].match(/^@this[0-9]*/)) {
      const newHead = path[0] + "." + path[1];
      const newTail = _.drop(path, 2);
      path = [newHead, ...newTail];
    }

    return path;
  }

  _calculateNewCurrentPath(currentPath) {
    if (currentPath === "") {
      return "";
    }

    return currentPath + ".";
  }

  _repeatPathBasedOnArrayLength(pathName, data, currentPath) {
    pathName = this._replacePointer(pathName, currentPath);
    const dataToGet = this.variable(data, pathName, currentPath);

    if (_.isNil(dataToGet)) {
      // Error will be caught
      throw new Error("not an array");
    }

    if (!utilities.isArray(dataToGet)) {
      return [pathName];
    }

    return dataToGet.map((item, index) => pathName + "[" + index + "]");
  }

  _compare(data, path, currentPath) {
    const expValues = this._formatStrArray(path.replace(this.config.conditionRegexs.expValuesReg, "%|%").split("%|%"));

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
    const comparatorInSchema = path.match(this.config.conditionRegexs.comparatorReg);

    if (!comparatorInSchema || !comparatorInSchema[0]) {
      throw new Error(`No comparator detected in ${path}`);
    }

    return _.camelCase(comparatorInSchema[0]);
  }

  _formatStrArray(strArr) {
    return _.compact(strArr).map(x => x.trim());
  }

  _removeVariableIdentifier(path) {
    return path.replace("@", "");
  }

  _mapBasedOnSchema(data, mappingValue, currentPath) {
    const { mapper } = this._getMappingType(mappingValue);
    return this[mapper](data, mappingValue, currentPath);
  }

  _getMappingType(value) {
    value = _.toString(value);
    return this.config.mappingTypes.find(mType => {
      return value.match(mType.regex);
    });
  }

  _replacePointer(path, currentPath) {
    const pointer = _.head(path.match(this.config.pointerRegex));

    if (_.isNil(pointer)) {
      return path;
    }

    let numberOfPathsToDrop = _.head(_.compact(pointer.match(/[0-9]*/g)));

    if (_.isNil(numberOfPathsToDrop)) numberOfPathsToDrop = 0;
    else numberOfPathsToDrop = parseInt(numberOfPathsToDrop);

    const splittedPath = currentPath.split(".");

    if (numberOfPathsToDrop > splittedPath.length) {
      throw new Error("Number in the 'this' keyword is too big");
    }

    const pathToOverride = _.dropRight(splittedPath, numberOfPathsToDrop).join('.');

    return path.replace(this.config.pointerRegex, pathToOverride);
  }
}

module.exports = Mapper;
