Node module that maps JavaScript objects from one form to the other using only JSON schema.

(now supports typescript)

The four main functions are:

- [Structure Mapping](#structure-mapping)
	- [Object To Object](#object-to-object)
	- [If Conditions](#if-conditions)
	- [Dates](#dates)
	- [Arrays](#arrays)
	- [Repeat Values (for array mapping)](#repeat-values)
	- [Repeat value - String](#string)
	- [Repeat value - Array](#array)
	- [Repeat value - Object](#object)
- [Value Mapping (Enum Mapping):](#value-mapping-enum-mapping)
	- [$default keyword](#default-keyword)
	- [$same keyword](#same-keyword)
- [Translate Paths](#translate-paths)
- [Enforce Arrays](#enforce-arrays)

Removing undefined values is an option to make the JSON output look cleaner

- [Removing Undefined Values](#removing-undefined-values)

All Examples can be found [here](https://github.com/Youssef93/sharp-mapper/blob/master/Examples.md)

------

## Structure Mapping

```javascript

var  sharpMapper  =  require('sharp-mapper');
const  REMOVE_UNDEFINED  =  true;
var  mappedObject  =  sharpMapper.structureMap(oldObject, mappingSchema, REMOVE_UNDEFINED);

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
- For Examples on Object to Object Mapping go [here](https://github.com/Youssef93/sharp-mapper/blob/master/Examples.md#object-to-object)

----------
#### If conditions

Keyords for using the if conditions mapping are:
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

For examples on using if conditions go [here](https://github.com/Youssef93/sharp-mapper/blob/master/Examples.md#if-conditions)

----------

#### Dates
Keywords:
- "$date": indicates this is a date
- "$format": indicates the format of this date (ex: YYYY-MM-DD)

Using this mapping is equivalent to using moment()

For examples on using dates go [here](https://github.com/Youssef93/sharp-mapper/blob/master/Examples.md#dates)

----------

#### Arrays

**Keywords & Notes On Using Array Mapping:**

- The identifier "\$\$repeat$$" is the keyword that tells the mapper which arrays in the main object we want to map.
- The items are separated with the keyword "\$\$and" to repeat for all the arrays.
- Each path can contain allocations to arrays or objects. **EX:** "@array1.object.array2". which will be translated to "array1[0].object.array2[0]" and repeated for all the array elements for both "array1" & "array2"
- The ***"this"*** keyword: it's similar to a pointer which points to the path at which the mapper is looking. For example if the mapper is mapping from: "array1[0].object.array2[1]" & you specify the "this" keyword, it'll try to map the data from the last item in the current path (i.e "array2[1]") and whenever a number is inserted after this it will make the mapper look at the upper level by the same amount. **EX:** "@this1" will map from "object" while "@this2" will map from "array1[0]" & so on.
- For more examples on mapping arrays go [here](https://github.com/Youssef93/sharp-mapper/blob/master/Examples.md#arrays)
- See [this example](https://github.com/Youssef93/sharp-mapper/blob/master/Examples.md#constructing-an-array-from-non-array-data) on how to **construct an array from non-array data**

------

### Repeat Values:
The `$$repeat$$` in an array mapping can have one of 3 types:

#### String 

where the value found in the `$$repeat$$` is a string of arrays to execute the mapping on.

See Example [here](https://github.com/Youssef93/sharp-mapper/blob/master/Examples.md#repeat-value-string)



#### Array

to construct an array from non-array values

See Example [here](https://github.com/Youssef93/sharp-mapper/blob/master/Examples.md#repeat-value-array)



#### Object

to map an array of object to array of primitive values.

See Example [here](https://github.com/Youssef93/sharp-mapper/blob/master/Examples.md#repeat-value-object)

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

See Example [here](https://github.com/Youssef93/sharp-mapper/blob/master/Examples.md#value-mapping)

#### Default Keyword

The keyword "$default" is fetched if no other enum value is matched.

See Example [here](https://github.com/Youssef93/sharp-mapper/blob/master/Examples.md#default-keyword)

- Objects and arrays are listed as their corresponding structure in the main object
- If a certain attribute wasn't mentioned in the schema, it will be returned as it is (i.e. no mapping occurs)

#### Same Keyword

Using the `$same$` keyword along with the `$default` gives you a behavior similar to if/else if/else case

See Example [here](https://github.com/Youssef93/sharp-mapper/blob/master/Examples.md#same-keyword)



See a full example [here](https://github.com/Youssef93/sharp-mapper/blob/master/Examples.md#combined-test-case)

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

```javascript
const object = {
  "mainObjId": "77",
  "cars": [
    {
      "id": "1",
      "model": "Jaguar",
      "year": 2000,
      "drivers": [
        {
          "id": "d1id1",
          "name": "Test1"
        }, {
          "id": "d1id2",
          "name": "Test2"
        }
      ]
    }, {
      "id": "2",
      "model": "BMW",
      "year": 2012,
      "drivers": [
        {
          "id": "d2id1",
          "name": "Test12"
        }, {
          "id": "d2id2",
          "name": "Test22"
        }
      ]
    }
  ],

  "motorcycles": [
    {
      "id": "13",
      "model": "Harvey",
      "year": 2003,
      "drivers": [
        {
          "id": "dtest1",
          "name": "Test1"
        }, {
          "id": "dtest2",
          "name": "Test2"
        }
      ]
    }
  ]
};

const paths = ['cars.drivers.name', 'motorcycles.drivers.name'];
const actualPaths = sharpMapper.translatePaths(object, paths);

/* 
output
[
  "cars[0].drivers[0].name",
  "cars[0].drivers[1].name",
  "cars[1].drivers[0].name",
  "cars[1].drivers[1].name",
  "motorcycles[0].drivers[0].name",
  "motorcycles[0].drivers[1].name"
]
*/

```
  It basically translates the strings to actual paths. the string (written generic path).

## Enforce Arrays

```javascript
var sharpMapper  =  require('sharp-mapper');
var writterPaths = ['path1', 'path2'];
var updatedObject =  sharpMapper.enforceArrays(object, writtenPaths);
```

This function enforces a specific JSON structure regarding arrays.

It is useful if you are dealing with a third party that sometimes returns an array as an object if the value is only repeated once. An example for this would be parsing xml to JSON. Since there's no way to actually tell whether a  specified field should be an array or an object, xml parsers return array in the JSON only if the value is repeated.

Example

```json
{
  "data": {
    "policies": {
      "vehicles": {
        "Name": "test",
        "subValues": "a"
      },

      "houses": [
        {
          "Name": "h1",
          "subValues": "a"
        },
        {
          "Name": "h2",
          "subValues": ["a", "b"]
        }
      ]
    }
  }
}
```

```javascript
var sharpMapper  =  require('sharp-mapper');
var writterPaths = ['data.policies', 'data.policies.vehicles', 'data.policies.vehicles.subValues', 'data.policies.houses', 'data.policies.houses.subValues', 'data.noarry'];
var updatedObject =  sharpMapper.enforceArrays(object, writtenPaths);
```

Updated Object is

```json
{
  "data": {
    "policies": [{
      "vehicles": [{
        "Name": "test",
        "subValues": ["a"]
      }],

      "houses": [
        {
          "Name": "h1",
          "subValues": ["a"]
        },
        {
          "Name": "h2",
          "subValues": ["a", "b"]
        }
      ]
    }]
  }
}
```

**Note:** This function used the [Translate Paths](#translate-paths) function under the hood to get the actual paths of the data

## Removing Undefined Values

- This flag removes all values set to `undefined ` after the mapping is finished.
- It's used in both types of mapping `structureMap` & `valueMap`
- Values are set to undefined if the schema could not be mapped to anything in the object.
- Example using `structureMap` where in the mapping schema, `parentName` value is not found

Check example [here](https://github.com/Youssef93/sharp-mapper/blob/master/Examples.md#removing-undefined-values)  
