## Mapper Examples

### Object To Object

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

------

### If Conditions

Data:

```json
{
  "client": {
    "name": "Joe",
    "dob": "2000"
  },
  "drivers": [
    {
      "dob": "1990",
      "id": "181",
      "isDeleted": true,
      "yearsInsured": "10",
      "gender": "male"
    }
  ]
}
```

Schema:

```json
{
  "field1": "$if @drivers[0].notfounddata $equal @drivers[0].notfounddata $return yes $otherwise $return no",
  "field2": "$if @drivers[0].dob $less than 1000 $return Hello $or @drivers[0].dob $greater than 1000 $return Yes",
  "field3": "$if @client.dob $greater than 1900 $return PEX (Cross / linked polyethylene) $otherwise $return no",
  "field4": "$if @client.dob $greater than 1900 $return yes $otherwise $return no",
  "field5": "$if @drivers[0].isDeleted $equal true $return yes $otherwise $return no",
  "field6": "$if @drivers[0].yearsInsured $greater than 2000 $return hello",
  "field7": "$if @drivers[0].id $equal 181 $return @drivers[0].gender",
  "field8": "$if @drivers[0].id $not equal 180 $return @drivers[0].dob $otherwise $return yes",
  "field9": "$if @drivers[0].id $not equal 181 $return no $otherwise $return @client.name"
}
```

Output:

```json
{
  "field1": "no",
  "field2": "Yes",
  "field3": "PEX (Cross / linked polyethylene)",
  "field4": "yes",
  "field5": "yes",
  "field6": null,
  "field7": "male",
  "field8": "1990",
  "field9": "Joe"
}
```

------

### Dates

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
  "clientFullDate": "$date @client.date $format YYYY-MM-DD hh:mm:ss a",
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
  "clientFullDate": "2017-11-30 01:21:31 pm",
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

------

