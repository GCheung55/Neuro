var typecastValue = require('./value');

//borrowed from AMD-Utils
exports = module.exports = function(str) {
    var queryArr = (str || '').replace('?', '').split('&'),
        n = queryArr.length,
        obj = {},
        item, val;
    while (n--) {
        item = queryArr[n].split('=');
        val = typecastValue(item[1]);
        obj[item[0]] = (typeof val === 'string')? decodeURIComponent(val) : val;
    }
    return obj;
};