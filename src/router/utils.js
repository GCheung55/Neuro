var UNDEF;

//borrowed from AMD-utils
var typecastValue = function(val) {
    var r;
    if (val === null || val === 'null') {
        r = null;
    } else if (val === 'true') {
        r = true;
    } else if (val === 'false') {
        r = false;
    } else if (val === UNDEF || val === 'undefined') {
        r = UNDEF;
    } else if (val === '' || isNaN(val)) {
        //isNaN('') returns false
        r = val;
    } else {
        //parseFloat(null || '') returns NaN
        r = parseFloat(val);
    }
    return r;
}

var typecastArrayValues = function(values) {
    var n = values.length,
        result = [];
    while (n--) {
        result[n] = typecastValue(values[n]);
    }
    return result;
}

//borrowed from AMD-Utils
var decodeQueryString = function(str) {
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

exports.typecastValue = typecastValue;
exports.typecastArrayValues = typecastArrayValues;
exports.decodeQueryString = decodeQueryString;