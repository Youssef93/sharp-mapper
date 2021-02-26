/* eslint-disable no-useless-escape */
module.exports = {
  mappingTypes: [{
    regex: /^[@a-zA-Z\[\]0-9.:-_]* \$concat( \$with '.*')* [@a-zA-Z\[\]0-9.:-_]+/g,
    mapper: 'concat'
  },
  {
    regex: /^@/,
    mapper: 'variable'
  }, {
    regex: /^ *(\$date) *([@a-zA-Z\[\]0-9.:-_]* \$format *[a-zA-Z\/0-9.:-\s]*)\w+/g,
    mapper: 'date',
  }, {
    regex: /^ *\$if/g,
    mapper: 'ifConditions',
  }, {
    regex: /.*/,
    mapper: 'constant'
  }],

  arrayToArraySplitter: '$$and',
  pointerRegex: /\@this[0-9]*/g,
  defaultStructurePointer: '@this',

  dates: {
    head: '$date',
    formatter: '$format'
  },

  concatination: {
    splitter: '$concat',
    customConcat: '$with'
  },

  valueMapping: {
    pointer: "this",
    defaultKeyword: "$default",
    sameKeyword: "$same$"
  },

  conditionRegexs: {
    caseReg: new RegExp(
      /([\)\(@a-z\[\]A-Z0-9.\/\-_\:]* (\$equal|\$greater than|\$less than|\$not equal) [\)\(@a-z\[\]A-Z0-9.\s\/\-_\:]* \$return [\\@a-zA-Z\(\)0-9.\s\/\-\[\]_\:]*)/g
    ),

    otherwiseReg: new RegExp(
      /(\$otherwise \$return [\\@a-zA-Z\(\)0-9.\s\/\-\[\]_\:]*)/g
    ),

    expValuesReg: new RegExp(
      /\$equal|\$not equal|\$greater than|\$less than|\$return/g
    ),

    comparatorReg: new RegExp(
      /(\$equal|\$not equal|\$greater than|\$less than)/g
    )
  }
};