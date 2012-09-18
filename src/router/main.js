/**
 * A router ported from Crossroads.js by Miller Medeiros (https://github.com/millermedeiros/crossroads.js)
 * date - Jul 29, 2012
 * crossroads.js commit - 3b413b0b506b0c04f80b03194d4c1abaeccc9574
 * @type {Class}
 */
var Collection = require('../collection/main').Collection,
    Model = require('../model/main').Model,
    Route = require('./route').Route;

var Router = new Class({
    Extends: Collection,

    options: {
        Model: Route,
        modelOptions: {
            defaults: {
                typecast: false,
                normalizer: null
            }
        },
        greedy: false,
        greedyEnabled: true
    },

    _prevRoutes: [],

    _prevMatchedRequest: null,

    _prevBypassedRequest: null,

    _add: function(model, at){
        var isInstance = instanceOf(model, Model),
            priority = isInstance ? model.get('priority') : model.priority;

        /*
        Order priority. 
        Numbers > 0 should go before 0 (which means turning it into a negative)
        Numbers < 0 should go after 0 (which means turning it into a positive)
         */
        if (at == void 0 && priority != void 0){
            at = (priority) * -1;
        }
        

        this.parent(model, at);

        return this;
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
                    cur.route.fireEvent('match', defaultArgs.concat(cur.params));
                    cur.isFirst = !i;
                    this.fireEvent('match', defaultArgs.concat([request, cur]));
                    i += 1;
                }
            } else {
                this._prevBypassedRequest = request;
                this.fireEvent('default', defaultArgs.concat([request]));
            }
        }

        return this;
    },

    _notifyPrevRoutes: function(matchedRoutes, request){
        var i = 0, prev;
        
        while (prev = this._prevRoutes[i++]) {
            //check if switched exist since route may be disposed
            if (/*prev.route.switched && */this._didSwitch(prev.route, matchedRoutes)) {
                prev.route.fireEvent('pass', request);
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
            i = 0,
            route;

        //should be decrement loop since higher priorities are added at the end of array
        while (n--) {
            route = this.get(i++);
            if ((!res.length || this.options.greedy || route.get('greedy')) && route.match(request)) {
                res.push({
                    route : route,
                    params : route._getParamsArray(request)
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

exports.Router = Router;