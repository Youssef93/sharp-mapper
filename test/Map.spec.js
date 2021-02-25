/* eslint-disable global-require */
"use strict";

const _ = require('lodash');
const { describe, it } = require('mocha');
const { expect } = require('chai');

const MapService = require('../index');

describe('MapService', () => {
  describe('structureMap', () => {
    // it('should test object-to-object mapping', () => {
    //   const data = require('./testData/object-to-object/data');
    //   const mappingSchema = require('./testData/object-to-object/mappingSchema');
    //   const validation = require('./testData/object-to-object/validation');
    //   const mappedObject = MapService.structureMap(data, mappingSchema);
    //   expect(mappedObject).to.deep.equal(validation);

    //   const mappedObjectWithUndefinedRemoved = MapService.structureMap(data, mappingSchema, true);
    //   expect(mappedObjectWithUndefinedRemoved).to.deep.equal(validation);
    // });

    // it('should test array-to-array mapping', () => {
    //   const data = require('./testData/array-to-array/data');
    //   const mappingSchema = require('./testData/array-to-array/mappingSchema');
    //   const validation = require('./testData/array-to-array/validation');
    //   const mappedObject = MapService.structureMap(data, mappingSchema);
    //   expect(mappedObject).to.deep.equal(validation);

    //   const mappedObjectWithUndefinedRemoved = MapService.structureMap(data, mappingSchema, true);
    //   expect(mappedObjectWithUndefinedRemoved).to.deep.equal(validation);
    // });

    // it('should test arrayWithinArray-to-arrayWithinArray mapping', () => {
    //   const data = require('./testData/arrayWithinArray-to-arrayWithinArray/data');
    //   const mappingSchema = require('./testData/arrayWithinArray-to-arrayWithinArray/mappingSchema');
    //   const validation = require('./testData/arrayWithinArray-to-arrayWithinArray/validation');
    //   const mappedObject = MapService.structureMap(data, mappingSchema);
    //   expect(mappedObject).to.deep.equal(validation);

    //   const mappedObjectWithUndefinedRemoved = MapService.structureMap(data, mappingSchema, true);
    //   expect(mappedObjectWithUndefinedRemoved).to.deep.equal(validation);
    // });

    // it('should test dates mapping', () => {
    //   const data = require('./testData/dates/data');
    //   const mappingSchema = require('./testData/dates/mappingSchema');
    //   const validation = require('./testData/dates/validation');
    //   const mappedObject = MapService.structureMap(data, mappingSchema);
    //   expect(mappedObject).to.deep.equal(validation);

    //   const mappedObjectWithUndefinedRemoved = MapService.structureMap(data, mappingSchema, true);
    //   expect(mappedObjectWithUndefinedRemoved).to.deep.equal(validation);
    // });

    it('should test if conditions mapping', () => {
      const data = require('./testData/if-conditions/data');
      const mappingSchema = require('./testData/if-conditions/mappingSchema');
      const validation = require('./testData/if-conditions/validation');
      const mappedObject = MapService.structureMap(data, mappingSchema);
      expect(mappedObject).to.deep.equal(validation);

      const mappedObjectWithUndefinedRemoved = MapService.structureMap(data, mappingSchema, true);
      expect(mappedObjectWithUndefinedRemoved).to.deep.equal(validation);
    });

    // it('should test nested arrays to normalized array mapping', () => {
    //   const data = require('./testData/nestedarrays-to-normalizedarrays/data');
    //   const mappingSchema = require('./testData/nestedarrays-to-normalizedarrays/mappingSchema');
    //   const validation = require('./testData/nestedarrays-to-normalizedarrays/validation');
    //   const mappedObject = MapService.structureMap(data, mappingSchema);
    //   expect(mappedObject).to.deep.equal(validation);

    //   const mappedObjectWithUndefinedRemoved = MapService.structureMap(data, mappingSchema, true);
    //   expect(mappedObjectWithUndefinedRemoved).to.deep.equal(validation);
    // });

    // it('should test nested arrays to normalized array mapping  if array not found in mappingSchema', () => {
    //   const data = require('./testData/arrayNestedObjectNull-to-array/data');
    //   const mappingSchema = require('./testData/arrayNestedObjectNull-to-array/mappingSchema');
    //   const validation = require('./testData/arrayNestedObjectNull-to-array/validation');
    //   const mappedObject = MapService.structureMap(data, mappingSchema);
    //   expect(mappedObject).to.deep.equal(validation);

    //   const mappedObjectWithUndefinedRemoved = MapService.structureMap(data, mappingSchema, true);
    //   expect(mappedObjectWithUndefinedRemoved).to.deep.equal(validation);
    // });

    // it('should test nested arrays to normalized array mapping  if array is nested inside object inside array', () => {
    //   const data = require('./testData/arrayNestedObject-to-array/data');
    //   const mappingSchema = require('./testData/arrayNestedObject-to-array/mappingSchema');
    //   const validation = require('./testData/arrayNestedObject-to-array/validation');
    //   const mappedObject = MapService.structureMap(data, mappingSchema);
    //   expect(mappedObject).to.deep.equal(validation);

    //   const mappedObjectWithUndefinedRemoved = MapService.structureMap(data, mappingSchema, true);
    //   expect(mappedObjectWithUndefinedRemoved).to.deep.equal(validation);
    // });

    // it('should test handling of null/undefined values', () => {
    //   const data = require('./testData/invalid-values-mapping/data');
    //   const mappingSchema = require('./testData/invalid-values-mapping/mappingSchema');
    //   const validation = require('./testData/invalid-values-mapping/validation');
    //   const mappedObject = MapService.structureMap(data, mappingSchema);
    //   expect(mappedObject).to.deep.equal(validation);

    //   const mappedObjectWithUndefinedRemoved = MapService.structureMap(data, mappingSchema, true);
    //   expect(mappedObjectWithUndefinedRemoved).to.deep.equal(validation);
    // });

    // it('should test handling removing of undefined (not found) values', () => {
    //   const data = require('./testData/mapping-with-undefined-removed/data');
    //   const mappingSchema = require('./testData/mapping-with-undefined-removed/mappingSchema');
    //   const validation = require('./testData/mapping-with-undefined-removed/validation');
    //   const mappedObject = MapService.structureMap(data, mappingSchema);

    //   const validationWithUndefined = _.cloneDeep(validation);
    //   _.forEach(validationWithUndefined.allClaims, (claim) => {
    //     claim.parentName = undefined;
    //   });

    //   expect(mappedObject).to.deep.equal(validationWithUndefined);

    //   const mappedObjectWithUndefinedRemoved = MapService.structureMap(data, mappingSchema, true);
    //   expect(mappedObjectWithUndefinedRemoved).to.deep.equal(validation);
    // });

    // it('should test object to array mapping', () => {
    //   const data = require('./testData/object-to-array/data');
    //   const mappingSchema = require('./testData/object-to-array/mappingSchema');
    //   const validation = require('./testData/object-to-array/validation');
    //   const mappedObject = MapService.structureMap(data, mappingSchema);
    //   expect(mappedObject).to.deep.equal(validation);

    //   const mappedObjectWithUndefinedRemoved = MapService.structureMap(data, mappingSchema, true);
    //   expect(mappedObjectWithUndefinedRemoved).to.deep.equal(validation);
    // });

    // it('should test object to nested array mapping', () => {
    //   const data = require('./testData/object-to-nestedArray/data');
    //   const mappingSchema = require('./testData/object-to-nestedArray/mappingSchema');
    //   const validation = require('./testData/object-to-nestedArray/validation');
    //   const mappedObject = MapService.structureMap(data, mappingSchema);
    //   expect(mappedObject).to.deep.equal(validation);

    //   const mappedObjectWithUndefinedRemoved = MapService.structureMap(data, mappingSchema, true);
    //   expect(mappedObjectWithUndefinedRemoved).to.deep.equal(validation);
    // });

    // it('should test array of objects to array of primitive values mapping', () => {
    //   const data = require('./testData/array-of-objects-to-array-of-primitive/data');
    //   const mappingSchema = require('./testData/array-of-objects-to-array-of-primitive/mappingSchema');
    //   const validation = require('./testData/array-of-objects-to-array-of-primitive/validation');
    //   const mappedObject = MapService.structureMap(data, mappingSchema);
    //   expect(mappedObject).to.deep.equal(validation);

    //   const mappedObjectWithUndefinedRemoved = MapService.structureMap(data, mappingSchema, true);
    //   expect(mappedObjectWithUndefinedRemoved).to.deep.equal(validation);
    // });

    // it('should test array to array maping if not object found', () => {
    //   const data = {};
    //   const mappingSchema = require('./testData/array-to-array/mappingSchema');
    //   const mappedObjectWithUndefinedRemoved = MapService.structureMap(data, mappingSchema, true);
    //   expect(mappedObjectWithUndefinedRemoved).to.deep.equal({"vehicles": []});
    // });
  });

  // describe('valueMap', () => {
  //   it('should map data values from one form of enums to the other', () => {
  //     const data = require('./testData/value-mapping/data');
  //     const mappingSchema = require('./testData/value-mapping/mappingSchema');
  //     const validation = require('./testData/value-mapping/validation');
  //     const mappedObject = MapService.valueMap(data, mappingSchema);
  //     expect(mappedObject).to.deep.equal(validation);

  //     const mappedObjectWithUndefinedRemoved = MapService.valueMap(data, mappingSchema, true);
  //     expect(mappedObjectWithUndefinedRemoved).to.deep.equal(validation);
  //   });

  //   it('should map data values from one form of enums to the other with presence of date object', () => {
  //     const data = require('./testData/value-mapping-with-dates/data');
  //     const mappingSchema = require('./testData/value-mapping-with-dates/mappingSchema');
  //     const validation = require('./testData/value-mapping-with-dates/validation');
  //     const mappedObject = MapService.valueMap(data, mappingSchema);
  //     const { expiryDate } = mappedObject;
  //     const date = _.cloneDeep(expiryDate);
  //     expect(_.isNaN(date)).to.be.false;
  //     _.unset(mappedObject, 'expiryDate');
  //     expect(mappedObject).to.deep.equal(validation);

  //     const mappedObjectWithUndefinedRemoved = MapService.valueMap(data, mappingSchema, true);
  //     _.unset(mappedObjectWithUndefinedRemoved, 'expiryDate');
  //     expect(mappedObjectWithUndefinedRemoved).to.deep.equal(validation);
  //   });
  // });

  // describe('translate', () => {
  //   it('should test array mapping tanslations', () => {
  //     const data = require('./testData/array-to-array/data.json');
  //     const paths = ['cars.drivers.name'];
  //     const result = MapService.translatePaths(data, paths);
  //     expect(result).to.deep.equal(['cars[0].drivers[0].name', 'cars[0].drivers[1].name', 'cars[1].drivers[0].name', 'cars[1].drivers[1].name']);
  //   });

  //   it('should test array mapping tanslations if parent is object not array', () => {
  //     const data = require('./testData/array-to-array/data.json');
  //     const paths = ['data.cars.drivers.name'];
  //     const test = { data };
  //     const result = MapService.translatePaths(test, paths);
  //     expect(result).to.deep.equal(['data.cars[0].drivers[0].name', 'data.cars[0].drivers[1].name', 'data.cars[1].drivers[0].name', 'data.cars[1].drivers[1].name']);
  //   });

  //   it('should test array mapping tanslations if the last child is an array', () => {
  //     const data = require('./testData/array-to-array/data.json');
  //     const paths = ['cars.drivers'];
  //     const result = MapService.translatePaths(data, paths);
  //     expect(result).to.deep.equal(['cars[0].drivers[0]', 'cars[0].drivers[1]', 'cars[1].drivers[0]', 'cars[1].drivers[1]']);
  //   });

  //   it('should return empty array', () => {
  //     const data = require('./testData/array-to-array/data.json');
  //     const paths = ['cars.drivers.test'];
  //     const result = MapService.translatePaths(data, paths);
  //     expect(result).to.deep.equal([]);
  //   });

  //   it('should return multiple paths arrays & object inside array validation', () => {
  //     const data = require('./testData/arrayNestedObjectNull-to-array/data.json');
  //     const paths = ['vehicles.otherData.claims', 'motorcycles.otherData.claims'];
  //     const result = MapService.translatePaths(data, paths);
  //     expect(result).to.deep.equal(['vehicles[1].otherData.claims[0]', 'vehicles[1].otherData.claims[1]', 'motorcycles[0].otherData.claims[0]']);
  //   });

  //   it('should throw error', () => {
  //     const fn = () => MapService.translatePaths({}, 'string');
  //     expect(fn).to.throw(Error);
  //   });
  // });

  // describe('enforceArrays', () => {
  //   it('should successfully enforce the data to arrays', () => {
  //     const data = require('./testData/enforce-arr-test/data');
  //     const validation = require('./testData/enforce-arr-test/validation');

  //     const paths = ['data.policies', 'parentArr', 'data.policies.vehicles', 'data.policies.vehicles.subValues', 'data.policies.houses', 'data.policies.houses.subValues', 'data.noarry'];
      
  //     const mapped = MapService.enforceArrays(data, paths);
  //     expect(mapped).to.deep.equal(validation);
  //   });
  // });
});
