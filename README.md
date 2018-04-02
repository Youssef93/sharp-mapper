A Node module that maps Javascript objects from one form to the other.

## **Structure Mapping:**

```javascript
var sharpMapper = require('sharp-mapper');
const REMOVE_UNDEFINED = true;
var mappedObject = sharpMapper.structureMap(oldObject, mappingSchema, REMOVE_UNDEFINED);
```

**Examples:**

1- Object to Object:

Data:


```JSon
{
 "clientName": "Sharp",
 "clientAge": 15,
 "clientStreetAddress": "15 street 1",
 "clientStreetName": "Rue de avenue",
 "childFirstName": "Joe",
 "childMiddleName": "Heat",
 "childLastName": "Marg"
}
```

Schema:

```json
{
  "client": {
    "name": "@clientName",
    "age": "@clientAge",
    "address": {
      "streetNumber": "@clientStreetAddress",
      "streetName": "@clientStreetName"
    },

    "childName": "Mr. $concat @childFirstName $concat $with '' @childMiddleName $concat $with '-' @childLastName"
  }
}
```
Output:


```json
{
  "client": {
    "name": "Sharp",
    "age": 15,
    "address": {
      "streetNumber": "15 street 1",
      "streetName": "Rue de avenue"
    },

    "childName": "Mr. JoeHeat-Marg"
  }
}
```
- The '@' in the schema.json tells the mapper to get the value from the object. 
- The absence of the '@' means it's a constant value.
- The `$concat` keyword:
  - `$concat` adds parts together.
  - you can add constant string or fetch a value from the data.
  - by default it concatenates the data with a space character. 
  - if you want a custom concatenation, use the `$with` keyword followed by your custom concatenation string wrapped in single quotes `''`
