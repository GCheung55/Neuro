var typecastValue = require('./value');

//borrowed from AMD-Utils
exports = module.exports = function(values) {
    var n = values.length,
        result = [];
    while (n--) {
        result[n] = typecastValue(values[n]);
    }
    return result;
};