### Arrays

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
        },
        {
          "id": "d1id2",
          "name": "Test2"
        }
      ]
    },
    {
      "id": "2",
      "model": "BMW",
      "year": 2012,
      "drivers": [
        {
          "id": "d2id1",
          "name": "Test12"
        },
        {
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
        },
        {
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
  "vehicles": [
    {
      "$$repeat$$": "@cars $$and @motorcycles",
      "model": "@this.model",
      "year": "@this.year",
      "newValue": 2,
      "identification": {
        "id": "@this.id",
        "objectID": "@quoteId"
      },
      "drivers": [
        {
          "$$repeat$$": "@this.drivers",
          "id": "@this.id",
          "parentID": "@this1.id"
        }
      ]
    }
  ]
}
```

Output:

```json
{
  "vehicles": [
    {
      "model": "Jaguar",
      "year": 2000,
      "newValue": 2,
      "identification": {
        "objectID": "77",
        "id": "1"
      },
      "drivers": [
        {
          "id": "d1id1",
          "parentID": "1"
        },
        {
          "id": "d1id2",
          "parentID": "1"
        }
      ]
    },
    {
      "model": "BMW",
      "year": 2012,
      "newValue": 2,
      "identification": {
        "objectID": "77",
        "id": "2"
      },
      "drivers": [
        {
          "id": "d2id1",
          "parentID": "2"
        },
        {
          "id": "d2id2",
          "parentID": "2"
        }
      ]
    },
    {
      "model": "Harvey",
      "year": 2003,
      "newValue": 2,
      "identification": {
        "objectID": "77",
        "id": "13"
      },
      "drivers": [
        {
          "id": "dtest1",
          "parentID": "13"
        },
        {
          "id": "dtest2",
          "parentID": "13"
        }
      ]
    }
  ]
}
```

  

Example 2:

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
          "name": "c11"
        },
        {
          "id": "b",
          "name": "c12"
        }
      ]
    },
    {
      "id": "2",
      "name": "vehicle2",
      "claims": [
        {
          "id": "c",
          "name": "c21"
        },
        {
          "id": "d",
          "name": "c22"
        }
      ]
    }
  ],
  "motorcycles": [
    {
      "id": "3",
      "name": "motorcycle1",
      "claims": [
        {
          "id": "e",
          "name": "c31"
        }
      ]
    }
  ]
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
    },
    {
      "id": "b",
      "claimName": "c12",
      "parentID": "1",
      "parentName": "vehicle1"
    },
    {
      "id": "c",
      "claimName": "c21",
      "parentID": "2",
      "parentName": "vehicle2"
    },
    {
      "id": "d",
      "claimName": "c22",
      "parentID": "2",
      "parentName": "vehicle2"
    },
    {
      "id": "e",
      "claimName": "c31",
      "parentID": "3",
      "parentName": "motorcycle1"
    }
  ]
}
```

------

### Constructing an Array from Non-array Data

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
    "vehicles": [
      {
        "$$repeat$$": [
          "@vehicle_id_1",
          "@vehicle_id_2",
          "@vehicle_id_3",
          "@vehicle_id_4",
          "@vehicle_id_5"
        ]
      }
    ]
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
    "vehicles": [
      "a",
      "b",
      "c",
      "d",
      null
    ]
  }
}
```

------

### Repeat value String

Data:

```json
{
  "cars": [
    {
      "name": "c1",
      "modelYear": "1990"
    },
    {
      "name": "c2",
      "modelYear": "2000"
    }
  ]
}
```

Schema:

```json
{
  "cars": [
    {
      "$$repeat$$": "@cars",
      "title": "@this.name",
      "year": "@this.modelYear"
    }
  ]
}
```

Output:

```json
{
  "cars": [
    {
      "title": "c1",
      "year": "1990"
    },
    {
      "title": "c2",
      "year": "2000"
    }
  ]
}
```

------

### Repeat Value Array

Example1

Data:

```json
{
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
  "vehicles": [
    {
      "$$repeat$$": [
        "@vehicle_id_1",
        "@vehicle_id_2",
        "@vehicle_id_3",
        "@vehicle_id_4",
        "@vehicle_id_5"
      ]
    }
  ]
}
```

Output:

```json
{
	"vehicles": ["a", "b", "c", "d", null]
}
```



Example2

Data:

```json
{
  "vehicle_id_1": "a",
  "vehicle_id_2": "b",
  "vehicle_id_3": "c",
  "vehicle_id_4": "d",
  "vehicle_id_5": null,
}
```

Schema:

```json
{
  "vehicles": [
    {
      "$$repeat$$": [
        {
          "id": "@vehicle_id_1"
        },
        {
          "id": "@vehicle_id_2"
        },
        {
          "id": "@vehicle_id_3"
        },
        {
          "id": "@vehicle_id_4"
        },
        {
          "id": "@vehicle_id_5"
        }
      ]
    }
  ]
}
```

Output:

```json
{
  "vehicles": [
    {
      "id": "a"
    },
    {
      "id": "b"
    },
    {
      "id": "c"
    },
    {
      "id": "d"
    },
    {
      "id": null
    }
  ]
}
```

------

### Repeat value Object

Data:

```json
{
  "phones": [
    {
      "number": "+20137462",
      "id": "1"
    },
    {
      "number": "+3463662",
      "id": "2"
    }
  ]
}
```

Schema:

```json
{
  "phones": [
    {
      "$$repeat$$": {
        "arrays": "@phones",
        "pick": "number"
      }
    }
  ]
}
```

Output:

```json
{
	"phones": ["+20137462", "+3463662"]
}
```

------

### Value Mapping

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

Output:

```json
{
  "garage": "attached",
  "capacity": 1
}
```

------

### Default Keyword

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

------

### Same Keyword

Data

```json
{ "attribute": "a" }
```

Schema:

```json
{
  "attribute": {
    "this": {
      "b": "1",
      "c": "2",
      "$default": "$same$"
    }
  }
}
```

Output:

```json
{ "attribute": "a" }
```

------

### Combined Test Case

Data:

```json
{
  "homeType": "TownHouse",
  "mainId": "2",
  "vehicles": [
    {
      "id": "1",
      "vehicleType": "something else",
      "drivers": [
        {
          "id": "D1"
        }
      ]
    },
    {
      "id": "2",
      "vehicleType": "car",
      "drivers": [
        {
          "id": "D2"
        },
        {
          "id": "D3"
        }
      ]
    }
  ],
  "homes": [
    {
      "id": "1"
    },
    {
      "id": "2"
    }
  ],
  "games": [
    {
      "types": [
        {
          "type": "console",
          "name": "type11"
        }
      ],
      "id": 2
    }
  ],
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
      "$default": "$same$"
    },
    "isHouse": {
      "home": true,
      "condo": false,
      "$default": null
    }
  },
  "vehicles": [
    {
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
      "drivers": [
        {
          "id": {
            "this": {
              "D1": "driver1",
              "D2": "driver2",
              "D3": "driver3"
            }
          }
        }
      ]
    }
  ],
  "games": [
    {
      "types": [
        {
          "type": {
            "this": {
              "console": "gaming console"
            }
          }
        }
      ]
    }
  ],
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
  "homeType": "TownHouse",
  "mainId": "2",
  "isHouse": null,
  "vehicles": [
    {
      "id": "1",
      "vehicleType": "other",
      "isPersonal": null,
      "drivers": [
        {
          "id": "driver1"
        }
      ]
    },
    {
      "id": "2",
      "vehicleType": "personal vehicle",
      "isPersonal": true,
      "drivers": [
        {
          "id": "driver2"
        },
        {
          "id": "driver3"
        }
      ]
    }
  ],
  "homes": [
    {
      "id": "1"
    },
    {
      "id": "2"
    }
  ],
  "games": [
    {
      "id": 2,
      "types": [
        {
          "type": "gaming console",
          "name": "type11"
        }
      ]
    }
  ],
  "metaInfo": {
    "isValid": true,
    "name": "Test"
  }
}
```

------

### Removing Undefined Values

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
        },
        {
          "id": "b",
          "name": "c12"
        }
      ]
    },
    {
      "id": null,
      "name": "vehicle2",
      "claims": [
        {
          "id": "c",
          "name": "c21"
        },
        {
          "id": "d",
          "name": "c22"
        }
      ]
    }
  ],
  "motorcycles": [
    {
      "id": "3",
      "name": "motorcycle1",
      "claims": [
        {
          "id": "e",
          "name": "c31"
        }
      ]
    }
  ]
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
    },
    {
      "id": "b",
      "claimName": "c12",
      "parentID": "1"
    },
    {
      "id": "c",
      "claimName": "c21",
      "parentID": null
    },
    {
      "id": "d",
      "claimName": "c22",
      "parentID": null
    },
    {
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
  "allClaims": [
    {
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

------

