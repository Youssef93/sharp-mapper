'use strict';

const _ = require('lodash');

class BaseMapper {
  constructor(config) {
    this.config = config;
  }

  mapBasedOnSchema(data, mappingValue, currentPath) {
    const { mapper } = this._getMappingType(mappingValue);
    return this[mapper](data, mappingValue, currentPath);
  }

  constant(data, constant) {
    return constant;
  }

  variable(data, path, currentPath) {
    path = this._replacePointer(path, currentPath);
    path = this._removeVariableIdentifier(path);
    return _.get(data, path);
  }

  _removeVariableIdentifier(path) {
    return path.replace('@', '');
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

module.exports = BaseMapper;
