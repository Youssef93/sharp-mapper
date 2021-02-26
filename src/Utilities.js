module.exports = {
  isObject: function(val) {
    return Object.prototype.toString.call(val) === "[object Object]";
  },

  isArray: function(val) {
    return Array.isArray(val);
  },

  isNumber: function(val) {
    return typeof val === 'number';
  }
};