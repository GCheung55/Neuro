/**
 * Router, an object heavily influenced by Crossroads.js by Miller Medeiros (https://github.com/millermedeiros/crossroads.js)
 * date - Jul 29, 2012
 * crossroads.js commit - 3b413b0b506b0c04f80b03194d4c1abaeccc9574
 * @type {Class}
 */
var collectionObj = require('../collection/main'),
    routeObj = require('../route/main'),
    signalFactory = require('../../utils/signalFactory');

var Router = new Class({
    Extends: collectionObj.Collection,

    options: {
        Model: {
            constructor: routeObj.Route,
            options: {
                defaults: {
                    typecast: false,
                    normalizer: null
                }
            }
        },
        greedy: false,
        greedyEnabled: true
    },

    _prevRoutes: [],

    _prevMatchedRequest: null,

    _prevBypassedRequest: null,

    _add: function(route){
        // placement of route is determined by the priority property
        var priority = instanceOf(route, routeObj.Route) ? route.get('priority') : route.priority || (route.priority = 0);

        this.parent(route, this._calcPriority(priority));

        return this;
    },

    /**
     * _calcPriority uses a priority number to calculate what should be the returned insertion point.
     * @param  {Number} priority The value used to determine the insertion index
     * @return {Number}          The resolved index;
     */
    _calcPriority: function(priority){
        var route, n = this.length;

        do { --n; } while ( (route = this.get(n), route) && priority <= route.get('priority'));

        return n + 1;
    },

    resetState: function(){
        this._prevRoutes.length = 0;
        this._prevMatchedRequest = null;
        this._prevBypassedRequest = null;
        return this
    },

    parse: function(request, defaultArgs){
        request = request || '';
        defaultArgs = defaultArgs || [];

        if (request !== this._prevMatchedRequest && request !== this._prevBypassedRequest) {
            var routes = this._getMatchedRoutes(request),
                i = 0,
                n = routes.length,
                cur;

            if (n) {
                this._prevMatchedRequest = request;

                this._notifyPrevRoutes(routes, request);

                this._prevRoutes = routes;

                //should be incremental loop, execute routes in order
                while (i < n) {
                    cur = routes[i];
                    cur.route.signalMatch.apply(cur.route, defaultArgs.concat(cur.params));
                    cur.isFirst = !i;
                    this.signalMatch.apply(this, defaultArgs.concat([request, cur]));
                    i += 1;
                }
            } else {
                this._prevBypassedRequest = request;
                this.signalDefault.apply(this, defaultArgs.concat([request]));
            }
        }

        return this;
    },

    _notifyPrevRoutes: function(matchedRoutes, request){
        var i = 0, prev;
        
        while (prev = this._prevRoutes[i++]) {
            //check if switched exist since route may be disposed
            if (/*prev.route.switched && */this._didSwitch(prev.route, matchedRoutes)) {
                prev.route.signalPass(request);
                // prev.route.fireEvent('pass', request);
            }
        }

        return this;
    },

    _didSwitch: function(route, matchedRoutes){
        var i = 0, matched;

        while (matched = matchedRoutes[i++]) {
            // only dispatch switched if it is going to a different route
            if (matched.route === route) {
                return false;
            }
        }

        return true;
    },

    _getMatchedRoutes : function (request) {
        var res = [],
            n = this.length,
            route;

        //should be decrement loop since higher priorities are added at the end of array
        while (route = this.get(--n)) {
            if ((!res.length || this.options.greedy || route.get('greedy')) && route.match(request)) {
                res.push({
                    route : route,
                    params : route.parse(request)
                });
            }
            if (!this.options.greedyEnabled && res.length) {
                break;
            }
        }

        return res;
    }
});

Router.NORM_AS_ARRAY = function(req, vals){
    return [vals.vals_];
};

Router.NORM_AS_OBJECT = function(req, vals){
    return [vals];
};

Router.implement(
    signalFactory(['match', 'default'])
);

exports.Router = Router;