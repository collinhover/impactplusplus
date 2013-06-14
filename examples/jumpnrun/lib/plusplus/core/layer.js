ig.module(
        'plusplus.core.layer'
    )
    .requires(
        'plusplus.core.entity',
        'plusplus.core.background-map',
        'plusplus.entities.light',
        'plusplus.helpers.utils'
    )
    .defines(function () {

        var _ut = ig.utils;

        /**
         * Layer used to organize entities within game.
         * <br>- collision checks are handled by layer, i.e. entities cannot collide with entities on another layer.
         * <br>- pausing game happens on game, layer, and entity levels, and a layer can be set to unpausable.
         * <span class="alert"><strong>IMPORTANT:</strong> for performance, collisions are only checked when something on the layer has changed!</span>
         * @class
         * @extends ig.Class
         * @memberof ig
         * @author Collin Hover - collinhover.com
         */
        ig.Layer = ig.Class.extend(/**@lends ig.Layer.prototype */{

            /**
             * Unique instance name.
             * <br>- usually names are used to map instances for faster searching.
             * @type String
             */
            name: '',

            /**
             * Z index for sorting.
             * @type Number
             * @default
             */
            zIndex: 0,

            /**
             * Whether to clear layer on load, or should items be persistent across levels.
             * @type Boolean
             * @default
             * @example
             * // keep user interface elements across all levels
             * layerUI.clearOnLoad = false;
             */
            clearOnLoad: true,

            /**
             * Whether layer can skip update.
             * @type Boolean
             * @default
             */
            noUpdate: false,

            /**
             * Whether layer can skip draw.
             * @type Boolean
             * @default
             */
            noDraw: false,

            /**
             * Whether layer should automatically prerender background maps.
             * @type Boolean
             * @default
             */
            preRender: false,

            /**
             * List of layer items.
             * <span class="alert"><strong>IMPORTANT:</strong> items can be instances of any class, as long as they have update and draw methods.</span>
             * @type Array
             */
            items: [],

            /**
             * List of layer items that are targetable (for faster searches).
             * @type Array
             */
            itemsTargetable: [],

            /**
             * List of layer items that are interactive (for faster searches).
             * @type Array
             */
            itemsInteractive: [],

            /**
             * List of layer items that cast shadows (for faster searches).
             * @type Array
             */
            itemsOpaque: [],

            /**
             * List of layer items that are lights (for faster searches).
             * @type Array
             */
            itemsLight: [],

            /**
             * Whether to automatically sort layer.
             * @type Boolean
             * @default
             */
            autoSort: false,

            /**
             * Function to sort by, defaults to game sortBy.
             * @type Function
             */
            sortBy: false,

            /**
             * Number of items that are entities.
             * @type Number
             */
            numEntities: 0,

            /**
             * Number of items that are entities that also need collision checks.
             * @type Number
             */
            numEntitiesChecking: 0,

            /**
             * Number of items that are maps.
             * @type Number
             */
            numBackgroundMaps: 0,

            /**
             * Whether layer has been changed since last update.
             * @type Boolean
             */
            changed: true,

            /**
             * Whether layer is paused.
             * <span class="alert"><strong>IMPORTANT:</strong> does not guarantee that all items are paused or unpaused!</span>
             * @type Boolean
             */
            paused: false,

            /**
             * Whether layer cannot be paused.
             * <br>- i.e. useful for layers with UI, which should probably not be paused.
             * @type Boolean
             * @default
             */
            ignorePause: false,

            /**
             * Whether layer should be sorted on next update.
             * @type Boolean
             */
            dirtySort: false,

            // internal properties, do not modify

            _dirtyItems: false,

            /**
             * Initializes layer.
             * @param {String} name name of layer
             * @param {Object} settings settings object.
             */
            init: function (name, settings) {

                this.name = name;

                ig.merge(this, settings);

                this.reset();

            },

            /**
             * Resets layer.
             */
            reset: function () {

                this.changed = true;
                this.paused = false;
                this.dirtySort = false;

                this.sortBy = this.sortBy || ig.game.sortBy;

                if (this.clearOnLoad && this.items.length > 0) {

                    // copy items

                    var items = this.items;

                    // clear items

                    this.items = [];
                    this.itemsTargetable.length = this.itemsInteractive.length = this.itemsOpaque.length = this.itemsLight.length = 0;

                    // remove all items

                    for (var i = 0, il = items.length; i < il; i++) {

                        var item = items[ i ];

                        if ( item instanceof ig.EntityExtended ) {

                            ig.game.removeEntity( item );

                        }
                        else {

                            ig.game.removeItem( item );

                        }

                    }

                }

            },

            /**
             * Adds an item to layer immediately.
             * <span class="alert"><strong>IMPORTANT:</strong> use {@link ig.GameExtended#addItem} or, if item is an entity, {@link ig.GameExtended#spawnEntity} instead for proper deferral.</span>
             * @param {*} item item with update and draw functions.
             */
            addItem: function (item) {

                // flag items dirty

                this._dirtyItems = true;

                // add to lists

                this.items.push(item);

                if (item.targetable) {

                    this.itemsTargetable.push(item);

                }

                if (item.type & ig.EntityExtended.TYPE.INTERACTIVE) {

                    this.itemsInteractive.push(item);

                }

                if (item instanceof ig.EntityLight) {

                    this.itemsLight.push(item);

                }
                else if (item.opaque) {

                    this.itemsOpaque.push(item);

                }

                // item is an entity

                if (item instanceof ig.EntityExtended) {

                    this.numEntities++;

                    if (item.checkAgainst !== ig.EntityExtended.TYPE.NONE ||
                        item.collides !== ig.Entity.COLLIDES.NEVER) {

                        this.numEntitiesChecking++;

                    }

                }
                // item is a background map
                else if ( item instanceof ig.BackgroundMap ) {

                    this.numBackgroundMaps++;

                    if ( this.preRender ) {

                        item.preRender = true;

                    }

                }

                // auto sort

                if (this.autoSort) {

                    this.sort();

                }

            },

            /**
             * Removes an item immediately from layer.
             * <span class="alert"><strong>IMPORTANT:</strong> Use {@link ig.GameExtended#removeItem} or, if item is an entity, {@link ig.GameExtended#removeEntity} instead for proper deferral.</span>
             * @param {*} item item to be removed.
             */
            removeItem: function (item) {

                var length = this.items.length;

                if ( length > 0 ) {

                    // flag dirty items

                    this._dirtyItems = true;

                    // remove from item lists

                    _ut.arrayCautiousRemove(this.items, item);

                    // item was on layer

                    if (length !== this.items.length) {

                        if (item.targetable) {

                            _ut.arrayCautiousRemove(this.itemsTargetable, item);

                        }

                        if (item.type & ig.EntityExtended.TYPE.INTERACTIVE) {

                            _ut.arrayCautiousRemove(this.itemsInteractive, item);

                        }

                        if (item.opaque) {

                            _ut.arrayCautiousRemove(this.itemsOpaque, item);

                        }

                        if (item instanceof ig.EntityLight) {

                            _ut.arrayCautiousRemove(this.itemsLight, item);

                        }

                        // item is entity

                        if (item instanceof ig.EntityExtended) {

                            this.numEntities = Math.max(0, this.numEntities - 1);

                            if (item.checkAgainst !== ig.EntityExtended.TYPE.NONE ||
                                item.collides !== ig.Entity.COLLIDES.NEVER) {

                                this.numEntitiesChecking = Math.max(0, this.numEntitiesChecking - 1);

                            }

                        }
                        // item is a background map
                        else if ( item instanceof ig.BackgroundMap ) {

                            this.numBackgroundMaps = Math.max(0, this.numBackgroundMaps - 1);

                        }

                        if (this.autoSort) {

                            this.sort();

                        }

                    }

                }

            },

            /**
             * Pauses layer.
             **/
            pause: function () {

                if (!this.ignorePause && this.paused !== true) {

                    // layer properties

                    this.paused = true;

                    // items

                    var items = this.items;

                    for (var i = 0, il = items.length; i < il; i++) {

                        var item = items[ i ];

                        if (item.pause) {

                            item.pause();

                        }

                    }

                }

            },

            /**
             * Unpauses layer.
             **/
            unpause: function () {

                if (this.paused !== false) {

                    this.paused = false;

                    // items

                    var items = this.items;

                    for (var i = 0, il = items.length; i < il; i++) {

                        var item = items[ i ];

                        if (item.unpause) {

                            item.unpause();

                        }

                    }

                }

            },

            /**
             * Flags layer for item sorting.
             */
            sort: function () {

                this.dirtySort = true;

            },

            /**
             * Updates layer and all items.
             */
            update: function () {

                this.changed = this.changedLights = false;

                // deferred sort

                if (this.dirtySort) {

                    this.items.sort(this.sortBy);
                    this.dirtySort = false;

                }

                // has items

                if (!this.noUpdate && this.items.length > 0) {

                    if (this._dirtyItems) {

                        this.changed = true;
                        this._dirtyItems = false;

                    }

                    // update items

                    for (var i = 0, il = this.items.length; i < il; i++) {

                        var item = this.items[ i ];

                        // always do update to let item handle pause state

                        item.update();

                        // but only check for changes when item is unpaused

                        if (!item.paused) {

                            // item was changed during update or is checking

                            if (item.changed || item.checking) {

                                // layer changed

                                this.changed = true;

                                if (item instanceof ig.EntityLight) {

                                    this.changedLights = true;

                                }

                            }

                        }

                    }

                    // entity specific items

                    if (this.numEntities) {

                        // check this entities for collisions if this has been changed

                        if (this.numEntitiesChecking && this.changed) {

                            // temporarily swap entities with this layer's items
                            // checks should only be between this layer's items

                            var entities = ig.game.entities;
                            ig.game.entities = this.items;

                            ig.game.checkEntities();

                            ig.game.entities = entities;

                        }

                    }

                }

            },

            /**
             * Draws layer.
             */
            draw: function () {

                if (!this.noDraw && this.items.length > 0) {

                    for (var i = 0, il = this.items.length; i < il; i++) {

                        this.items[ i ].draw();

                    }

                }

            }

        });

    });