/**
 * @namespace ig
 */

/**
 * Enhancements and fixes to Impact's merge method.
 * <br>- ignores undefined values and copy null values
 * <br>- handles true / false values converted to string by weltmeister (editor)
 */
ig.merge = function (original, extended) {

    original = original || {};

    if (extended) {

        for (var key in extended) {
            var ext = extended[key];
            var extType = typeof ext;
            if (extType !== 'undefined') {
                if (
                    extType !== 'object' ||
                        ext instanceof HTMLElement ||
                        ext instanceof ig.Class
                    ) {

                    // ugly, perhaps there is a better way?

                    if (extType === 'string') {

                        if (ext === 'true') {

                            ext = true;

                        }
                        else if (ext === 'false') {

                            ext = false;

                        }

                    }

                    original[key] = ext;

                }
                else {
                    if (!original[key] || typeof(original[key]) !== 'object') {
                        original[key] = (ext instanceof Array) ? [] : {};
                    }
                    ig.merge(original[key], ext);
                }
            }
        }

    }

    return original;
};

ig.module(
        'plusplus.core.game'
    ).requires(
        'impact.game',
        'impact.font',
        'plusplus.core.config',
        'plusplus.core.timer',
        'plusplus.core.image',
        'plusplus.core.background-map',
        'plusplus.core.collision-map',
        'plusplus.core.animation',
        'plusplus.core.layer',
        'plusplus.core.input',
        'plusplus.core.camera',
        'plusplus.core.entity',
        'plusplus.helpers.utils',
        'plusplus.helpers.utilstile',
        'plusplus.entities.shape-solid',
        'plusplus.entities.shape-edge',
        'plusplus.entities.shape-climbable',
        'plusplus.entities.shape-climbable-one-way',
        'plusplus.helpers.signals',
        'plusplus.helpers.tweens',
        'plusplus.entities.light',
        'plusplus.ui.ui-overlay-pause'
    )
    .defines(function () {
        'use strict';

        var _c = ig.CONFIG;
        var _ut = ig.utils;
        var _utt = ig.utilstile;

        /**
         * Impact++ game.
         * <br>- uses {@link ig.Layer} to organize entities, based on Impact Layers plugin by Amadeus {@link https://github.com/amadeus/impact-layers}
         * <span class="alert alert-info"><strong>Tip:</strong> your game class should extend this to utilize Impact++ properly.</span>
         * @class
         * @extends ig.Game
         * @memberof ig
         * @author Collin Hover - collinhover.com
         **/
        ig.GameExtended = ig.Game.extend(/**@lends ig.GameExtended.prototype */{

            /**
             * Passes to extract shapes from collision map.
             * <br>- shapes are extracted during {@link ig.GameExtended#loadLevel} via {@link ig.GameExtended#createShapes}
             * <span class="alert alert-info"><strong>Tip:</strong> Impact++ can automatically convert collision maps into shapes (vertices, edges, etc), via shapesPasses.</span>
             * @type Array
             * @default gets climbable shapes using options [ { ignoreSolids: true, ignoreOneWays: true } ]
             * @example
             * // will skip extracting shapes from collision map
             * game.shapesPasses = null;
             * // after level is loaded, get all edge shapes for lighting
             * game.shapesPasses = [
             *      {
             *          ignoreClimbable: true,
             *          discardBoundaryInner: true
             *      }
             * ];
             * // after level is loaded, get all climbable shapes
             * game.shapesPasses = [
             *      {
             *          ignoreSolids: true,
             *          ignoreOneWays: true
             *      }
             * ];
             * @see ig.utilstile
             */
            shapesPasses: [
                {
                    ignoreSolids: true,
                    ignoreOneWays: true
                }
            ],

            /**
             * Main font.
             * <br>- If font path is undefined, loads nothing and creates no font.
             * @type ig.Font
             */
            font: ( _c.FONT_MAIN_PATH ? new ig.Font(_c.FONT_MAIN_PATH) : null ),

            /**
             * Alternative font.
             * <br>- If font path is undefined, loads nothing and creates no font.
             * @type ig.Font
             */
            fontAlt: ( _c.FONT_ALT_PATH ? new ig.Font(_c.FONT_ALT_PATH) : ( _c.FONT_MAIN_PATH ? new ig.Font(_c.FONT_MAIN_PATH) : null ) ),

            /**
             * List of layers, sorted by zIndex.
             * @type Array
             */
            layers: [],

            /**
             * Layers mapped by name.
             * @type Object
             */
            layersMap: {},

            /**
             * Method to sort layers by. Defaults to z index sort.
             * @type Function
             */
            sortLayersBy: null,

            /**
             * Whether game is paused.
             * <span class="alert"><strong>IMPORTANT:</strong> does not garauntee that all layers are paused or unpaused!</span>
             * @type Boolean
             */
            paused: false,

            /**
             * Whether game has added or removed entities since last update.
             * @type Boolean
             */
            dirtyEntities: true,

            /**
             * Whether game has added or removed lights since last update.
             * @type Boolean
             */
            dirtyLights: true,

            /**
             * Whether game has changed since last update.
             * @type Boolean
             */
            changed: false,

            /**
             * Whether game lights have changed since last update.
             * @type Boolean
             */
            changedLights: false,

            /**
             * List of entities across all layers, repopulated during update and only when layers have changed.
             * @type Array
             */
            entities: [],

            /**
             * List of lights across all layers, repopulated during update and only when layers have changed.
             * @type Array
             */
            lights: [],

            /**
             * Gravity magnitude in positive y direction.
             * @type Number
             * @default
             */
            gravity: 400,

            /**
             * Camera used for screen control.
             * <br>- created on init.
             * @type ig.Camera
             */
            camera: null,

            /**
             * Signal dispatched when game and system is resized.
             * <br>- created on init.
             * @type ig.Signal
             */
            onResized: null,

            /**
             * Signal dispatched when game is paused.
             * <br>- created on init.
             * @type ig.Signal
             */
            onPaused: null,

            /**
             * Signal dispatched when game is unpaused.
             * <br>- created on init.
             * @type ig.Signal
             */
            onUnpaused: null,

            // internal properties, do not modify

            _isReady: false,

            _layersToChange: [],
            _layersToAdd: [],
            _layersToRemove: [],

            _itemsToAdd: [],
            _itemsAttemptedToAddDuringDeferred: [],
            _addingDeferred: false,

            _itemsToRemove: [],
            _itemsAttemptedToRemoveDuringDeferred: [],
            _removingDeferred: false,

            /**
             * Initializes game.
             * <br>- creates camera
             * <br>- creates signals
             * <br>- sets layer sort method
             * <br>- adds layer: <strong>backgroundMaps</strong> as a map layer with no update
             * <br>- adds layer: <strong>lights</strong>
             * <br>- adds layer: <strong>entities</strong>
             * <br>- adds layer: <strong>foregroundMaps</strong> as a map layer with no update
             * <br>- adds layer: <strong>overlay</strong>as an auto sorted layer
             * <br>- adds layer: <strong>ui</strong> as an auto sorted layer that cannot be paused
             * <br>- starts listening for window resize
             **/
            init: function () {

                this.camera = new ig.Camera();

                this.onResized = new ig.Signal();
                this.onPaused = new ig.Signal();
                this.onUnpaused = new ig.Signal();

                // setup core layers

                this.sortLayersBy = this.sortLayersBy || ig.Game.SORT.Z_INDEX;

                this.addLayer(new ig.Layer('backgroundMaps', {
                    mapLayer: true,
                    noUpdate: true
                }));

                this.addLayer(new ig.Layer('lights'));

                this.addLayer(new ig.Layer('entities'));

                this.addLayer(new ig.Layer('foregroundMaps', {
                    mapLayer: true,
                    noUpdate: true
                }));

                // overlay should always be second from top
                // overlay should be automatically sorted

                this.addLayer(new ig.Layer('overlay', {
                    zIndex: 1,
                    autoSort: true
                }));

                // ui always on top and automatically sorted

                this.addLayer(new ig.Layer('ui', {
                    zIndex: 2,
                    ignorePause: true,
                    autoSort: true
                }));

                // setup custom layers

                for (var layerName in _c.LAYERS_CUSTOM) {

                    var layerSettings = _c.LAYERS_CUSTOM[ layerName ];

                    this.addLayer(new ig.Layer(layerName, layerSettings));

                }

                // add deferred layers immediately

                this._addDeferredLayers();

                // resize canvas

                ig.global.addEventListener('resize', _ut.debounce(this.resize.bind(this), 500), false);
                this.resize();

            },

            /**
             * Loads a level.
             * @param {Object} data level data.
             **/
            loadLevel: function (data) {

                var ent, ld, newMap, layer;
                var i, il, j, jl, items;

                // reset

                this.camera.reset();
                this._isReady = false;

                for (i = 0, il = this.layers.length; i < il; i++) {

                    this.layers[i].reset();

                }

                // entities

                this.namedEntities = {};

                for (i = 0, il = data.entities.length; i < il; i++) {

                    ent = data.entities[ i ];

                    this.spawnEntity(ent.type, ent.x, ent.y, ent.settings);

                }

                // maps

                this.collisionMap = ig.CollisionMap.staticNoCollision;

                for (i = 0; i < data.layer.length; i++) {

                    ld = data.layer[i];

                    if (ld.name === 'collision') {

                        this.collisionMap = new ig.CollisionMap(ld.tilesize, ld.data);

                    }
                    else {

                        newMap = new ig.BackgroundMap(ld.tilesize, ld.data, ld.tilesetName);
                        newMap.anims = this.backgroundAnims[ld.tilesetName] || {};
                        newMap.repeat = ld.repeat;
                        newMap.distance = ld.distance;
                        newMap.foreground = !!ld.foreground;
                        newMap.preRender = !!ld.preRender;
                        newMap.name = ld.name;

                        // no layer provided, which means we guesstimate
                        if (!newMap.layerName && newMap.foreground) {
                            newMap.layerName = 'foregroundMaps';
                        }
                        else if (!newMap.layerName) {
                            newMap.layerName = 'backgroundMaps';
                        }

                        this.addItem(newMap);

                    }

                }

                // create shapes

                this.createShapes();

                // add all spawned entities immediately

                this._addDeferredItems();

                // sort spawned

                this.sortEntities();

                // level ready

                this._isReady = true;

                // set all layer items ready

                for (i = 0, il = this.layers.length; i < il; i++) {

                    layer = this.layers[i];
                    items = layer.items;

                    if (layer.numEntities) {

                        for (j = 0, jl = items.length; j < jl; j++) {
                            items[ j ].ready();
                        }

                    }
                }

                // record changed

                this.dirtyEntities = this.dirtyLights = true;

            },

            /**
             * Converts collision map to shapes.
             **/
            createShapes: function () {

                var i, il, j, jl;
                var options, shapes;

                if ( this.shapesPasses ) {

                    for (i = 0, il = this.shapesPasses.length; i < il; i++) {

                        options = this.shapesPasses[ i ];
                        shapes = _utt.shapesFromCollisionMap(this.collisionMap, options);

                        // edge shapes

                        for (j = 0, jl = shapes.edges.length; j < jl; j++) {

                            var shape = shapes.edges[ j ];

                            this.spawnEntity(ig.EntityShapeEdge, shape.x, shape.y, shape.settings);

                        }

                        // one-way shapes

                        for (j = 0, jl = shapes.oneWays.length; j < jl; j++) {

                            var shape = shapes.oneWays[ j ];

                            this.spawnEntity(ig.EntityShapeSolid, shape.x, shape.y, shape.settings);

                        }

                        // climbable shapes

                        for (j = 0, jl = shapes.climbables.length; j < jl; j++) {

                            var shape = shapes.climbables[ j ];

                            this.spawnEntity( ( shape.settings.oneWay ? ig.EntityShapeClimbableOneWay : ig.EntityShapeClimbable ), shape.x, shape.y, shape.settings);

                        }

                    }

                }

            },

            /**
             * Adds a layer to the active layer list.
             * @param {ig.Layer} layer layer to be added.
             **/
            addLayer: function (layer) {

                this._layersToAdd.push(layer);

                return layer;

            },

            /**
             * Adds all deferred layers immediately.
             * @private
             **/
            _addDeferredLayers: function () {

                if (this._layersToAdd.length > 0) {

                    for (var i = 0, il = this._layersToAdd.length; i < il; i++) {

                        var layer = this._layersToAdd[ i ];

                        // new layer

                        if (this.layersMap[ layer.name ] !== layer) {

                            // remove previous layer with name

                            if (this.layersMap[ layer.name ]) {

                                this.removeLayer(this.layersMap[ layer.name ]);

                            }

                            // store new

                            this.layersMap[ layer.name ] = layer;

                            this.layers.push(layer);

                            // resort layer order

                            if (this.sortLayersBy) {

                                this.layers.sort(this.sortLayersBy);

                            }

                        }

                    }

                    this._layersToAdd.length = 0;

                }

            },

            /**
             * Deferred removal of layer.
             * @param {ig.Layer} layer layer to be removed.
             **/
            removeLayer: function (layer) {

                this._layersToRemove.push(layer);

            },

            /**
             * Removes all deferred layers immediately.
             * @private
             **/
            _removeDeferredLayers: function () {

                if (this._layersToRemove.length > 0) {

                    for (var i = 0, il = this._layersToRemove.length; i < il; i++) {

                        var layer = this._layersToRemove[ i ];

                        layer.cleanup();

                        // remove from layers map if current value is layer

                        if (this.layers[ layer.name ] === layer) {

                            delete this.layers[ layer.name ];

                        }

                    }

                    this._layersToRemove.length = 0;

                }

            },

            /**
             * Deferred layer settings change.
             * @param {String} layerName name of layer to be modified.
             * @param {Object} settings settings to merge into layer.
             **/
            changeLayer: function (layerName, settings) {

                this._layersToChange.push({ name: layerName, settings: settings });

            },

            /**
             * Changes all deferred layers immediately.
             * @private
             **/
            _changeDeferredLayers: function () {

                if (this._layersToChange.length > 0) {

                    for (var i = 0, il = this._layersToChange.length; i < il; i++) {

                        var change = this._layersToChange[ i ];
                        var layerName = change.name;
                        var settings = change.settings;
                        var layer = this.layersMap[ layerName ];

                        if (layer) {

                            ig.merge(layer, settings);

                        }

                    }

                    this._layersToChange.length = 0;

                }

            },

            /**
             * Spawns an entity of type.
             * <span class="alert"><strong>IMPORTANT:</strong> use this to instantiate an entity for better stability.</span>
             * @param {String|Entity} type entity type or an entity.
             * @param {Number} x x position.
             * @param {Number} y y position.
             * @param {Object} settings settings for entity.
             * @returns {Entity} created entity.
             **/
            spawnEntity: function (type, x, y, settings) {

                var EntityClass = typeof type === 'string' ? ig[type] || ig.global[type] : type;

                if (!EntityClass) {
                    throw new Error("Can't spawn entity of type: " + type);
                }
                // if type is original entity, swap with extended entity
                // this is done to ensure stability
                else if (type === 'Entity') {
                    EntityClass = ig.EntityExtended;
                }

                // in case EntityClass is an instance of an Entity already
                // this allows us to spawn entities that already exist

                var entity;

                if (EntityClass instanceof ig.EntityExtended) {

                    entity = EntityClass;

                    // kill entity to be safe before we add again

                    if (!entity._killed) {

                        entity.kill();

                    }

                    entity.reset(x, y, settings);

                }
                else {

                    entity = new (EntityClass)(x, y, settings || {});

                }

                // Push entity into appropriate layer

                this.addItem(entity);

                if (entity.name) this.namedEntities[ entity.name ] = entity;

                return entity;

            },

            /**
             * Removes an entity.
             * <br>- <strong>IMPORTANT:</strong> use this to remove an entity for better stability
             * <br>- this is not the same as {@link ig.EntityExtended#kill}
             * @param {Entity} entity.
             **/
            removeEntity: function (entity) {

                if (entity instanceof ig.Entity && !entity._killed) {

                    this.flagAsKilled(entity);

                }

                this.removeItem(entity);

            },

            /**
             * Flags an entity as killed. Can be used before removal to facilitate death animations.
             * @param {Entity} entity.
             **/
            flagAsKilled: function (entity) {

                if (entity.name) delete this.namedEntities[ entity.name ];

                entity._killed = true;
                entity.added = false;
                entity.type = ig.EntityExtended.TYPE.NONE;
                entity.checkAgainst = ig.EntityExtended.TYPE.NONE;
                entity.collides = ig.Entity.COLLIDES.NEVER;

            },

            /**
             * Deferred add of an item to a layer.
             * @param {*} item item to add.
             * @param {String} [layerName] name of layer.
             * @param {Boolean} [forChange] whether removal is for change.
             **/
            addItem: function (item, layerName, forChange) {

                // set layer being added to within item

                item._layerNameAdd = layerName || item.layerName;
                item._layerChange = forChange || false;

                // this seems silly but we need to watch for items during the deferred call

                if (this._addingDeferred) {

                    this._itemsAttemptedToAddDuringDeferred.push(item);

                }
                else {

                    this._itemsToAdd.push(item);

                }

            },

            /**
             * Adds all deferred items immediately.
             * @private
             **/
            _addDeferredItems: function () {

                if (this._itemsToAdd.length > 0) {

                    this._addingDeferred = true;
                    this.dirtyEntities = true;

                    for (var i = 0, il = this._itemsToAdd.length; i < il; i++) {

                        var item = this._itemsToAdd[ i ];
                        item.layerName = item._layerNameAdd;
                        item._layerNameAdd = undefined;

                        // check layer

                        var layer = this.layersMap[ item.layerName ];
                        if (!layer) throw new Error('Attempting to add to a layer that doesn\'t exist: ' + item.layerName);

                        // add to layer

                        layer.addItem(item);

                        // item not just swapping layers

                        if (!item._layerChange) {

                            // if spawning after game is ready, trigger ready immediately

                            if (item.ready && this._isReady) {

                                item.ready();

                            }

                            // handle this pause state (normally this won't be needed)
                            // helps when item was paused and added to an unpaused layer

                            if (layer.paused) {

                                if (item.pause) {

                                    item.pause();

                                }

                            }
                            else if (item.unpause) {

                                item.unpause();

                            }

                        }

                        item._layerChange = false;

                        // changed lights

                        if (item instanceof ig.EntityLight) {

                            this.dirtyLights = true;

                        }

                    }

                    this._itemsToAdd.length = 0;
                    this._addingDeferred = false;

                    if (this._itemsAttemptedToAddDuringDeferred.length > 0) {

                        Array.prototype.push.apply(this._itemsToAdd, this._itemsAttemptedToAddDuringDeferred);
                        this._itemsAttemptedToAddDuringDeferred.length = 0;

                    }

                }

            },

            /**
             * Deferred removal of item.
             * @param {*} item item to remove.
             * @param {String} [layerName] name of layer to remove from. Use this if you need to swap items between layers.
             * @param {Boolean} [forChange] whether removal is for change.
             **/
            removeItem: function (item, layerName, forChange) {

                // set layer being removed from within item

                item._layerNameRemove = layerName || item.layerName;

                // cleanup item when not just swapping layers

                if (!forChange && item.cleanup) {

                    item.cleanup();

                }

                item._layerChange = forChange || false;

                // override add if item is being added to same layer as being removed from
                // only need to do this check on remove because deferred remove comes before deferred add

                if (item._layerNameAdd && item._layerNameAdd === item._layerNameRemove) {

                    item._layerNameAdd = undefined;

                    if (this._addingDeferred) {

                        _ut.arrayCautiousRemove(this._itemsAttemptedToAddDuringDeferred, item);

                    }
                    else {

                        _ut.arrayCautiousRemove(this._itemsToAdd, item);

                    }

                }

                // this seems silly but we need to watch for items during the deferred call

                if (this._removingDeferred) {

                    this._itemsAttemptedToRemoveDuringDeferred.push(item);

                }
                else {

                    this._itemsToRemove.push(item);

                }

            },

            /**
             * Removes all deferred items immediately.
             * @private
             **/
            _removeDeferredItems: function () {

                if (this._itemsToRemove.length > 0) {

                    this._removingDeferred = true;

                    this.dirtyEntities = true;

                    for (var i = 0, il = this._itemsToRemove.length; i < il; i++) {

                        var item = this._itemsToRemove[ i ];
                        var layer = this.layersMap[ item._layerNameRemove ];
                        item._layerNameRemove = undefined;

                        // remove from layer

                        if (layer) {

                            layer.removeItem(item);

                        }

                        // lights changed

                        if (item instanceof ig.EntityLight) {

                            this.dirtyLights = true;

                        }

                    }

                    this._itemsToRemove.length = 0;
                    this._removingDeferred = false;

                    if (this._itemsAttemptedToRemoveDuringDeferred.length > 0) {

                        Array.prototype.push.apply(this._itemsToRemove, this._itemsAttemptedToRemoveDuringDeferred);
                        this._itemsAttemptedToRemoveDuringDeferred.length = 0;

                    }

                }

            },

            /**
             * Removes this item from current layer and adds to new layer.
             * @param {*} item item to swap layers.
             * @param {String} [layerName] name of layer to swap to, defaults to previous change layer to allow easy swap to/from.
             **/
            layerChangeItem: function (item, layerName) {

                if (item) {

                    // use reset state layer name if none passed

                    if (!layerName && item.resetState) {

                        layerName = item.resetState.layerName;

                    }

                    // swap layers as long as item is not already on target layer

                    if (layerName && item.layerName !== layerName) {

                        this.removeItem(item, item.layerName, true);

                        this.addItem(item, layerName, true);

                    }

                }

            },

            /**
             * Sort of entities, sorting all layers if no layer name passed.
             * @param {String} [layerName] layer name.
             **/
            sortEntities: function (layerName) {

                if (typeof layerName === 'string') {

                    this.sortEntitiesOnLayer(this.layersMap[layerName]);

                }
                else {

                    for (var i = 0, il = this.layers.length; i < il; i++) {

                        this.sortEntitiesOnLayer(this.layers[ i ]);

                    }

                }

            },

            /**
             * Sort of entities on a specific layer.
             * @param {ig.Layer} layer layer on which to sort items.
             **/
            sortEntitiesOnLayer: function (layer) {

                if (layer) {

                    layer.items.sort(layer.sortBy);

                }

            },

            /**
             * Deferred sort of entities, sorting all layers if no layer name passed.
             * @param {String} [layerName] layer name.
             **/
            sortEntitiesDeferred: function (layerName) {

                if (typeof layerName === 'string') {

                    this.sortEntitiesOnLayerDeferred(this.layersMap[layerName]);

                }
                else {

                    for (var i = 0, il = this.layers.length; i < il; i++) {

                        this.sortEntitiesOnLayerDeferred(this.layers[ i ]);

                    }

                }

            },

            /**
             * Deferred sort of entities on a specific layer.
             * @param {ig.Layer} layer layer on which to sort items.
             **/
            sortEntitiesOnLayerDeferred: function (layer) {

                if (layer) {

                    layer.dirtySort = true;

                }

            },

            /**
             * Update entities in layer.
             * @param {String} layerName layer name.
             **/
            updateEntities: function (layerName) {

                var layer = this.layersMap[ layerName ];

                if (layer) {

                    var items = layer.items;

                    for (var i = 0, il = items.length; i < il; i++) {

                        var item = items[ i ];

                        if (!item._killed) {
                            item.update();
                        }

                    }

                }

            },

            /**
             * Gets all entities of a particular class.
             * <span class="alert"><strong>IMPORTANT:</strong> the name is misleading, but this does not search by {@link ig.EntityExtended.TYPE}.</span>
             * @param {ig.Class} cls entity class.
             * @param {Object} [settings] settings for search.
             * @returns {Array} all found entities.
             * @override
             **/
            getEntitiesByType: function (cls, settings) {

                settings = settings || {};

                var matching = [];
                var layerName = settings.layerName;
                var layer;
                var unsorted = settings.unsorted;
                var first = settings.first;
                var i, il;

                // search all layers

                if (!layerName) {

                    // no need to sort each layer search

                    settings.unsorted = true;

                    for (i = 0, il = this.layers.length; i < il; i++) {

                        layer = this.layers[i];

                        if (layer.numEntities) {

                            settings.layerName = layer.name;

                            var layerMatching = this.getEntitiesByType(cls, settings);

                            if (layerMatching.length) {

                                matching = matching.concat(layerMatching);

                                // only looking for first

                                if (first) {

                                    break;

                                }

                            }
                        }

                    }

                }
                else {

                    layer = this.layersMap[ layerName ];
                    var entityClass = typeof( cls ) === 'string' ? ig.global[ cls ] : cls;

                    if (layer && entityClass) {

                        var items = layer.items;

                        // find all entities of class on layer

                        for (i = 0, il = items.length; i < il; i++) {

                            var item = items[ i ];

                            if (!item._killed && item instanceof entityClass) {

                                matching.push(item);

                                // only looking for first

                                if (first) {

                                    break;

                                }

                            }

                        }

                    }

                }

                // sort

                if (matching.length > 1 && !unsorted) {

                    // sort by distance from position

                    if (typeof settings.x !== 'undefined') {

                        var x = settings.x || 0;
                        var y = settings.y || 0;

                        matching.sort(function sortByDistance(a, b) {

                            var aToCenterX = x - a.getCenterX();
                            var aToCenterY = y - a.getCenterY();
                            var aDistance = aToCenterX * aToCenterX + aToCenterY * aToCenterY;

                            var bToCenterX = x - b.getCenterX();
                            var bToCenterY = y - b.getCenterY();
                            var bDistance = bToCenterX * bToCenterX + bToCenterY * bToCenterY;

                            return aDistance - bDistance;

                        });

                    }
                    else {

                        matching.sort(this.sortBy);

                    }

                }

                return matching;

            },

            /**
             * Gets a map by matching name.
             * @param {String} name map name to search.
             * @returns {Map} Map if found, else undefined.
             **/
            getMapByName: function (name) {

                var i, il, j, jl, items, layer;

                if (name === 'collision') {

                    return this.collisionMap;

                }

                for (i = 0, il = this.layers.length; i < il; i++) {

                    layer = this.layers[ i ];
                    items = layer.items;

                    if (layer.mapLayer) {

                        for (j = 0, jl = items.length; j < jl; j++) {

                            var item = items[ j ];

                            if (item.name === name) {

                                return item;

                            }

                        }

                    }

                }

            },

            /**
             * Pauses game.
             **/
            pause: function () {

                // layers

                for (var i = 0, il = this.layers.length; i < il; i++) {

                    this.layers[ i ].pause();

                }

                // game

                if (!this.paused) {

                    this.paused = true;

                    // dim game with overlay

                    if (_c.DIMMED_PAUSE) {

                        if (!this.dimmer) {

                            this.dimmer = this.spawnEntity(ig.UIOverlayPause, 0, 0, {
                                fillStyle: _c.DIMMER_COLOR,
                                alpha: 0
                            });

                        }

                        this.dimmer.fadeTo(_c.DIMMER_ALPHA);

                    }

                    this.onPaused.dispatch(this);

                }

            },

            /**
             * Unpauses game.
             **/
            unpause: function () {

                // layers

                for (var i = 0, il = this.layers.length; i < il; i++) {

                    this.layers[ i ].unpause();

                }

                // game

                if (this.paused) {

                    this.paused = false;

                    if (this.dimmer) {

                        var dimmer = this.dimmer;
                        this.dimmer = undefined;

                        dimmer.fadeOut({
                            onComplete: function () {

                                ig.game.removeEntity(dimmer);

                            }
                        });

                    }

                    this.onUnpaused.dispatch(this);

                }

            },

            /**
             * Updates game.
             * <br>- removes, adds, and changes deferred layers
             * <br>- removes and adds all deferred items
             * <br>- loads a new level
             * <br>- regathers all entities and lights in game if entities have been added or removed
             * <br>- updates inputs
             * <br>- updates tweens
             * <br>- updates layers
             * <br>- updates camera
             **/
            update: function () {

                var i, il;
                var layer;

                // handle deferred

                this._removeDeferredLayers();

                this._addDeferredLayers();

                this._changeDeferredLayers();

                this._removeDeferredItems();

                this._addDeferredItems();

                // load new level

                if (this._levelToLoad) {

                    this.loadLevel(this._levelToLoad);
                    this._levelToLoad = undefined;

                }

                // gather all entities and lights from entity layers into game.entities for compatibility

                if (this.dirtyEntities !== false) {

                    this.entities.length = this.lights.length = 0;

                    for (i = 0, il = this.layers.length; i < il; i++) {

                        layer = this.layers[i];

                        if (layer.numEntities && layer.items.length > 0) {

                            this.entities = this.entities.concat(layer.items);
                            this.lights = this.lights.concat(layer.itemsLight);

                        }

                    }

                }

                // update input

                ig.input.update();

                // update tweens

                ig.TWEEN.update();

                // execute update and associated functions for all applicable layers

                this.changed = this.changedLights = false;

                for (i = 0, il = this.layers.length; i < il; i++) {

                    var layer = this.layers[ i ];

                    layer.update();

                    this.changed |= layer.changed;
                    this.changedLights |= layer.changedLights;

                }

                // background animations

                for (var tileset in this.backgroundAnims) {

                    var anims = this.backgroundAnims[tileset];

                    for (i in anims) {

                        anims[ i ].update();

                    }

                }

                // camera

                this.camera.update();

                // clean

                this.dirtyEntities = this.dirtyLights = false;

            },

            /**
             * Draws game.
             * <br>- clears canvas
             * <br>- records rounded screen pos
             * <br>- draws all layers
             **/
            draw: function () {

                // clear screen

                if (this.clearColor) {
                    ig.system.clear(this.clearColor);
                }

                // get rounded screen position

                this._rscreen.x = ig.system.getDrawPos(this.screen.x) / ig.system.scale;
                this._rscreen.y = ig.system.getDrawPos(this.screen.y) / ig.system.scale;

                // draw all layers

                for (var i = 0, il = this.layers.length; i < il; i++) {

                    this.layers[ i ].draw();

                }

            },

            /**
             * Draws all entities (items) on a layer
             * @param {String} [layerName] layer name.
             **/
            drawEntities: function (layerName) {

                var layer = this.layers[ layerName ];

                if (layer) {

                    var entities = layer.items;

                    for (var i = 0, il = entities.length; i < il; i++) {
                        entities[i].draw();
                    }

                }

            },

            /**
             * Resize the canvas based on the window.
             **/
            resize: function () {

                ig.system.resize(ig.global.innerWidth * _c.CANVAS_WIDTH_PCT * ( 1 / _c.SCALE ), ig.global.innerHeight * _c.CANVAS_HEIGHT_PCT * ( 1 / _c.SCALE ), _c.SCALE);

                ig.system.size = Math.min(ig.system.width, ig.system.height);

                this.onResized.dispatch();

                if (this.camera) {

                    this.camera.resize();

                }

            }

        });

    });
