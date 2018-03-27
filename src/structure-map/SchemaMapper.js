'use strict';

const moment = require('moment');
const _ = require('lodash');

const BaseMapper = require('./BaseMapper');

class SchemaMapper extends BaseMapper {
  constructor(config) {
    super(config);
  }

  date(data, path, currentPath) {
    const { dates } = this.config;
    path = path.replace(dates.head, '');
    const expressionParts = _.map(path.split(dates.formatter), (item) => {
      return _.trim(item);
    });

    const dateValue = this.mapBasedOnSchema(data, _.head(expressionParts), currentPath);

    if(_.isNil(dateValue))
      return null;

    return moment(dateValue).format(_.last(expressionParts));
  }

  ifConditions(data, path, currentPath) {
    const expParts = path.match(this.config.conditionRegexs.caseReg);
    let result = null;

    // loop on cases
    _.forEach(expParts, (caseExp) => {
      const compResult = this._compare(data, caseExp, currentPath);
      if (compResult) {
        result = compResult;
        return false;
      }
    });

    // if no cases match look for otherwise
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
    const partsToConcat = _.split(path, this.config.concatination.splitter);
    const concatParts = _.map(partsToConcat, (valueToCalculate) => {
      const concatinationData = this._prepareForConcatination(valueToCalculate);
      concatinationData.itemToCalculate = _.cloneDeep(this.mapBasedOnSchema(data, concatinationData.itemToCalculate, currentPath));
      return concatinationData;
    });

    let finalStr = '';
    _.forEach(concatParts, (concatData) => {
      finalStr += concatData.concatSplitter + concatData.itemToCalculate;
    });

    return _.trim(finalStr);
  }

  _prepareForConcatination(item) {

    const concatinationData = {
      concatSplitter: ' ',
      itemToCalculate: _.trim(item)
    };

    if(_.startsWith(_.trim(item), this.config.concatination.customConcat)) {
      const start = _.indexOf(item, '\'');
      const end = _.lastIndexOf(item, '\'');
      concatinationData.concatSplitter = item.substring(start + 1, end);
      concatinationData.itemToCalculate = _.trim(item.substring(end + 1));
    }

    return concatinationData;
  }

  _compare(data, path, currentPath) {
    const expValues = this._formatStrArray(path
      .replace(this.config.conditionRegexs.expValuesReg, '%|%')
      .split('%|%'));

    let firstValue = this.mapBasedOnSchema(data, expValues[0], currentPath);
    
    let secondValue = this.mapBasedOnSchema(data, expValues[1], currentPath);

    const returnValue = this.mapBasedOnSchema(data, expValues[2], currentPath);

    const comparator = _.head(path.match(this.config.conditionRegexs.comparatorReg));

    if (!comparator) {
      throw new Error('No comparator detected in ' + path);
    }

    if(_.isNil(firstValue)) {
      return null;
    }

    let result = null;
    switch (comparator) {
    case '$equal':
      result = _.toString(firstValue) === _.toString(secondValue);
      break;
    case '$not equal':
      result = _.toString(firstValue) !== _.toString(secondValue);
      break;
    case '$greater than':
      firstValue = parseInt(firstValue);
      secondValue = parseInt(secondValue);

      if (_.isNumber(firstValue) && _.isNumber(secondValue)) {
        result = firstValue > secondValue;
      }
      else {
        result = null;
      }

      break;
    case '$less than':
      firstValue = parseInt(firstValue);
      secondValue = parseInt(secondValue);

      if (_.isNumber(firstValue) && _.isNumber(secondValue)) {
        result = firstValue < secondValue;
      }
      else {
        result = null;
      }

      break;
    default:
      throw new Error(`unsupported comparator >> ${comparator} in the expression >> ${path}`);
    }

    if (result) {
      return returnValue;
    }
  }

  _formatStrArray (strArr) {
    return _.map(_.compact(strArr), (x) => x.trim());
  }

};

module.exports = SchemaMapper;
