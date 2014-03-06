ig.module(
    'plusplus.core.layer'
)
    .requires(
        'plusplus.core.config',
        'plusplus.core.entity',
        'plusplus.core.background-map',
        'plusplus.entities.light',
        'plusplus.helpers.utils'
)
    .defines(function() {

        var _c = ig.CONFIG;
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
        ig.Layer = ig.Class.extend( /**@lends ig.Layer.prototype */ {

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
            preRender: _c.PRERENDER_MAPS,

            /**
             * List of layer items.
             * <span class="alert"><strong>IMPORTANT:</strong> items can be instances of any class, as long as they have update and draw methods.</span>
             * @type Array
             */
            items: [],

            /**
             * List of items that are targetable.
             * @type Array
             */
            itemsTargetable: [],

            /**
             * List of items that are interactive.
             * @type Array
             */
            itemsInteractive: [],

            /**
             * List of items that cast shadows.
             * @type Array
             */
            itemsOpaque: [],

            /**
             * List of items that are lights.
             * @type Array
             */
            itemsLight: [],

            /**
             * List of items that need checks.
             * @type Array
             */
            itemsChecking: [],

            /**
             * Spatial hash of all checking items.
             * @type Object
             */
            spatialHash: {},

            /**
             * Spatial hash cell size.
             * @type Number
             * @default
             */
            spatialHashCellSize: 64,

            /**
             * Whether to automatically sort layer.
             * @type Boolean
             * @default
             */
            autoSort: _c.AUTO_SORT_LAYERS,

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
             * Number of items that are maps.
             * @type Number
             */
            numBackgroundMaps: 0,

            /**
             * Whether layer has been changed since last update.
             * @type Boolean
             * @readonly
             */
            changed: true,

            /**
             * Whether layer is paused.
             * <span class="alert"><strong>IMPORTANT:</strong> does not guarantee that all items are paused or unpaused!</span>
             * @type Boolean
             * @readonly
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
             * @readonly
             */
            _dirtySort: false,

            // internal properties, do not modify

            _dirtyItems: false,
            _itemsToAdd: [],

            /**
             * Initializes layer.
             * @param {String} name name of layer
             * @param {Object} settings settings object.
             */
            init: function(name, settings) {

                this.name = name;

                ig.merge(this, settings);

                this.reset();

            },

            /**
             * Resets layer.
             */
            reset: function() {

                this.changed = true;
                this.paused = false;
                this._dirtySort = false;

                this.sortBy = this.sortBy || ig.game.sortBy;

                if (this.items.length > 0) {

                    // store items

                    var items = this.items;
                    var item;
                    var i, il;

                    // store current items for add on next ready

                    if (!this.clearOnLoad) {

                        this._itemsToAdd = this.items.slice(0);

                        // FIXME: (hacky, needs to be more modular) check each for linked to

                        for (i = 0, il = this._itemsToAdd.length; i < il; i++) {

                            item = this._itemsToAdd[i];

                            if (item.linkedTo) {

                                item._wasLinkedTo = item.linkedTo;

                            }

                        }

                    }

                    // remove all items

                    this.items = [];
                    this.itemsTargetable.length = this.itemsInteractive.length = this.itemsOpaque.length = this.itemsLight.length = this.itemsChecking.length = this.numBackgroundMaps = this.numEntities = 0;

                    for (i = 0, il = items.length; i < il; i++) {

                        item = items[i];

                        if (item instanceof ig.EntityExtended) {

                            ig.game.removeEntity(item);

                        } else {

                            ig.game.removeItem(item);

                        }

                    }

                }

            },

            /**
             * Sets layer as ready.
             */
            ready: function() {

                var i, il;
                var item;

                if (this._itemsToAdd.length > 0) {

                    for (i = 0, il = this._itemsToAdd.length; i < il; i++) {

                        item = this._itemsToAdd[i];

                        if (item._wasLinkedTo) {

                            ig.game.spawnEntity(item, item.pos.x, item.pos.y, {
                                linkedTo: item._wasLinkedTo
                            });
                            delete item._wasLinkedTo;

                        } else {

                            ig.game.spawnEntity(item, item.pos.x, item.pos.y, (item._wasLinkedTo ? {
                                linkedTo: item._wasLinkedTo
                            } : undefined));

                        }

                    }

                    this._itemsToAdd.length = 0;

                }

                if (this.items.length > 0) {

                    // do sort once on ready

                    this.items.sort(this.sortBy);

                    // merge all prerendered maps into a single map
                    // when using more than 1 map, this improves performance greatly

                    if (this.preRender && this.numBackgroundMaps > 1) {

                        var mergers = [];
                        var merger;
                        var lastDistance;

                        for (i = 0, il = this.items.length; i < il; i++) {

                            item = this.items[i];

                            if (item instanceof ig.BackgroundMap) {

                                // map must be prerendered but not repeated

                                if (item.preRender && !item.repeat) {

                                    // We must start a new merger here if the last distance is not the same as the current distance or if there wasn't a merger before.
                                    if (item.distance !== lastDistance || !merger) {

                                        merger = [];

                                    }

                                    merger.push(item);

                                }
                                // when a map is not prerendered
                                // break merger and add to list of mergers
                                // so that correct rendering order is preserved
                                else if (merger && merger.length > 1) {

                                    mergers.push(merger);
                                    merger = undefined;

                                }

                                lastDistance = item.distance;

                            }

                        }

                        // add last merger to list of mergers

                        if (merger && merger.length > 1) {

                            mergers.push(merger);

                        }

                        // merge each list of maps into the first of the list

                        for (i = 0, il = mergers.length; i < il; i++) {

                            merger = mergers[i];

                            var map = merger[0];

                            // map must be extended background map

                            if (!(map instanceof ig.BackgroundMapExtended)) {

                                map = merger[0] = new ig.BackgroundMapExtended(map.tilesize, map.data, map.tilesetName);

                            }

                            for (var j = 1, jl = merger.length; j < jl; j++) {

                                item = merger[j];

                                if (map.merge(item)) {

                                    // remove item from layer as it is no longer needed

                                    this.removeItem(item);

                                }

                            }

                        }

                    }

                    // set all items adding

                    for (i = 0, il = this.items.length; i < il; i++) {

                        item = this.items[i];

                        if (item.adding) {

                            item.adding();

                        }

                    }

                }

            },

            /**
             * Adds an item to layer immediately.
             * <span class="alert"><strong>IMPORTANT:</strong> use {@link ig.GameExtended#addItem} or, if item is an entity, {@link ig.GameExtended#spawnEntity} instead for proper deferral.</span>
             * @param {*} item item with update and draw functions.
             */
            addItem: function(item) {

                // flag items dirty

                this._dirtyItems = true;

                // add to lists

                this.items.push(item);

                // item is not high performance

                if (item.highPerformance) {

                    this._addEntity(item);

                } else {

                    if (item.targetable) {

                        this.itemsTargetable.push(item);

                    }

                    if (item.type & ig.EntityExtended.TYPE.INTERACTIVE) {

                        this.itemsInteractive.push(item);

                    }

                    if (item instanceof ig.EntityLight) {

                        this.itemsLight.push(item);

                    } else if (item.opaque) {

                        this.itemsOpaque.push(item);

                    }

                    // item is an entity

                    if (item instanceof ig.EntityExtended) {

                        this._addEntity(item);

                    }
                    // item is a background map
                    else if (item instanceof ig.BackgroundMap) {

                        this.numBackgroundMaps++;

                        if (this.preRender) {

                            item.preRender = true;

                        }

                    }

                    // auto sort

                    if (this.autoSort) {

                        this.sort();

                    }

                }

            },

            /**
             * Removes an item immediately from layer.
             * <span class="alert"><strong>IMPORTANT:</strong> Use {@link ig.GameExtended#removeItem} or, if item is an entity, {@link ig.GameExtended#removeEntity} instead for proper deferral.</span>
             * @param {*} item item to be removed.
             */
            removeItem: function(item) {

                var length = this.items.length;

                if (length > 0) {

                    // flag dirty items

                    this._dirtyItems = true;

                    // remove from item lists

                    _ut.arrayCautiousRemove(this.items, item);

                    // item was on layer and is not high performance

                    if (length !== this.items.length) {

                        if (item.highPerformance) {

                            this._removeEntity(item);

                        } else {

                            // some remove checks we need to be conservative about
                            // in case the original property value has changed since we first added the item

                            _ut.arrayCautiousRemove(this.itemsInteractive, item);
                            _ut.arrayCautiousRemove(this.itemsTargetable, item);
                            _ut.arrayCautiousRemove(this.itemsOpaque, item);

                            // we can take shortcuts with the instance check, as it will never change

                            if (item instanceof ig.EntityLight) {

                                _ut.arrayCautiousRemove(this.itemsLight, item);

                            }

                            if (item instanceof ig.EntityExtended) {

                                this._removeEntity(item);

                            }
                            // item is a background map
                            else if (item instanceof ig.BackgroundMap) {

                                this.numBackgroundMaps = Math.max(0, this.numBackgroundMaps - 1);

                            }

                            if (this.autoSort) {

                                this.sort();

                            }

                        }

                    }

                }

            },

            /**
             * Adds an entity to the layer. Do not call this method, use {@link ig.Layer#addItem} instead.
             * @private
             */
            _addEntity: function(item) {

                this.numEntities++;

                if (
                    item.type !== ig.Entity.TYPE.NONE || item.checkAgainst !== ig.EntityExtended.TYPE.NONE || item.collides !== ig.EntityExtended.COLLIDES.NEVER || item.collidesChanges
                ) {

                    this.itemsChecking.push(item);

                }

            },

            /**
             * Removes an entity from layer. Do not call this method, use {@link ig.Layer#removeItem} instead.
             * @private
             */
            _removeEntity: function(item) {

                this.numEntities = Math.max(0, this.numEntities - 1);
                var numEntitiesChecking = this.itemsChecking.length;

                _ut.arrayCautiousRemove(this.itemsChecking, item);

                if (this.itemsChecking.length !== numEntitiesChecking && this.itemsChecking.length === 0) {

                    this.spatialHash = {};

                }

            },

            /**
             * Pauses layer.
             **/
            pause: function() {

                if (!this.ignorePause) {

                    // layer properties

                    this.paused = true;

                    // items

                    var items = this.items;

                    for (var i = 0, il = items.length; i < il; i++) {

                        var item = items[i];

                        if (item.pause) {

                            item.pause();

                        }

                    }

                }

            },

            /**
             * Unpauses layer.
             **/
            unpause: function() {

                this.paused = false;

                // items

                var items = this.items;

                for (var i = 0, il = items.length; i < il; i++) {

                    var item = items[i];

                    if (item.unpause) {

                        item.unpause();

                    }

                }

            },

            /**
             * Flags layer for item sorting.
             */
            sort: function() {

                this._dirtySort = true;

            },

            /**
             * Updates layer and all items.
             */
            update: function() {

                var i, il;
                var item;

                this.changed = this.changedLights = false;

                // deferred sort

                if (this._dirtySort) {

                    this.items.sort(this.sortBy);
                    this._dirtySort = false;

                }

                // has items

                if (!this.noUpdate && this.items.length > 0) {

                    if (this._dirtyItems) {

                        this.changed = true;
                        this._dirtyItems = false;

                    }

                    // update items

                    for (i = 0, il = this.items.length; i < il; i++) {

                        item = this.items[i];

                        // always do update to let item handle pause state

                        item.update();

                        // but only check for changes when item is unpaused and not high performance
                        // item was changed during update or is checking

                        if (!item.highPerformance && !item.paused && (item.changed || item.intersecting || item.checking)) {

                            // layer changed

                            this.changed = true;

                            if (item instanceof ig.EntityLight) {

                                this.changedLights = true;

                            }

                        }

                    }

                    if (this.changed) {

                        // check this entities for collisions if this has been changed

                        if (this.itemsChecking.length > 0) {

                            this.checkEntities();

                        }

                        // when auto sorting, resort entities if this has been changed

                        if (this.autoSort) {

                            this.sort();

                        }

                    }

                }

            },

            /**
             * Draws layer.
             */
            draw: function() {

                if (!this.noDraw && this.items.length > 0) {

                    // draw each item

                    for (var i = 0, il = this.items.length; i < il; i++) {

                        this.items[i].draw();

                    }

                }

            },

            /**
             * Checks entities on layer.
             */
            checkEntities: function() {

                // insert all items that check or collide into a spatial hash

                var hash = this.spatialHash = {};
                var cellSize = this.spatialHashCellSize;

                for (var i = 0, il = this.itemsChecking.length; i < il; i++) {

                    var item = this.itemsChecking[i];

                    item.cleanupCollision();

                    var itemsChecked = {};
                    var minX = Math.floor(item.pos.x / cellSize);
                    var minY = Math.floor(item.pos.y / cellSize);
                    var maxX = Math.floor((item.pos.x + item.size.x) / cellSize) + 1;
                    var maxY = Math.floor((item.pos.y + item.size.y) / cellSize) + 1;

                    for (var x = minX; x < maxX; x++) {

                        for (var y = minY; y < maxY; y++) {

                            var column = hash[x];

                            // create new cell and occupants list

                            if (!column) {

                                column = hash[x] = {};

                            }

                            var cell = column[y];

                            // create occupants list only
                            if (!cell) {

                                column[y] = [item];

                            }
                            // cell exists and has list of items
                            else {

                                // check against each other item in this cell

                                for (var j = 0, jl = cell.length; j < jl; j++) {

                                    var other = cell[j];

                                    // only check once for every pair

                                    if (!itemsChecked[other.id]) {

                                        itemsChecked[other.id] = true;

                                        if (item.touches(other)) {

                                            ig.EntityExtended.checkPair(item, other);

                                        }

                                    }

                                }

                                // add item as occupant of cell

                                cell.push(item);

                            }

                        }

                    }

                }

            }

        });

    });
