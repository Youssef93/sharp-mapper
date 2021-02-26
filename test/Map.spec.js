/* eslint-disable global-require */
"use strict";

const _ = require('lodash');
const { describe, it, before } = require('mocha');
const { expect } = require('chai');
const fs = require('fs');
const axios = require('axios');
const admZip = require('adm-zip');

const MapService = require('../index');

const streamToPromise = async function (data) {
  return new Promise((resolve, reject) => {
    data.pipe(fs.createWriteStream('./test/testData.zip')).on('finish', () => resolve()).on('error', (e) => reject(e));
  });
};

const downloadTestData = async function () {
  console.log('Test data is empty, attempting to retrieve it ..');
  if (!fs.existsSync('./test/testData.zip')) {
    const res = await axios({
      url: 'https://raw.githubusercontent.com/Youssef93/sharp-mapper-test-data/main/testData.zip',
      responseType: 'stream',
      method: 'GET'
    });

    await streamToPromise(res.data);
    console.log('Zip file downloaded from repo');
  }

  else console.log('File already on disk, unzipping cached file.');

  const zip = new admZip('./test/testData.zip');
  zip.extractAllTo('./test', true);
};

const execMappingCasualTestCase = function(subFolderName) {
  const directory = `./testData/${subFolderName}`;

  const dataJ = `${directory}/data`;
  const mappingJ = `${directory}/mappingSchema`;
  const validationJ = `${directory}/validation`;

  const data = require(dataJ);
  const mappingSchema = require(mappingJ);
  const validation = require(validationJ);
  const mappedObject = MapService.structureMap(data, mappingSchema);
  expect(mappedObject).to.deep.equal(validation);

  const mappedObjectWithUndefinedRemoved = MapService.structureMap(data, mappingSchema, true);
  expect(mappedObjectWithUndefinedRemoved).to.deep.equal(validation);
};

