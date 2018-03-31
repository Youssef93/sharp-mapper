'use strict';

const moment = require('moment');
const _ = require('lodash');

const BaseMapper = require('./BaseMapper');

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
}

class SchemaMapper extends BaseMapper {
  constructor(config) {
    super(config);
    this.comparators = comparators;
  }

  date(data, path, currentPath) {
    const { dates } = this.config;
    path = path.replace(dates.head, '');

    let expressionParts = path.split(dates.formatter);
    expressionParts = _.map(expressionParts, (exp) => _.trim(exp));

    const dateObjectToCalculate = _.head(expressionParts);

    const dateFormat = _.last(expressionParts);

    const dateValue = this.mapBasedOnSchema(data, dateObjectToCalculate, currentPath);

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
          result = this.mapBasedOnSchema(data, otherwise, currentPath);
        }
      }
    }

    return result;
  }

  concat(data, path, currentPath) {
    const valuesToConcat = _.split(path, this.config.concatination.splitter);

    const concatParts = _.map(valuesToConcat, (valueToCalculate) => {
      const concatenationData = this._prepareForConcatenation(valueToCalculate);
      concatenationData.concatValue = this.mapBasedOnSchema(data, concatenationData.itemToCalculate, currentPath);
      return concatenationData;
    });

    let finalStr = '';
    _.forEach(concatParts, (concatData) => {
      finalStr += concatData.joiner + concatData.concatValue;
    });

    return _.trim(finalStr);
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

  _compare(data, path, currentPath) {
    const expValues = this._formatStrArray(path
      .replace(this.config.conditionRegexs.expValuesReg, '%|%')
      .split('%|%'));

    const firstValue = this.mapBasedOnSchema(data, expValues[0], currentPath);

    const secondValue = this.mapBasedOnSchema(data, expValues[1], currentPath);

    const returnValue = this.mapBasedOnSchema(data, expValues[2], currentPath);

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

};

module.exports = SchemaMapper;
