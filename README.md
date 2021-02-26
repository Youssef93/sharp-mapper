Node module that maps JavaScript objects from one form to the other using only JSON schema.

(now supports typescript)

Version 3.x is **not** backwards compatible, the changes are all in the [arrays](#arrays) section.

The four main functions are:

- [**Structure Mapping**](#structure-mapping)
    - [Object to Object](#object-to-object)
    - [If conditions](#if-conditions)
    - [Dates](#dates)
    - [Arrays](#arrays)
- [**Value Mapping (Enum Mapping):**](#value-mapping-enum-mapping)
  - [**Features:**](#features)
    - [Extract several items from one item](#extract-several-items-from-one-item)
    - [Default Keyword](#default-keyword)
    - [Same Keyword](#same-keyword)
    - [Note](#note)
- [**Translate Paths**](#translate-paths)
- [**Enforce Arrays**](#enforce-arrays)
- [Removing Undefined Values](#removing-undefined-values)

Removing undefined values is an option to make the JSON output look cleaner

All Examples can be found [here](https://github.com/Youssef93/sharp-mapper-test-data/blob/main/README.md)

Test data is separated from the actual module for performance purposes. All test cases can be found [here](https://github.com/Youssef93/sharp-mapper-test-data/blob/main/testData.zip). Note running `npm test` will automatically download the file, unzip it & execute the test cases.

------

## Structure Mapping

```javascript

var  sharpMapper  =  require('sharp-mapper');
const  REMOVE_UNDEFINED  =  true;
var  mappedObject  = sharpMapper.structureMap(oldObject, mappingSchema, REMOVE_UNDEFINED);

```

#### Object to Object

- The '@' in the schema.json tells the mapper to get the value from the object.
- The absence of the '@' means it's a constant value.
- The `$concat` keyword:
- `$concat` adds parts together.
- you can add constant string or fetch a value from the data.
- by default it concatenates the data with a space character.
- if you want a custom concatenation, use the `$with` keyword followed by your custom concatenation string wrapped in single quotes `''`
- Click [here](#removing-undefined-values) know more about the `REMOVE_UNDEFINED` flag
- For Examples on Object to Object Mapping go [here](https://github.com/Youssef93/sharp-mapper-test-data/blob/main/README.md#object-to-object)

----------
#### If conditions

Keywords for using the if conditions mapping are:
- "$if": indicates that this field has an if-condition schema
- "$equal": equivalent to '==='
- "$not equal": equivalent to '!=='
- "$greater than": equivalent to '>'
- "$less than": equivalent to '<'
- "$otherwise": equivalent to 'if ---- else'
- "$or": equivalent to 'if --- else if'
- "$return": the value to return (either a path which is prefixed by '@' or a constant value

**NOTE:**

if in an "if-condition" a null value is compared to a null value, the mapper does **NOT** satisfy the condition. (example the condition in "field1")

For examples on using if conditions go [here](https://github.com/Youssef93/sharp-mapper-test-data/blob/main/README.md#if-conditions)

----------

#### Dates
Keywords:
- "$date": indicates this is a date
- "$format": indicates the format of this date (ex: YYYY-MM-DD)

The mapper uses `dayjs` library in the background to satisfy the result.

For examples on using dates go [here](https://github.com/Youssef93/sharp-mapper-test-data/blob/main/README.md#dates)

----------

#### Arrays

**Keywords & Notes On Using Array Mapping:**

The mapper can now support extensive mapping between arrays. It can:

- Map from an array (of objects or primitives) to a different array (of objects or primitives)
- Apply conditions (filters / finds) on the input data
- Construct an array (of objects or primitives) from a non-array element

The 5 keywords used in mapping arrays are `arrays`, `map`, `pick`, `find`, `filter`

- `arrays`: It specifies which array(s) to map the data from, arrays can be combined using the `$$and` keyword. Ex `arrays: '@vehicles $$and @boats'`
- `map`: is used to define the output schema in case the desired array is an array of objects
- `pick`: is used to define the output schema in case the desired array is an array of primitive values
- `filter`: uses the [conditionals](#if-conditions) to apply a condition to filter the input data 
- `find`: uses the [conditionals](#if-conditions) to apply a condition to find a specific element in the input data

If the `arrays` keyword is missing, the `map` or `pick` will be used to construct an array from non array data (Their values must be an array in this case).

An array mapping subschema **must** contain either `map` or `pick` and not both

An array subschema can **not** contain both `find` &`filter` at the same time.

For examples on all cases of array mapping go [here](https://github.com/Youssef93/sharp-mapper-test-data/blob/main/README.md#arrays)

------

## **Value Mapping (Enum Mapping):**


```javascript
var  sharpMapper  =  require('sharp-mapper');
const  REMOVE_UNDEFINED  =  true
var  mappedObject  =  sharpMapper.valueMap(oldObject, mappingSchema, REMOVE_UNDEFINED);
```
This is a mapping module to map from certain set of enumeration to another set of enumerations

Since this mapping is does NOT map the object from one structure to the other. the structure of the mapping schema should match the structure of the original object.

Click [here](#removing-undefined-values) know more about the `REMOVE_UNDEFINED` flag

### **Features:**

#### Extract several items from one item

```json

{ "garage" : "Attached Garage - 1 Car" }

```

could be mapped to

```json
{
  "garageType": "attached",
  "capacity": 1
}
```

by specifying the mapping schema as:

```json
{
  "garage": {
    "garageType": {
      "Attached Garage - 1 Car": "attached",
      "Detached Garage - 1 Car": "dttached"
    },
    "capacity": {
      "Attached Garage - 1 Car": 1,
      "Detached Garage - 1 Car": 1
    }
  }
}
```

The schema is writing the attribute name that we wish to map "garage", followed by writing the attribute names we want to extract "garageType, capacity" as objects, then inside each object is all possible values of enumerations and their corresponding value.

if we want to extract the same name we type the keyword "this"

See Example [here](https://github.com/Youssef93/sharp-mapper-test-data/blob/main/README.md#value-mapping)

#### Default Keyword

The keyword "$default" is fetched if no other enum value is matched.

See Example [here](https://github.com/Youssef93/sharp-mapper-test-data/blob/main/README.md#default-keyword)

- Objects and arrays are listed as their corresponding structure in the main object
- If a certain attribute wasn't mentioned in the schema, it will be returned as it is (i.e. no mapping occurs)

#### Same Keyword

Using the `$same$` keyword along with the `$default` gives you a behavior similar to if/else if/else case

See Example [here](https://github.com/Youssef93/sharp-mapper-test-data/blob/main/README.md#same-keyword)

See a full example [here](https://github.com/Youssef93/sharp-mapper-test-data/blob/main/README.md#combined-test-case)

#### Note

Values mapping now supports mapping array of primitive values to array of primitive values

------

## Translate Paths
```javascript
var sharpMapper  =  require('sharp-mapper');
var writtenPaths = ['path1', 'path2'];
var actualPaths =  sharpMapper.translatePaths(object, writtenPaths);
```

What this function does is translate generic paths to actual paths from the object.

So for example if your case requires that every time you get data from an array inside an array,, you can translate the generic paths to actual ones based on the actual data without having to write code that actually does that

Example

```js
var sharpMapper  =  require('sharp-mapper');
var writtenPaths = ['data.vehicles.drivers', 'data.boats'];
var actualPaths =  sharpMapper.translatePaths(object, writtenPaths); 
// assuming vehicles, drivers & boats are all arrays
// return something like ['data.vehicles[0].drivers[0]', 'data.vehicles[0].drivers[1]', 'data.boats[0]'];
```

For a full example please check [here](https://github.com/Youssef93/sharp-mapper-test-data/blob/main/README.md#translate-paths)

## Enforce Arrays

```javascript
var sharpMapper  =  require('sharp-mapper');
var writterPaths = ['path1', 'path2'];
var updatedObject =  sharpMapper.enforceArrays(object, writtenPaths);
```

This function enforces a specific JSON structure regarding arrays.

It is useful if you are dealing with a third party that sometimes returns an array as an object if the value is only repeated once. An example for this would be parsing xml to JSON. Since there's no way to actually tell whether a  specified field should be an array or an object, xml parsers return array in the JSON only if the value is repeated.

For a full example please check [here](https://github.com/Youssef93/sharp-mapper-test-data/blob/main/README.md#enforce-arrays)

**Note:** This function used the [Translate Paths](#translate-paths) function under the hood to get the actual paths of the data

## Removing Undefined Values

- This flag removes all values set to `undefined ` after the mapping is finished.
- It's used in both types of mapping `structureMap` & `valueMap`
- Values are set to undefined if the schema could not be mapped to anything in the object.
- Example using `structureMap` where in the mapping schema, `parentName` value is not found

Check example [here](https://github.com/Youssef93/sharp-mapper-test-data/blob/main/README.md#removing-undefined-values)  