describe('MapService', () => {  

  before(async () => {
    if (!fs.existsSync('./test/testData')) await downloadTestData();
    if (!fs.readdirSync('./test/testData').length) await downloadTestData();
  });

  describe('structureMap', () => {
    it('should test object-to-object mapping', () => {
      execMappingCasualTestCase('object-to-object');
    });

    it('should test array-to-array mapping', () => {
      execMappingCasualTestCase('array-to-array');
    });

    it('should test arrayWithinArray-to-arrayWithinArray mapping', () => {
      execMappingCasualTestCase('arrayWithinArray-to-arrayWithinArray');
    });

    it('should test arrayWithinArray-to-arrayWithinArray mapping with filtering', () => {
      execMappingCasualTestCase('arrayWithinArray-to-arrayWithinArrayWithFilter');
    });

    it('should test arrayWithinArray-to-arrayWithinArray mapping with find', () => {
      execMappingCasualTestCase('arrayWithinArray-to-arrayWithinArrayWithFind');
    });

    it('should test dates mapping', () => {
      execMappingCasualTestCase('dates');
    });

    it('should test if conditions mapping', () => {
      execMappingCasualTestCase('if-conditions');
    });

    it('should test nested arrays to normalized array mapping', () => {
      execMappingCasualTestCase('nestedarrays-to-normalizedarrays');
    });

    it('should test nested arrays to normalized array mapping  if array not found in mappingSchema', () => {
      execMappingCasualTestCase('arrayNestedObjectNull-to-array');
    });

    it('should test nested arrays to normalized array mapping  if array is nested inside object inside array', () => {
      execMappingCasualTestCase('arrayNestedObject-to-array');
    });

    it('should test handling of null/undefined values', () => {
      execMappingCasualTestCase('invalid-values-mapping');
    });

    it('should test object to array mapping', () => {
      execMappingCasualTestCase('object-to-array');
    });

    it('should test object to nested array mapping', () => {
      execMappingCasualTestCase('object-to-nestedArray');
    });

    it('should test array of objects to array of primitive values mapping', () => {
      execMappingCasualTestCase('array-of-objects-to-array-of-primitive');
    });

    it('should test array of objects to array of primitive values mapping with filtering', () => {
      execMappingCasualTestCase('array-of-objects-to-array-of-primitivewithfilter');
    });

    it('should test array of objects to array of primitive values mapping with find', () => {
      execMappingCasualTestCase('array-of-objects-to-array-of-primitivewithfind');
    });

    it('should test array of primitive to array of objects values mapping with filter', () => {
      execMappingCasualTestCase('array-of-primitive-to-array-of-objectwithfilter');
    });

    it('should test array of primitive to array of primitive values mapping with filter', () => {
      execMappingCasualTestCase('array-of-primitive-to-array-of-primitivewithfilter');
    });

    it('should test array of primitive to array of primitive values mapping with find', () => {
      execMappingCasualTestCase('array-of-primitive-to-array-of-primitivewithfind');
    });

    it('should test array of primitive to array of objeci with find', () => {
      execMappingCasualTestCase('array-of-primitive-to-array-of-objectwithfind');
    });

    it('should test handling removing of undefined (not found) values', () => {
      const data = require('./testData/mapping-with-undefined-removed/data');
      const mappingSchema = require('./testData/mapping-with-undefined-removed/mappingSchema');
      const validation = require('./testData/mapping-with-undefined-removed/validation');
      const mappedObject = MapService.structureMap(data, mappingSchema);

      const validationWithUndefined = _.cloneDeep(validation);
      _.forEach(validationWithUndefined.allClaims, (claim) => {
        claim.parentName = undefined;
      });

      expect(mappedObject).to.deep.equal(validationWithUndefined);

      const mappedObjectWithUndefinedRemoved = MapService.structureMap(data, mappingSchema, true);
      expect(mappedObjectWithUndefinedRemoved).to.deep.equal(validation);
    });

    it('should test array to array maping if no object found', () => {
      const data = {};
      const mappingSchema = require('./testData/array-to-array/mappingSchema');
      const mappedObjectWithUndefinedRemoved = MapService.structureMap(data, mappingSchema, true);
      expect(mappedObjectWithUndefinedRemoved).to.deep.equal({"vehicles": []});
    });
  });

  describe('valueMap', () => {
    it('should map data values from one form of enums to the other', () => {
      const data = require('./testData/value-mapping/data');
      const mappingSchema = require('./testData/value-mapping/mappingSchema');
      const validation = require('./testData/value-mapping/validation');
      const mappedObject = MapService.valueMap(data, mappingSchema);
      expect(mappedObject).to.deep.equal(validation);

      const mappedObjectWithUndefinedRemoved = MapService.valueMap(data, mappingSchema, true);
      expect(mappedObjectWithUndefinedRemoved).to.deep.equal(validation);
    });

    it('should map data values from one form of enums to the other with presence of date object', () => {
      const data = require('./testData/value-mapping-with-dates/data');
      const mappingSchema = require('./testData/value-mapping-with-dates/mappingSchema');
      const validation = require('./testData/value-mapping-with-dates/validation');
      const mappedObject = MapService.valueMap(data, mappingSchema);
      const { expiryDate } = mappedObject;
      const date = _.cloneDeep(expiryDate);
      expect(_.isNaN(date)).to.be.false;
      _.unset(mappedObject, 'expiryDate');
      expect(mappedObject).to.deep.equal(validation);

      const mappedObjectWithUndefinedRemoved = MapService.valueMap(data, mappingSchema, true);
      _.unset(mappedObjectWithUndefinedRemoved, 'expiryDate');
      expect(mappedObjectWithUndefinedRemoved).to.deep.equal(validation);
    });
  });

  describe('translate', () => {
    it('should test array mapping tanslations', () => {
      const data = require('./testData/array-to-array/data.json');
      const paths = ['cars.drivers.name'];
      const result = MapService.translatePaths(data, paths);
      expect(result).to.deep.equal(['cars[0].drivers[0].name', 'cars[0].drivers[1].name', 'cars[1].drivers[0].name', 'cars[1].drivers[1].name']);
    });

    it('should test array mapping tanslations if parent is object not array', () => {
      const data = require('./testData/array-to-array/data.json');
      const paths = ['data.cars.drivers.name'];
      const test = { data };
      const result = MapService.translatePaths(test, paths);
      expect(result).to.deep.equal(['data.cars[0].drivers[0].name', 'data.cars[0].drivers[1].name', 'data.cars[1].drivers[0].name', 'data.cars[1].drivers[1].name']);
    });

    it('should test array mapping tanslations if the last child is an array', () => {
      const data = require('./testData/array-to-array/data.json');
      const paths = ['cars.drivers'];
      const result = MapService.translatePaths(data, paths);
      expect(result).to.deep.equal(['cars[0].drivers[0]', 'cars[0].drivers[1]', 'cars[1].drivers[0]', 'cars[1].drivers[1]']);
    });

    it('should return empty array', () => {
      const data = require('./testData/array-to-array/data.json');
      const paths = ['cars.drivers.test'];
      const result = MapService.translatePaths(data, paths);
      expect(result).to.deep.equal([]);
    });

    it('should return multiple paths arrays & object inside array validation', () => {
      const data = require('./testData/arrayNestedObjectNull-to-array/data.json');
      const paths = ['vehicles.otherData.claims', 'motorcycles.otherData.claims'];
      const result = MapService.translatePaths(data, paths);
      expect(result).to.deep.equal(['vehicles[1].otherData.claims[0]', 'vehicles[1].otherData.claims[1]', 'motorcycles[0].otherData.claims[0]']);
    });

    it('should throw error', () => {
      const fn = () => MapService.translatePaths({}, 'string');
      expect(fn).to.throw(Error);
    });
  });

  describe('enforceArrays', () => {
    it('should successfully enforce the data to arrays', () => {
      const data = require('./testData/enforce-arr-test/data');
      const validation = require('./testData/enforce-arr-test/validation');

      const paths = ['data.policies', 'parentArr', 'data.policies.vehicles', 'data.policies.vehicles.subValues', 'data.policies.houses', 'data.policies.houses.subValues', 'data.noarry'];

      const mapped = MapService.enforceArrays(data, paths);
      expect(mapped).to.deep.equal(validation);
    });
  });
});
