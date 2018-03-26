'use strict';

const _ = require('lodash');
const BaseMapper = require('./BaseMapper');

class ArrayMapper extends BaseMapper {
  constructor(config) {
    super(config);
  }

  getPaths(data, currentPath, identifierValue) {
    currentPath = _.toString(currentPath);

    const splitter = this.config.arrayToArraySplitter;

    let splittedWrittenPaths = identifierValue.split(splitter);
    splittedWrittenPaths = _.map(splittedWrittenPaths, (arrItem) => {
      return _.trim(arrItem);
    });

    let allPaths = [];
    _.forEach(splittedWrittenPaths, (path) => {
      const actualPaths = this._changeWrittenPathToActualPaths(path, data, currentPath);
      allPaths = _.concat(allPaths, actualPaths);
    });

    return allPaths;
  }

  _changeWrittenPathToActualPaths(writtenPath, data, currentPath) {
    let splittedWrittenPaths = this._splitBasedOnPath(writtenPath);
    const starter = _.head(splittedWrittenPaths);
    let extractedPaths = this._extractPaths(starter, data, currentPath);

    splittedWrittenPaths = _.tail(splittedWrittenPaths);
    while(! _.isEmpty(splittedWrittenPaths)) {

      let concatinatedPaths = [];
      _.forEach(extractedPaths, (mainPath) => {
        const actualPaths = this._extractPaths(mainPath + '.' + _.head(splittedWrittenPaths), data, currentPath);
        concatinatedPaths = _.concat(concatinatedPaths, actualPaths);
      });

      extractedPaths = _.cloneDeep(concatinatedPaths);
      splittedWrittenPaths = _.tail(splittedWrittenPaths);
    }

    return extractedPaths;
  }

  _splitBasedOnPath(value) {
    value = value.split('.');
    if(_.head(value).match(/^@this[0-9]*/)) {
      const newHead = _.head(value) + '.' + value[1];
      const newValue = _.tail(_.tail(value));
      value = _.concat([newHead], newValue);
    }

    return value;
  }

  _calculateNewCurrentPath(currentPath) {
    if(currentPath === '') {
      return '';
    }

    return currentPath + '.';
  }

  _extractPaths(pathName, data, currentPath) {
    pathName = this._replacePointer(pathName, currentPath);
    const starter = this._calculateNewCurrentPath(currentPath);

    const dataToGet = this.variable(data, pathName, currentPath);

    if(!_.isArray(dataToGet)) {
      return [pathName];
    }

    const names = [];
    _.forEach(dataToGet, (item, index) => {
      names.push(pathName + '[' + index + ']');
    });

    return names;
  }
};

module.exports = ArrayMapper;
