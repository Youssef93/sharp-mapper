module.exports = {
  mappingTypes: [{
    regex: /^@/,
    mapper: 'variable'
  }, {
    regex: /^ *(\$date) *([@a-zA-Z\[\]0-9.:-]* \$format *[a-zA-Z\/0-9.:-\s]*)\w+/g,
    mapper: 'date',
  }, {
    regex: /^ *\$if/g,
    mapper: 'ifConditions',
  }, {
    regex: /.*/,
    mapper: 'constant'
  }],

  arrayIdentifier: "$$repeat$$",
  arrayToArraySplitter: '$$and',
  pointerRegex: /\@this[0-9]*/g,

  dates: {
    head: '$date',
    formatter: '$format'
  },

  valueMapping: {
    pointer: "this",
    defaultKeyword: "$default"
  },

  arrayMappingTypes: [{
    regex: /^[\)\(@a-z\[\]A-Z0-9.\/\-]* *(\$\$and [\)\(@a-z\[\]A-Z0-9.\/\-]*)*/g,
    mapper: 'getPaths'
  }],

  conditionRegexs: {
    caseReg: new RegExp(
      /([\)\(@a-z\[\]A-Z0-9.\/\-]* (\$equal|\$greater than|\$less than|\$not equal) [\)\(@a-z\[\]A-Z0-9.\s\/\-]* \$return [\\@a-zA-Z\(\)0-9.\s\/\-\[\]]*)/g
    ),

    otherwiseReg: new RegExp(
      /(\$otherwise \$return [\\@a-zA-Z\(\)0-9.\s\/\-\[\]]*)/g
    ),

    expValuesReg: new RegExp(
      /\$equal|\$not equal|\$greater than|\$less than|\$return/g
    ),

    comparatorReg: new RegExp(
      /(\$equal|\$not equal|\$greater than|\$less than)/g
    )
  }
};