- Click [here](#removing-undefined-values) know more about the `REMOVE_UNDEFINED` flag

----------


2- If conditions:

Data:

```json
{
  "client": {
    "name": "Joe",
    "dob": "2000"
  },

  "drivers": [{
    "dob": "1990",
    "id": "181",
    "isDeleted": true,
    "yearsInsured": "10",
    "gender": "male"
  }]
}
```
Schema:

```json
{
  "field1" : "$if @drivers[0].notfounddata $equal @drivers[0].notfounddata $return yes $otherwise $return no",
  "field2": "$if @drivers[0].dob $less than 1000 $return Hello $or @drivers[0].dob $greater than 1000 $return Yes",
  "field3" : "$if @client.dob $greater than 1900 $return PEX (Cross / linked polyethylene) $otherwise $return no",
  "field4": "$if @client.dob $greater than 1900 $return yes $otherwise $return no",
  "field5" : "$if @drivers[0].isDeleted $equal true $return yes $otherwise $return no",
  "field6" : "$if @drivers[0].yearsInsured $greater than 2000 $return hello",
  "field7" : "$if @drivers[0].id $equal 181 $return @drivers[0].gender",
  "field8" : "$if @drivers[0].id $not equal 180 $return @drivers[0].dob $otherwise $return yes",
  "field9" : "$if @drivers[0].id $not equal 181 $return no $otherwise $return @client.name"
}
```
Output:

```json
{
  "field1" : "no",
  "field2": "Yes",
  "field3" : "PEX (Cross / linked polyethylene)",
  "field4": "yes",
  "field5" : "yes",
  "field6" : null,
  "field7" : "male",
  "field8" : "1990",
  "field9" : "Joe"
}
```
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

----------


3- Dates:

Data:

```json
{
  "client": {
    "date": "2017-11-30T13:21:31.243"
  }
}
```
Schema:

```json
{
  "clientFullDate" : "$date @client.date $format YYYY-MM-DD hh:mm:ss a",
  "clientDate": "$date @client.date $format YYYY-MM-DD",
  "clientDateTime": "$date @client.date $format hh:mm:ss a",
  "clientDateYear": "$date @client.date $format YYYY",
  "clientDateMonth": "$date @client.date $format MM",
  "clientDateDay": "$date @client.date $format DD",
  "clientDateHour": "$date @client.date $format hh",
  "clientDateMin": "$date @client.date $format mm",
  "clientDateSec": "$date @client.date $format ss",
  "clientDateAmPm": "$date @client.date $format a"
}
```
Output:

```json
{
  "clientFullDate" : "2017-11-30 01:21:31 pm",
  "clientDate": "2017-11-30",
  "clientDateTime": "01:21:31 pm",
  "clientDateYear": "2017",
  "clientDateMonth": "11",
  "clientDateDay": "30",
  "clientDateHour": "01",
  "clientDateMin": "21",
  "clientDateSec": "31",
  "clientDateAmPm": "pm"
}
```
   Keywords:


 - "$date": indicates this is a date
 - "$format": indicates the format of this date (ex: YYYY-MM-DD)

Using this mapping is equivalent to using moment()

----------


**Arrays:**

Example 1:

 Data:

```json
{
  "quoteId": "77",
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
}
```
Schema:

```json
{
  "vehicles": [{
    "$$repeat$$": "@cars $$and @motorcycles",
    "model": "@this.model",
    "year": "@this.year",
    "newValue": 2,
    "identification": {
      "id": "@this.id",
      "objectID": "@quoteId"
    },
    "drivers": [{
      "$$repeat$$": "@this.drivers",
      "id": "@this.id",
      "parentID": "@this1.id"
    }]
  }]
}
```
Output:

```json
{
  "vehicles": [{
    "model": "Jaguar",
    "year": 2000,
    "newValue": 2,
    "identification": {
      "objectID": "77",
      "id": "1"
    },
    "drivers": [{
      "id": "d1id1",
      "parentID": "1"
    }, {
      "id": "d1id2",
      "parentID": "1"
    }]
  }, {
    "model": "BMW",
    "year": 2012,
    "newValue": 2,
    "identification": {
      "objectID": "77",
      "id": "2"
    },
    "drivers": [{
      "id": "d2id1",
      "parentID": "2"
    }, {
      "id": "d2id2",
      "parentID": "2"
    }]
  }, {
    "model": "Harvey",
    "year": 2003,
    "newValue": 2,
    "identification": {
      "objectID": "77",
      "id": "13"
    },
    "drivers": [{
      "id": "dtest1",
      "parentID": "13"
    }, {
      "id": "dtest2",
      "parentID": "13"
    }]
  }]
}
```

Example 2:

Data:

```json
{
  "vehicles": [{
    "id": "1",
    "model": "Jaguar",
    "year": 2000,
    "objectID": "77",
    "newValue": 2,
    "drivers": [{
      "id": "d1id1",
      "parentID": "1"
    }, {
      "id": "d1id2",
      "parentID": "1"
    }]
  }, {
    "id": "2",
    "model": "BMW",
    "year": 2012,
    "objectID": "77",
    "newValue": 2,
    "drivers": [{
      "id": "d2id1",
      "parentID": "2"
    }, {
      "id": "d2id2",
      "parentID": "2"
    }]
  }, {
    "id": "13",
    "model": "Harvey",
    "year": 2003,
    "objectID": "77",
    "newValue": 2,
    "drivers": [{
      "id": "dtest1",
      "parentID": "13"
    }, {
      "id": "dtest2",
      "parentID": "13"
    }]
  }]
}
```
Schema:

```json
{
  "allClaims": [
    {
      "$$repeat$$": "@vehicles.claims $$and @motorcycles.claims",
      "id": "@this.id",
      "claimName": "@this.name",
      "parentID": "@this1.id",
      "parentName": "@this1.name"
    }
  ]
}
```
Output:

```json
{
  "allClaims": [
    {
      "id": "a",
      "claimName": "c11",
      "parentID": "1",
      "parentName": "vehicle1"
    }, {
      "id": "b",
      "claimName": "c12",
      "parentID": "1",
      "parentName": "vehicle1"
    }, {
      "id": "c",
      "claimName": "c21",
      "parentID": "2",
      "parentName": "vehicle2"
    }, {
      "id": "d",
      "claimName": "c22",
      "parentID": "2",
      "parentName": "vehicle2"
    }, {
      "id": "e",
      "claimName": "c31",
      "parentID": "3",
      "parentName": "motorcycle1"
    }
  ]
}
```
**Keywords & Notes On Using Array Mapping:**

 - The identifier "\$\$repeat$$"  is the keyword that tells the mapper which arrays in the main object we want to map.
 - The items are separated with the keyword "\$\$and" to repeat for all the arrays.
 - Each path can contain allocations to arrays or objects. **EX:** "@array1.object.array2". which will be translated to "array1[0].object.array2[0]" and repeated for all the array elements for both "array1" & "array2"
 - The ***"this"*** keyword: it's similar to a pointer which points to the path at which the mapper is looking. For example if the mapper is mapping from:  "array1[0].object.array2[1]" & you specify the "this" keyword, it'll try to map the data from the last item in the current path (i.e "array2[1]") and whenever a number is inserted after this it will make the mapper look at the upper level by the same amount. **EX:** "@this1" will map from "object" while "@this2" will map from "array1[0]" & so on.


**You can construct an array from non-array data**

Data:

```json
{
  "clientName": "Sharp",
  "clientAge": 15,
  "clientStreetAddress": "15 street 1",
  "clientStreetName": "Rue de avenue",
  "childFirstName": "Joe",
  "childMiddleName": "Heat",
  "childLastName": "Marg",
  "vehicle_id_1": "a",
  "vehicle_id_2": "b",
  "vehicle_id_3": "c",
  "vehicle_id_4": "d",
  "vehicle_id_5": null
}
```

Schema:

```json
{
  "client": {
    "name": "@clientName",
    "age": "@clientAge",
    "address": {
      "streetNumber": "@clientStreetAddress",
      "streetName": "@clientStreetName"
    },

    "vehicles": [{
      "$$repeat$$": ["@vehicle_id_1", "@vehicle_id_2", "@vehicle_id_3", "@vehicle_id_4", "@vehicle_id_5"]
    }]
  }
}

```

Output:

```json
{
  "client": {
    "name": "Sharp",
    "age": 15,
    "address": {
      "streetNumber": "15 street 1",
      "streetName": "Rue de avenue"
    },
    
    "vehicles": ["a", "b", "c", "d", null]
  }
}

```



----------
## **Value Mapping (Enum Mapping):**

```javascript
var sharpMapper = require('sharp-mapper');
const REMOVE_UNDEFINED = true
var mappedObject = sharpMapper.valueMap(oldObject, mappingSchema, REMOVE_UNDEFINED);
```

This is a mapping module to map from certain set of enumeration to another set of enumerations

Since this mapping is does NOT map the object from one structure to the other. the structure of the mapping schema should match the structure of the original object.

Click [here](#removing-undefined-values) know more about the `REMOVE_UNDEFINED` flag

### **Features:**

 - Extract several items from one item. **EX:**

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

 - If we want to extract the same name we type the keyword "this". **EX:**

  Data


```json
     { "garage" : "Attached Garage - 1 Car" }
```

Schema:


```json
{
  "garage": {
    "this": {
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

output:

```json
  {
      "garage": "attached",
      "capacity": 1
   }
```

 - The keyword "$default" is fetched if no other enum value is matched. **EX:**

Data:


```json
      { "garage" : "New Value" }
```
Shema:



```json
{
  "garage": {
    "this": {
      "Attached Garage - 1 Car": "attached",
      "Detached Garage - 1 Car": "attached",
      "$default": "other"
    }
  }
}
```
Output:

```json
    { "garage" : "other" }
```

 - Objects and arrays are listed as their corresponding structure in the main object
 - If a certain attribute wasn't mentioned in the schema, it will be returned as it is (i.e. no mapping occurs)



**A combined test case:**

Data:

```json
{
  "homeType": "home",
  "mainId": "2",
  "vehicles": [{
    "id": "1",
    "vehicleType": "something else",
    "drivers": [{
      "id": "D1"
    }]
  }, {
    "id": "2",
    "vehicleType": "car",
    "drivers": [{
      "id": "D2"
    }, {
      "id": "D3"
    }]
  }],

  "homes": [{
    "id": "1"
  }, {
    "id": "2"
  }],

  "games": [{
    "types": [{
      "type": "console",
      "name": "type11"
    }],

    "id": 2
  }],

  "metaInfo": {
    "isValid": "TRUE",
    "name": "Test"
  }
}
```

Schema:

```json
{
  "homeType": {
    "this": {
      "home": "house",
      "condo": "condoHouse",
      "$default": "other"
    },

    "isHouse": {
      "home": true,
      "condo": false,
      "$default": null
    }
  },

  "vehicles": [{
    "vehicleType": {
      "this": {
        "car": "personal vehicle",
        "bus": "public transportation",
        "$default": "other"
      },

      "isPersonal": {
        "car": true,
        "bus": false,
        "$default": null
      }
    },

    "drivers": [{
      "id": {
        "this": {
          "D1": "driver1",
          "D2": "driver2",
          "D3": "driver3"
        }
      }
    }]
  }],

  "games": [{
    "types": [{
      "type": {
        "this": {
          "console": "gaming console"
        }
      }
    }]
  }],

  "metaInfo": {
    "isValid": {
      "this": {
        "TRUE": true,
        "FALSE": false,
        "$default": null
      }
    }
  }
}
```

Output:

```json
{
  "homeType": "house",
  "mainId": "2",
  "isHouse": true,
  "vehicles": [{
    "id": "1",
    "vehicleType": "other",
    "isPersonal": null,
    "drivers": [{
      "id": "driver1"
    }]
  }, {
    "id": "2",
    "vehicleType": "personal vehicle",
    "isPersonal": true,
    "drivers": [{
      "id": "driver2"
    }, {
      "id": "driver3"
    }]
  }],

  "homes": [{
    "id": "1"
  }, {
    "id": "2"
  }],

  "games": [{
    "id": 2,
    "types": [{
      "type": "gaming console",
      "name": "type11"
    }]
  }],

  "metaInfo": {
    "isValid": true,
    "name": "Test"
  }
}
```



------

## Removing Undefined Values

- This flag removes all values set to `undefined ` after the mapping is finished.
- It's used in both types of mapping `structureMap` & `valueMap`
- Values are set to undefined if the schema could not be mapped to anything in the object.
- Example using `structureMap` where in the mapping schema, `parentName` value is not found

Data:

```json
{
  "vehicles": [
    {
      "id": "1",
      "name": "vehicle1",
      "claims": [
        {
          "id": "a",
          "name": null
        }, {
          "id": "b",
          "name": "c12"
        }
      ]
    }, {
      "id": null,
      "name": "vehicle2",
      "claims": [
        {
          "id": "c",
          "name": "c21"
        }, {
          "id": "d",
          "name": "c22"
        }
      ]
    }
  ],

  "motorcycles": [{
    "id": "3",
    "name": "motorcycle1",
    "claims": [{
      "id": "e",
      "name": "c31"
    }]
  }]
}

```

Schema:

```json
{
  "allClaims": [
    {
      "$$repeat$$": "@vehicles.claims $$and @motorcycles.claims",
      "id": "@this.id",
      "claimName": "@this.name",
      "parentID": "@this1.id",
      "parentName": "@this2.parentIdentifier"
    }
  ]
}

```

Output (if flag is set to true):

```json
{
  "allClaims": [
    {
      "id": "a",
      "claimName": null,
      "parentID": "1"
    }, {
      "id": "b",
      "claimName": "c12",
      "parentID": "1"
    }, {
      "id": "c",
      "claimName": "c21",
      "parentID": null
    }, {
      "id": "d",
      "claimName": "c22",
      "parentID": null
    }, {
      "id": "e",
      "claimName": "c31",
      "parentID": "3"
    }
  ]
}

```

Output (if flag is set to false):

```json
{
  "allClaims": [{
      "id": "a",
      "claimName": null,
      "parentID": "1",
      "parentName": undefined
    },
    {
      "id": "b",
      "claimName": "c12",
      "parentID": "1",
      "parentName": undefined
    },
    {
      "id": "c",
      "claimName": "c21",
      "parentID": null,
      "parentName": undefined
    },
    {
      "id": "d",
      "claimName": "c22",
      "parentID": null,
      "parentName": undefined
    },
    {
      "id": "e",
      "claimName": "c31",
      "parentID": "3",
      "parentName": undefined
    }
  ]
}
```

