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

    const { mapper } = this.getMappingType(_.head(expressionParts));
    const dateValue = this[mapper](data, _.head(expressionParts), currentPath);

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
          let mappingType = this.getMappingType(otherwise);
          result = this[mappingType.mapper](data, otherwise, currentPath);
        }
      }
    }

    return result;
  }

  _compare(data, path, currentPath) {
    const expValues = this._formatStrArray(path
      .replace(this.config.conditionRegexs.expValuesReg, '%|%')
      .split('%|%'));
    let mappingType = this.getMappingType(expValues[0]);
    let firstValue = this[mappingType.mapper](data, expValues[0], currentPath);

    mappingType = this.getMappingType(expValues[1])
    let secondValue = this[mappingType.mapper](data, expValues[1], currentPath);

    mappingType = this.getMappingType(expValues[2]);
    const returnValue = this[mappingType.mapper](data, expValues[2], currentPath);

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
