ig.module(
        'plusplus.core.hierarchy'
    )
    .requires(
        'plusplus.helpers.utils'
    )
    .defines(function () {
        "use strict";

        var _ut = ig.utils;

        var count = 0;

        /**
         * Hierarchy structure using ancestor/descendant instead of child/parent.
         * <br>- child/parent is avoided due to Impact's class using parent to reference prototype functions.
         * @class
         * @extends ig.Class
         * @memberof ig
         * @author Collin Hover - collinhover.com
         **/
        ig.Hierarchy = ig.Class.extend(/**@lends ig.Hierarchy.prototype */{

            /**
             * Unique instance id.
             * @type String
             */
            id: count++,

            /**
             * Unique instance name.
             * <br>- usually names are used to map instances for faster searching.
             * @type String
             */
            name: '',

            /**
             * List of descendants.
             * @type Array
             */
            descendants: [],

            /**
             * Map of descendants.
             * @type Object
             */
            descendantsMap: {},

            /**
             * Ancestor hierarchy.
             * @type Object
             * @default
             */
            ancestor: null,

            /**
             * Initializes hierarchy.
             * @param {Object} [settings] settings object.
             **/
            init: function (settings) {

                this.id = count++;

                ig.merge(this, settings);

            },

            /**
             * Sets the ancestor of this.
             * @param {ig.Hierarchy} ancestor hierarchy object.
             **/
            setAncestor: function (ancestor) {

                this.ancestor = ancestor;

            },

            /**
             * Sets the name of this and remaps this within ancestor for quick by-name lookups.
             * @param {String} name name of this.
             **/
            setName: function (name) {

                if (this.name !== name) {

                    if (this.ancestor instanceof ig.Hierarchy) {

                        this.ancestor.unmapDescendant(this);

                    }

                    this.name = name;

                    if (this.ancestor instanceof ig.Hierarchy) {

                        this.ancestor.mapDescendant(this);

                    }

                }

            },

            /**
             * Sets the fallback hierarchy of this for when a lookup by name is done and nothing found.
             * @param {ig.Hierarchy} [fallback] hierarchy object.
             **/
            setFallback: function (fallback) {

                this.fallback = fallback;

            },

            /**
             * Adds one or more descendants.
             * @param {ig.Hierarchy|Array} adding object or array of objects.
             **/
            addDescendants: function (adding) {

                adding = _ut.toArray(adding);

                for (var i = 0, il = adding.length; i < il; i++) {

                    this.addDescendant(adding[ i ]);

                }

            },

            /**
             * Adds a descendant.
             * @param {*} adding descendant object.
             **/
            addDescendant: function (adding) {

                // handle hierarchy objects specially

                if (adding instanceof ig.Hierarchy) {

                    // don't allow circular hierarchy

                    if (this.isAncestor(adding) === true) {

                        return;

                    }

                    // remove from previous hierarchy

                    if (adding.ancestor !== undefined) {

                        adding.ancestor.removeDescendant(adding);

                    }

                    adding.setAncestor(this);

                }

                this.mapDescendant(adding);
                this.descendants.push(adding);

            },

            /**
             * Removes one or more descendants.
             * @param {*|Array} removing descendant object or array of objects.
             **/
            removeDescendants: function (removing) {

                removing = _ut.toArray(removing);

                for (var i = 0, il = removing.length; i < il; i++) {

                    this.removeDescendant(removing[ i ]);

                }

            },

            /**
             * Removes a descendant.
             * @param {*} removing descendant object.
             **/
            removeDescendant: function (removing) {

                var index = _ut.indexOfValue(this.descendants, removing);

                if (index !== -1) {

                    // handle hierarchy objects specially

                    if (removing instanceof ig.Hierarchy) {

                        removing.setAncestor();

                    }

                    this.descendants.splice(index, 1);
                    this.unmapDescendant(removing);

                }
                else {

                    for (var i = 0, il = this.descendants.length; i < il; i++) {

                        var descendant = this.descendants[ i ]

                        if (descendant instanceof ig.Hierarchy) {

                            descendant.removeDescendant(removing);

                        }

                    }

                }

            },

            /**
             * Removes all descendants.
             **/
            clearDescendants: function () {

                for (var i = this.descendants.length - 1; i >= 0; i--) {

                    var descendant = this.descendants[ i ];

                    if (descendant instanceof ig.Hierarchy) {

                        descendant.setAncestor();

                    }

                    this.descendants.length--;
                    this.unmapDescendant(descendant);

                }

            },

            /**
             * Maps a descendant by name for faster lookups.
             * @param {*} descendant descendant object.
             **/
            mapDescendant: function (descendant) {

                if (descendant.name) {

                    var existing = this.descendantsMap[ descendant.name ];

                    if (existing instanceof ig.Hierarchy) {

                        existing.ancestor.removeDescendant(existing);

                    }

                    this.descendantsMap[ descendant.name ] = descendant;

                }

            },

            /**
             * Unmaps a descendant by name.
             * @param {*} descendant descendant object.
             **/
            unmapDescendant: function (descendant) {

                if (descendant.name) {

                    var mapped = this.descendantsMap[ descendant.name ];

                    if (descendant === mapped) {

                        delete this.descendantsMap[ descendant.name ];

                    }

                }

            },

            /**
             * Searches for a descendant by name and, optionally, searches recursively.
             * @param {String} name name of descendant.
             * @param {Boolean} [recursive] search recursively.
             * @returns {*} descendant if found.
             **/
            getDescendantByName: function (name, recursive) {

                var named = this._getDescendantByName(name, recursive);

                if (!named && this.fallback) {

                    named = this.fallback._getDescendantByName(name, recursive);

                }

                return named;

            },

            /**
             * Internal search by name method.
             * @param {String} name name of descendant.
             * @param {Boolean} [recursive] search recursively.
             * @returns {*} descendant if found.
             * @private
             **/
            _getDescendantByName: function (name, recursive) {

                var named = this.descendantsMap[ name ];

                if (recursive === true && !named) {

                    for (var i = 0, il = this.descendants.length; i < il; i++) {

                        var descendant = this.descendants[ i ];

                        if (descendant instanceof ig.Hierarchy) {

                            named = descendant.getDescendantByName(name, recursive);

                            if (named) {

                                break;

                            }

                        }

                    }

                }

                return named;

            },

            /**
             * Searches for descendants by type and, optionally, searches recursively.
             * @param {Number} type type of descendant.
             * @param {Boolean} [recursive] search recursively.
             * @returns {Array} descendants if found.
             **/
            getDescendantsByType: function (type, recursive) {

                var matching = this._getDescendantsByType(type, recursive, []);

                if (!matching.length && this.fallback) {

                    matching = this.fallback._getDescendantsByType(type, recursive, matching);

                }

                return matching;

            },

            /**
             * Internal search by type method.
             * @param {Number} type type of descendant.
             * @param {Boolean} [recursive] search recursively.
             * @param {Array} matching list of matching descendants, passed automatically by getDescendantByType.
             * @returns {Array} descendants if found.
             * @private
             **/
            _getDescendantsByType: function (type, recursive, matching) {

                for (var i = 0, il = this.descendants.length; i < il; i++) {

                    var descendant = this.descendants[ i ];

                    // descendant matches type

                    if (descendant.type & type) {

                        matching.push(descendant);

                    }

                    // search recursively

                    if (recursive === true && descendant instanceof ig.Hierarchy) {

                        descendant._getDescendantsByType(name, recursive, matching);

                    }

                }

                return matching;

            },

            /**
             * Gets all descendants from here to last descendant.
             * @param {String} [array] list of descendants already found.
             * @returns {Array} array of all descendants.
             **/
            getDescendants: function (array) {

                array = _ut.toArray(array).concat(this.descendants);

                for (var i = 0, il = this.descendants.length; i < il; i++) {

                    var descendant = this.descendants[ i ];

                    if (descendant instanceof ig.Hierarchy) {

                        array = descendant.getDescendants(array);

                    }

                }

                return array;

            },

            /**
             * Gets root ancestor.
             * @returns {ig.Hierarchy} root if found.
             **/
            getRoot: function () {

                var ancestor = this;
                var root;

                while (ancestor) {

                    root = ancestor;
                    ancestor = ancestor.ancestor;

                }

                return root;

            },

            /**
             * Gets if a target is an ancestor.
             * @param {ig.Hierarchy} target hierarchy object.
             * @returns {Boolean} true if ancestors, false if not.
             **/
            isAncestor: function (target) {

                var ancestor = this.ancestor;

                while (ancestor) {

                    if (ancestor === target) {

                        return true;

                    }

                    ancestor = ancestor.ancestor;

                }

                return false;

            },

            /**
             * Executes a function in the context of self and each descendant.
             * @param {Function} callback function.
             **/
            forAll: function (callback) {

                var args = Array.prototype.slice.call(arguments, 1);

                callback.apply(this, args);

                this.forAllDescendants.apply(this, arguments);

            },

            /**
             * Executes a function in the context of ONLY descendants.
             * @param {Function} callback function.
             **/
            forAllDescendants: function (callback) {

                var args = Array.prototype.slice.call(arguments, 1);

                for (var i = 0, il = this.descendants.length; i < il; i++) {

                    var descendant = this.descendants[ i ];

                    callback.apply(descendant, args);

                    if (descendant instanceof ig.Hierarchy) {

                        descendant.forAllDescendants.apply(descendant, arguments);

                    }

                }

            },

            /**
             * Executes a function in the context of this and each descendant that has a function with a matching name.
             * @param {String} callbackName callback function name.
             **/
            forAllWithCallback: function (callbackName) {

                var callback = this[ callbackName ];

                if (typeof callback === 'function') {

                    var args = Array.prototype.slice.call(arguments, 1);
                    callback.apply(this, args);

                }

                this.forAllDescendantsWithCallback.apply(this, arguments);

            },

            /**
             * Executes a function in the context of each descendant that has a function with a matching name.
             * @param {String} callbackName callback function name.
             **/
            forAllDescendantsWithCallback: function (callbackName) {

                var args = Array.prototype.slice.call(arguments, 1);

                for (var i = 0, il = this.descendants.length; i < il; i++) {

                    var descendant = this.descendants[ i ];
                    var callback = descendant[ callbackName ];

                    if (typeof callback === 'function') {

                        callback.apply(descendant, args);

                    }

                    if (descendant instanceof ig.Hierarchy) {

                        descendant.forAllWithCallback.apply(descendant, arguments);

                    }

                }

            },

            /**
             * Executes a function in the context of each immediate descendant.
             * @param {Function} callback callback function.
             **/
            forImmediate: function (callback) {

                var args = Array.prototype.slice.call(arguments, 1);

                callback.apply(this, args);

                for (var i = 0, il = this.descendants.length; i < il; i++) {

                    callback.apply(this.descendants[ i ], args);

                }

            },

            /**
             * Executes a function in the context of each immediate descendant that has a function with a matching name.
             * @param {String} callbackName callback function name.
             **/
            forImmediateWithCallback: function (callbackName) {

                var callback = this[ callbackName ];

                if (typeof callback === 'function') {

                    var args = Array.prototype.slice.call(arguments, 1);
                    callback.apply(this, args);

                }

                for (var i = 0, il = this.descendants.length; i < il; i++) {

                    var descendant = this.descendants[ i ];

                    callback = descendant[ callbackName ];

                    if (typeof callback === 'function') {

                        callback.apply(descendant, args);

                    }

                }

            },

            /**
             * Convenience method to update all descendants that have an update.
             **/
            update: function () {

                for (var i = 0, il = this.descendants.length; i < il; i++) {

                    var descendant = this.descendants[ i ];

                    if (descendant.update) {

                        descendant.update();

                    }

                }

                // also update fallback as it is possible that fallback descendants are being used

                if (this.fallback) {

                    this.fallback.update();

                }

            },

            /**
             * Convenience method to cleanup all descendants that have a cleanup.
             **/
            cleanup: function () {

                for (var i = 0, il = this.descendants.length; i < il; i++) {

                    var descendant = this.descendants[ i ];

                    if (descendant.cleanup) {

                        descendant.cleanup();

                    }

                }

                // also cleanup fallback as it is possible that fallback descendants are being used

                if (this.fallback) {

                    this.fallback.cleanup();

                }

            },

            /**
             * Clones this hierarchy object.
             * @param {ig.Hierarchy} [c] hierarchy object to clone into.
             * @returns {ig.Hierarchy} copy of this.
             **/
            clone: function (c) {

                if (c instanceof ig.Hierarchy !== true) {

                    c = new ig.Hierarchy();

                }

                c.name = this.name;

                for (var i = 0, il = this.descendants.length; i < il; i++) {

                    var descendant = this.descendants[ i ];

                    if (typeof descendant.clone === 'function') {

                        c.addDescendant(descendant.clone());

                    }

                }

                return c;

            }

        });

    });