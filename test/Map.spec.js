"use strict";

const _ = require('lodash');

const MapService = require('../index');

const { expect } = require('chai');

describe('MapService', () => {
  describe('structureMap', () => {
    it('should test object-to-object mapping', () => {
      const data = require('./testData/object-to-object/data');
      const mappingSchema = require('./testData/object-to-object/mappingSchema');
      const validation = require('./testData/object-to-object/validation');
      const mappedObject = MapService.structureMap(data, mappingSchema);
      expect(mappedObject).to.deep.equal(validation);
    });

    it('should test array-to-array mapping', () => {
      const data = require('./testData/array-to-array/data');
      const mappingSchema = require('./testData/array-to-array/mappingSchema');
      const validation = require('./testData/array-to-array/validation');
      const mappedObject = MapService.structureMap(data, mappingSchema);
      expect(mappedObject).to.deep.equal(validation);
    });

    it('should test arrayWithinArray-to-arrayWithinArray mapping', () => {
      const data = require('./testData/arrayWithinArray-to-arrayWithinArray/data');
      const mappingSchema = require('./testData/arrayWithinArray-to-arrayWithinArray/mappingSchema');
      const validation = require('./testData/arrayWithinArray-to-arrayWithinArray/validation');
      const mappedObject = MapService.structureMap(data, mappingSchema);
      expect(mappedObject).to.deep.equal(validation);
    });

    it('should test dates mapping', () => {
      const data = require('./testData/dates/data');
      const mappingSchema = require('./testData/dates/mappingSchema');
      const validation = require('./testData/dates/validation');
      const mappedObject = MapService.structureMap(data, mappingSchema);
      expect(mappedObject).to.deep.equal(validation);
    });

    it('should test if conditions mapping', () => {
      const data = require('./testData/if-conditions/data');
      const mappingSchema = require('./testData/if-conditions/mappingSchema');
      const validation = require('./testData/if-conditions/validation');
      const mappedObject = MapService.structureMap(data, mappingSchema);
      expect(mappedObject).to.deep.equal(validation);
    });

    it('should test nested arrays to normalized array mapping', () => {
      const data = require('./testData/nestedarrays-to-normalizedarrays/data');
      const mappingSchema = require('./testData/nestedarrays-to-normalizedarrays/mappingSchema');
      const validation = require('./testData/nestedarrays-to-normalizedarrays/validation');
      const mappedObject = MapService.structureMap(data, mappingSchema);
      expect(mappedObject).to.deep.equal(validation);
    });
  });

  describe('valueMap', () => {
    it('should map data values from one form of enums to the other', () => {
      const data = require('./testData/value-mapping/data');
      const mappingSchema = require('./testData/value-mapping/mappingSchema');
      const validation = require('./testData/value-mapping/validation');
      const mappedObject = MapService.valueMap(data, mappingSchema);
      expect(mappedObject).to.deep.equal(validation);
    });
  });
});
