ig.module(
        'plusplus.helpers.utils'
    )
    .requires(
        'plusplus.helpers.shims',
        'plusplus.core.config'
    )
    .defines(function () {
        "use strict";

        var _g = ig.global;
        var _c = ig.CONFIG;

        /**
         * Static utilities for general use.
         * @memberof ig
         * @namespace ig.utils
         * @author Collin Hover - collinhover.com
         **/
        ig.utils = {};

        /**
         * Finds javascript type of object, slower than typeof or instanceof but sometimes necessary.
         * @param {*} o target object
         * @returns {String} Type of object
         */
        ig.utils.type = function (o) {
            return o == null ? o + '' : Object.prototype.toString.call(o).slice(8, -1).toLowerCase();
        };

        /**
         * Checks if target is number.
         * @param {Number} n number
         * @returns {Boolean} true if number, false if not
         */
        ig.utils.isNumber = function (n) {
            return !isNaN(n) && isFinite(n) && typeof n !== 'boolean';
        };

        /**
         * Checks if target is array.
         * @param {*} target target object
         * @returns {Boolean} true if array, false if not
         **/
        ig.utils.isArray = function (target) {
            return Object.prototype.toString.call(target) === '[object Array]';
        };

        /**
         * Ensures an object is an array.
         * @param {*} target target object
         * @returns {Array} Array
         **/
        ig.utils.toArray = function (target) {

            return target ? ( ig.utils.isArray(target) !== true ? [ target ] : target ) : [];

        };

        /**
         * Ensures an object is not an array.
         * @param {*} target target object
         * @param {Number} [index=0] index of array to use if target is an array.
         * @returns {*} item at index of array
         **/
        ig.utils.toNotArray = function (target, index) {

            return ig.utils.isArray(target) === true ? target[ index || 0 ] : target;

        };

        /**
         * Add element to target array only if not already in array.
         * <span class="alert"><strong>IMPORTANT:</strong> this modifies the array in place.</span>
         * @param {Array} target Target array
         * @param {*} element Single value to add
         * @returns {Array} Array containing elements
         **/
        ig.utils.arrayCautiousAdd = function (target, element) {

            var index = ig.utils.indexOfValue(target, element);

            if (index === -1) {

                target.push(element);

            }

            return target;

        };

        /**
         * Add elements to target array only if not already in array.
         * <span class="alert"><strong>IMPORTANT:</strong> this modifies the array in place.</span>
         * @param {Array} target Target array
         * @param {*} elements Single object or array of values to add
         * @returns {Array} Array containing elements
         **/
        ig.utils.arrayCautiousAddMulti = function (target, elements) {

            var element, index;

            elements = ig.utils.toArray(elements);

            // for each element

            for (var i = 0, il = elements.length; i < il; i++) {

                element = elements[ i ];

                if (element !== target) {

                    index = ig.utils.indexOfValue(target, element);

                    if (index === -1) {

                        target.push(element);

                    }

                }

            }

            return target;

        };

        /**
         * Removes element from target array.
         * <span class="alert"><strong>IMPORTANT:</strong> this modifies the array in place.</span>
         * @param {Array} target Target array
         * @param {*} element Single value to remove
         * @returns {Array} Array containing elements
         **/
        ig.utils.arrayCautiousRemove = function (target, element) {

            var index = ig.utils.indexOfValue(target, element);

            if (index !== -1) {

                target.splice(index, 1);

            }

            return target;

        };

        /**
         * Removes elements from target array.
         * <span class="alert"><strong>IMPORTANT:</strong> this modifies the array in place.</span>
         * @param {Array} target Target array
         * @param {*} elements Single object or array of values to remove
         * @returns {Array} Array containing elements
         **/
        ig.utils.arrayCautiousRemoveMulti = function (target, elements) {

            var element, index;

            elements = ig.utils.toArray(elements);

            // for each element

            for (var i = 0, il = elements.length; i < il; i++) {

                element = elements[ i ];

                if (element !== target) {

                    index = ig.utils.indexOfValue(target, element);

                    if (index !== -1) {

                        target.splice(index, 1);

                    }

                }

            }

            return target;

        };

        /**
         * Executes a callback on each item in an array, in the context of that item.
         * @param {Array} array Array to iterate over
         * @param {Callback} callback Callback to call
         * @param {Array} args Arguments to pass
         **/
        ig.utils.forEach = function (array, callback, args) {

            for (var i = 0, il = array.length; i < il; i++) {

                callback.apply(array[ i ], args);

            }

        };

        /**
         * Find the index of value in an array.
         * <span class="alert alert-info"><strong>Tip:</strong> in some cases, this may be faster than the native indexOf.</span>
         * @param {Array} array Array to search
         * @param {*} value Value of property to match
         * @returns {Number} >= 0 if found, -1 if not
         **/
        ig.utils.indexOfValue = function (array, value) {

            for (var i = 0, il = array.length; i < il; i++) {

                if (value === array[ i ]) {

                    return i;

                }

            }

            return -1;

        };

        /**
         * Find the index of an object in an array with property = value.
         * @param {Array} array Array to search
         * @param {String} property Property name
         * @param {*} value Value of property to match
         * @returns {Number} >= 0 if found, -1 if not
         **/
        ig.utils.indexOfProperty = function (array, property, value) {

            for (var i = 0, il = array.length; i < il; i++) {

                if (value === array[ i ][ property ]) {

                    return i;

                }

            }

            return -1;

        };

        /**
         * Find the index of an object in an array matching all property values.
         * @param {Array} array Array to search.
         * @param {Array} properties Property names.
         * @param {Array} values Values to match.
         * @returns {Number} >= 0 if found, -1 if not
         **/
        ig.utils.indexOfProperties = function (array, properties, values) {

            for (var i = 0, il = array.length; i < il; i++) {

                var obj = array[ i ];
                var missing = false;

                for (var j = 0, jl = properties.length; j < jl; j++) {

                    if (values[ j ] !== obj[ properties[ j ] ]) {

                        missing = true;
                        break;

                    }

                }

                if (missing !== true) {

                    return i;

                }

            }

            return -1;

        };

        /**
         * Throttle a function to execute no more than once per delay (its like a cooldown), based on Ben Alman's jQuery Throttle / Debounce.
         * @param {Function} callback Callback function
         * @param {Number} [delay] Delay in ms
         * @param {Boolean} [trailing] Whether to allow a trailing execution
         * @returns {Function} Throttled function.
         * @see ig.CONFIG.DURATION_THROTTLE
         **/
        ig.utils.throttle = function (callback, delay, trailing) {

            var timeoutId;
            var timeLast = 0;

            if (ig.utils.isNumber(delay) !== true) {

                delay = _c.DURATION_THROTTLE;

            }

            function throttled() {

                var me = this;
                var elapsed = Date.now() - timeLast;
                var args = arguments;

                function execute() {

                    timeLast = Date.now();
                    callback.apply(me, args);

                }

                if (elapsed > delay) {

                    timeoutId && _g.clearTimeout(timeoutId);

                    execute();

                }
                else if (trailing !== false) {

                    timeoutId && _g.clearTimeout(timeoutId);

                    timeoutId = _g.setTimeout(execute, delay - elapsed);

                }

            }

            return throttled;

        };

        /**
         * Debounce a function to execute only once delay reached between subsequent calls, based on Ben Alman's jQuery Throttle / Debounce.
         * @param {Function} callback Callback function
         * @param {Number} [delay] Delay in ms
         * @returns {Function} Debounced function.
         **/
        ig.utils.debounce = function (callback, delay) {

            var timeoutId;

            if (ig.utils.isNumber(delay) !== true) {

                delay = _c.DURATION_THROTTLE;

            }

            function debounced() {

                var me = this;
                var args = arguments;

                timeoutId && _g.clearTimeout(timeoutId);

                timeoutId = _g.setTimeout(function () {

                    callback.apply(me, args);

                }, delay);

            }

            return debounced;

        };

        // max value for type flags

        var MAX_TYPE = Math.pow( 2, 32 );

        /**
         * Gets a type flag by space separated names, and if does not exists, creates it.  In ImpactJS, there are 3 default types: A, B, and BOTH. This system allows you to build up to 32 types for much finer control over type, checkAgainst, and group. If you don't understand bitflags, a quick google search will be very helpful!
         * <br>- currently, Impact++ uses around 10 types/flags (see example)
         * <br>- to avoid poor performance, only use this when initializing an entity
         * <span class="alert alert-danger"><strong>IMPORTANT:</strong> maxes out at 32 types/flags due to the way Javascript handles bitwise operations.</span>
         * @param {Class} classObject class / object to record types in.
         * @param {String} names space separated names to create type for.
         * @param {String} [typeListName] list name to store types in, defaults to TYPE.
         * @see ig.utils.addType
         **/
        ig.utils.getType = function (classObject, names, typeListName) {

            typeListName = typeListName || 'TYPE';

            var types = classObject[ typeListName ];
            var typeLastName = typeListName + "_LAST";
            var type;

            // setup types

            if (!classObject[ typeLastName ] || !types) {

                classObject[ typeLastName ] = 1;
                types = classObject[ typeListName ] = {};

            }

            // get type

            names = names.toUpperCase();
            type = types[ names ];

            // create type

            if (!type) {

                type = 0;

                var typeLast = classObject[ typeLastName ];
                var namesList = names.split(" ");

                for (var i = 0, il = namesList.length; i < il; i++) {

                    var name = namesList[ i ];
                    var typeNext = types[ name ];

                    if (!typeNext) {

                        if ( typeLast >= MAX_TYPE ) {
                            throw new TypeError('Bitwise flag out of range / above 32 bits!');
                        }

                        // these types are bitwise flags
                        // multiply last type by 2 each time to avoid false positives

                        typeNext = types[ name ] = typeLast;
                        classObject[ typeLastName ] = typeLast * 2;

                    }

                    // add to total type

                    type |= typeNext;

                }

                // lets not recalculate that again

                types[ names ] = type;

            }

            return type;

        };

        /**
         * Adds space separated type flags by name to a property of an entity. In ImpactJS, there are 3 default types: A, B, and BOTH. This system allows you to build up to 32 types for much finer control over type, checkAgainst, and group. If you don't understand bitflags, a quick google search will be very helpful!
         * <br>- currently, Impact++ uses around 10 types/flags (see example)
         * <br>- to avoid poor performance, only use this when initializing an entity
         * <span class="alert alert-danger"><strong>IMPORTANT:</strong> maxes out at 32 types/flags due to the way Javascript handles bitwise operations.</span>
         * @param {Class} classObject class object to record types in.
         * @param {ig.EntityExtended} entity entity to add types to.
         * @param {String} property property name within entity to add types to.
         * @param {String} names space separated names to create type for.
         * @param {String} [typeListName] list name to store types in, defaults to TYPE.
         * @example
         * // spawn an entity
         * var entity = ig.game.spawnEntity( ig.EntityExtended, 0, 0, { ...settings...} );
         * // add a type to our new entity
         * // this type system defaults to using TYPE as the namespace to record unique types
         * ig.utils.addType( ig.EntityExtended, entity, "type", "TYPE_NAME" );
         * // when we need to do dynamic checks for that type
         * // refer to it directly using the TYPE namespace
         * ig.EntityExtended.TYPE.TYPE_NAME
         * // and a check against the type of our new entity will return truthy
         * entity.type & ig.EntityExtended.TYPE.TYPE_NAME
         * // we can also add a GROUP type to our new entity
         * // note the last argument, we're using the GROUP namespace
         * // this is because group types should be different from TYPE types
         * ig.utils.addType( ig.EntityExtended, entity, "group", "GROUP_NAME", "GROUP" );
         * // refer to it directly using the GROUP namespace
         * ig.EntityExtended.GROUP.GROUP_NAME
         * // remember, types and groups can be added together to make combinations!
         * ig.utils.addType( ig.EntityExtended, entity, "type", "TYPE_1" );
         * ig.utils.addType( ig.EntityExtended, entity, "type", "TYPE_2" );
         * ig.utils.addType( ig.EntityExtended, entity, "type", "TYPE_3" );
         * // and we can still check for any one or more of those types easily
         * entity.type & ig.EntityExtended.TYPE.TYPE_1 === truthy
         * entity.type & ( ig.EntityExtended.TYPE.TYPE_1 | ig.EntityExtended.TYPE.TYPE_2 ) === truthy
         * entity.type & ig.EntityExtended.TYPE.TYPE_4 === falsy
         **/
        ig.utils.addType = function (classObject, entity, property, names, typeListName) {

            entity[ property ] |= ig.utils.getType(classObject, names, typeListName);

        };


    });