var UNDEF;

//borrowed from AMD-utils
exports = module.exports = function(val) {
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
};