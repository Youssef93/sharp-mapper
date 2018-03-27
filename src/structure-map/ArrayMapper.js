'use strict';

const _ = require('lodash');
const BaseMapper = require('./BaseMapper');

class ArrayMapper extends BaseMapper {
  constructor(config) {
    super(config);
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

  _changeWrittenPathToActualPaths(data, writtenPath, currentPath) {
    let subPathsList = this._splitBasedOnPath(writtenPath);
    const headSubPath = _.head(subPathsList);
    let extractedPaths = this._repeatPathBasedOnArrayLength(headSubPath, data, currentPath);

    subPathsList = _.tail(subPathsList);
    while(! _.isEmpty(subPathsList)) {

      let concatinatedPaths = [];
      _.forEach(extractedPaths, (mainPath) => {
        const newExtractedPaths = this._repeatPathBasedOnArrayLength(mainPath + '.' + _.head(subPathsList), data, currentPath);
        concatinatedPaths = _.concat(concatinatedPaths, newExtractedPaths);
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

    if(! _.isArray(dataToGet)) {
      throw new Error('array not found');
    }

    return _.map(dataToGet, (item, index) => pathName + '[' + index + ']');
  }
};

module.exports = ArrayMapper;
