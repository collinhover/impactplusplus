ig.module(
    'plusplus.core.game'
).requires(
    'impact.game',
    'plusplus.core.config',
    'plusplus.core.timer',
    'plusplus.core.font',
    'plusplus.core.image',
    'plusplus.core.background-map',
    'plusplus.core.collision-map',
    'plusplus.core.pathfinding-map',
    'plusplus.core.animation',
    'plusplus.core.layer',
    'plusplus.core.input',
    'plusplus.core.entity',
    'plusplus.core.camera',
    'plusplus.core.player-manager',
    'plusplus.abstractities.spawner',
    'plusplus.entities.light',
    'plusplus.entities.shape-solid',
    'plusplus.entities.shape-climbable',
    'plusplus.entities.shape-climbable-one-way',
    'plusplus.ui.ui-overlay-pause',
    'plusplus.helpers.signals',
    'plusplus.helpers.tweens',
    'plusplus.helpers.pathfinding',
    'plusplus.helpers.utils',
    'plusplus.helpers.utilstile',
    'plusplus.helpers.utilsintersection'
)
    .defines(function() {
        'use strict';

        var _c = ig.CONFIG;
        var _pf = ig.pathfinding;
        var _ut = ig.utils;
        var _utt = ig.utilstile;
        var _uti = ig.utilsintersection;

        /**
         * Impact++ game.
         * <br>- uses {@link ig.Layer} to organize entities, based on Impact Layers plugin by Amadeus {@link https://github.com/amadeus/impact-layers}
         * <span class="alert alert-info"><strong>Tip:</strong> your game class should extend this to utilize Impact++ properly.</span>
         * @class
         * @extends ig.Game
         * @memberof ig
         * @author Collin Hover - collinhover.com
         **/
        ig.GameExtended = ig.Game.extend( /**@lends ig.GameExtended.prototype */ {

            /**
             * Passes to extract shapes from collision map.
             * <br>- shapes are extracted during {@link ig.GameExtended#loadLevel} via {@link ig.GameExtended#createShapes}
             * <span class="alert alert-info"><strong>Tip:</strong> Impact++ can automatically convert collision maps into shapes (vertices, edges, etc), via shapesPasses.</span>
             * @type Array
             * @default gets climbable shapes using options [ { ignoreSolids: true, ignoreOneWays: true } ]
             * @see ig.utilstile.shapesFromCollisionMap
             * @example
             * // will skip extracting shapes from collision map
             * game.shapesPasses = null;
             * // after level is loaded, get all edge shapes for lighting
             * game.shapesPasses = {
             *      lighting: {
             *          ignoreClimbables: true,
             *          discardBoundaryInner: true
             *      }
             * };
             * // after level is loaded, get all climbable shapes
             * game.shapesPasses = {
             *      climbables: {
             *          ignoreSolids: true,
             *          ignoreOneWays: true
             *      }
             * };
             * // note that by default, Impact++ extracts
             * // the level boundary inner edge loop
             * // and all climbable shapes
             * @see ig.utilstile
             */
            shapesPasses: {
                level: {
                    retainBoundaryOuter: false,
                    discardEdgesInner: true,
                    ignoreClimbables: true,
                    ignoreOneWays: true
                },
                climbables: {
                    ignoreSolids: true,
                    ignoreOneWays: true
                }
            },

            /**
             * Shape(s) of the level inner boundary, used for {@link ig.GameExtended#insideLevel} checks.
             * @type Array
             */
            shapesLevel: [],

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
             * <span class="alert"><strong>IMPORTANT:</strong> does not guarantee that all layers are paused or unpaused!</span>
             * @type Boolean
             * @readonly
             */
            paused: false,

            /**
             * Whether pause state is locked.
             * <br>- set directly or use {@link ig.Game#pause} and {@link ig.Game#paused} to toggle lock.
             * @type Boolean
             */
            pauseLocked: false,

            /**
             * Whether game has changed since last update.
             * @type Boolean
             * @readonly
             */
            changed: false,

            /**
             * Whether game lights have changed since last update.
             * @type Boolean
             * @readonly
             */
            changedLights: false,

            /**
             * Whether game has added or removed entities since last update.
             * @type Boolean
             * @readonly
             */
            dirtyEntities: true,

            /**
             * Whether game has added or removed lights since last update.
             * @type Boolean
             * @readonly
             */
            dirtyLights: true,

            /**
             * Whether game is deferring add, remove, level changing, etc.
             * <span class="alert alert-info"><strong>Tip:</strong> this property is briefly set to false during game update when all deferred items are processed.</span>
             * @type Boolean
             * @readonly
             */
            deferring: false,

            /**
             * Whether game has a level currently.
             * <span class="alert alert-info"><strong>Tip:</strong> this property is briefly set to false when levels are changing.</span>
             * @type Boolean
             * @readonly
             */
            hasLevel: false,

            /**
             * List of entities across all layers, repopulated during update and only when layers have changed.
             * @type Array
             * @readonly
             */
            entities: [],

            /**
             * Map of entities by name across all layers.
             * @type Object
             * @readonly
             * @see {@link ig.EntityExtended#name}
             */
            namedEntities: {},

            /**
             * Map of entities by name across all layers that are persistent within the game, i.e. able to change levels.
             * @type Object
             * @readonly
             * @see {@link ig.EntityExtended#persistent}
             */
            persistentEntities: {},

            /**
             * Whether game should autospawn player when a new level is loaded.
             * <span class="alert"><strong>IMPORTANT:</strong> this only works when {@link ig.GameExtended#playerClass} is set or when player is persistent and the player has been spawned once already!</span>
             * @type Boolean
             * @see ig.CONFIG.AUTO_SPAWN_PLAYER
             */
            autoSpawnPlayer: _c.AUTO_SPAWN_PLAYER,

            /**
             * The player class to spawn when using {@link ig.GameExtended#autoSpawnPlayer}.
             * <span class="alert alert-info"><strong>Tip:</strong> if you don't want player to auto spawn at the start of the game, but you do want player to spawn on every level after game starts, leave this empty, spawn player manually once, and make sure player is {@link ig.EntityExtended#persistent}.</span>
             * @type ig.Player
             * @default
             */
            playerClass: null,

            /**
             * Whether game can search for player by class in {@link ig.GameExtended#getPlayer}.
             * @type Boolean
             * @default
             */
            canSearchForPlayerByClass: true,


            /**
             * Whether game can search for player by type in {@link ig.GameExtended#getPlayer}.
             * @type Boolean
             * @default
             */
            canSearchForPlayerByType: true,

            /**
             * List of lights across all layers, repopulated during update and only when layers have changed.
             * @type Array
             * @readonly
             */
            lights: [],

            /**
             * Gravity magnitude in positive y direction.
             * @type Number
             * @default
             */
            gravity: _c.TOP_DOWN ? 0 : _c.GRAVITY,

            /**
             * Class of camera to use when creating {@link ig.GameExtended#camera}.
             * @type ig.Camera
             * @default
             */
            cameraClass: ig.Camera,

            /**
             * Settings to merge into {@link ig.GameExtended#camera} on init.
             * @type Object
             * @default
             */
            cameraSettings: null,

            /**
             * Camera used for screen control.
             * <br>- created on init.
             * @type ig.Camera
             */
            camera: null,

            /**
             * Class of player manager to use when creating {@link ig.GameExtended#playerManager}.
             * @type ig.Camera
             * @default
             */
            playerManagerClass: ig.PlayerManager,

            /**
             * Settings to merge into {@link ig.GameExtended#playerManager} on init.
             * @type Object
             * @default
             */
            playerManagerSettings: null,

            /**
             * Player manager used to control the player character.
             * <br>- created on init.
             * @type ig.PlayerManager
             */
            playerManager: null,

            /**
             * Map used for pathfinding.
             * @type ig.PathfindingMap
             * @default
             */
            pathfindingMap: null,

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

            /**
             * Color to clear screen with.
             * @type String
             * @see ig.CONFIG.CLEAR_COLOR
             */
            clearColor: _c.CLEAR_COLOR,

            // internal properties, do not modify

            _gameNeedsSetup: true,
            _gameNeedsResize: false,
            _gameForceResize: false,

            _levelBuilding: false,
            _levelToBuild: null,
            _levelNeedsBuild: false,
            _levelNeedsUnload: false,

            _playerSpawnerName: '',

            _layersToChange: [],
            _layersToAdd: [],
            _layersToRemove: [],

            _itemsToAdd: [],
            _itemsToAddNext: [],
            _itemsToRemove: [],
            _itemsToRemoveNext: [],

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
            init: function() {

                if (this._gameNeedsSetup) {

                    this.setup();

                }

            },

            /**
             * Game setup of required properties and elements. Called automatically and guaranteed to be called before anything else.
             * @private
             */
            setup: function() {

                this._gameNeedsSetup = false;

                this.onPaused = new ig.Signal();
                this.onUnpaused = new ig.Signal();

                if (this.cameraClass) {

                    this.camera = new(this.cameraClass)(this.cameraSettings);

                }

                if (this.playerManagerClass) {

                    this.playerManager = new(this.playerManagerClass)(this.playerManagerSettings);

                }

                // setup core layers

                this.sortLayersBy = this.sortLayersBy || ig.Game.SORT.Z_INDEX;

                this.addLayer(new ig.Layer('backgroundMaps', {
                    preRender: _c.PRERENDER_BACKGROUND_LAYER,
                    noUpdate: _c.NO_UPDATE_BACKGROUND_LAYER
                }));

                this.addLayer(new ig.Layer('lights'));

                this.addLayer(new ig.Layer('entities'));

                this.addLayer(new ig.Layer('foregroundMaps', {
                    preRender: _c.PRERENDER_FOREGROUND_LAYER,
                    noUpdate: _c.NO_UPDATE_FOREGROUND_LAYER
                }));

                this.addLayer(new ig.Layer('overlay', {
                    zIndex: 1,
                    ignorePause: _c.IGNORE_PAUSE_OVERLAY_LAYER,
                    autoSort: _c.AUTO_SORT_OVERLAY_LAYER
                }));

                this.addLayer(new ig.Layer('ui', {
                    zIndex: 2,
                    clearOnLoad: _c.CLEAR_ON_LOAD_UI_LAYER,
                    ignorePause: _c.IGNORE_PAUSE_UI_LAYER,
                    autoSort: _c.AUTO_SORT_UI_LAYER
                }));

                // setup custom layers

                for (var layerName in _c.LAYERS_CUSTOM) {

                    var layerSettings = _c.LAYERS_CUSTOM[layerName];

                    this.addLayer(new ig.Layer(layerName, layerSettings));

                }

                this._addDeferredLayers();

                ig.global.addEventListener('resize', _ut.debounce(this.resize.bind(this), _c.RESIZE_DELAY), false);
                this.resize();

                this.inputStart();

            },

            /**
             * Deferred load of a level.
             * @param {Object|String} level level data or level name.
             * @param {String} [playerSpawnerName] name of entity in new level to set as player spawn location.
             * @example
             * // these will all load the 'LevelTest1' level
             * game.loadLevelDeferred( "LevelTest1" );
             * game.loadLevelDeferred( "Test1" );
             * game.loadLevelDeferred( "test1" );
             */
            loadLevelDeferred: function(level, playerSpawnerName) {

                this.resetLoadLevel();

                this._levelToLoad = level;
                this._playerSpawnerName = playerSpawnerName;

            },

            /**
             * Loads a level immediately.
             * <span class="alert"><strong>IMPORTANT:</strong> for proper stability, use {@link ig.GameExtended#loadLevelDeferred} instead.</span>
             * @param {Object|String} [level] level data or level name.
             * @param {String} [playerSpawnerName] name of entity in new level to set as player spawn location.
             **/
            loadLevel: function(level, playerSpawnerName) {

                if (this._gameNeedsSetup) {

                    this.setup();

                }

                level = level || this._levelToLoad;
                this._levelToLoad = undefined;

                // handle level as name

                if (typeof level === 'string') {

                    // camel case level name

                    var levelName = level.replace(/^(Level)?(\w)(\w*)/, function(m, l, a, b) {
                        return a.toUpperCase() + b;
                    });

                    levelName = levelName.replace(/[-|\s?)](.)/g, function(m, a) {
                        return a.toUpperCase();
                    });

                    // get level by name

                    level = ig.global['Level' + levelName];

                }

                // valid level

                if (level) {

                    this._levelToBuild = level;

                    // transition levels

                    if (this.hasLevel && _c.TRANSITION_LEVELS && this.layersMap[_c.TRANSITIONER_LAYER] && this.layersMap[_c.TRANSITIONER_LAYER].ignorePause) {

                        var me = this;

                        if (!this.transitioner) {

                            this.transitioner = this.spawnEntity(ig.UIOverlay, 0, 0, {
                                name: "transitioner",
                                layerName: _c.TRANSITIONER_LAYER,
                                zIndex: _c.Z_INDEX_TRANSITIONER,
                                fillStyle: _c.TRANSITIONER_COLOR,
                                r: _c.TRANSITIONER_R,
                                g: _c.TRANSITIONER_G,
                                b: _c.TRANSITIONER_B
                            });

                            // change alpha after spawn
                            // so alpha doesn't get recorded in reset state

                            this.transitioner.alpha = 0;

                        }

                        this.transitioner.fadeTo(1, {
                            onComplete: function() {

                                me.removeEntity(me.transitioner);
                                me.buildLevelDeferred();

                            }
                        });

                        this.pause(true);

                    }
                    // build level
                    else {

                        this.buildLevel();

                    }

                }


            },

            /**
             * Defers build of {@link ig.Game#_levelToBuild}.
             * <span class="alert"><strong>IMPORTANT:</strong> for proper stability, use {@link ig.GameExtended#loadLevelDeferred} instead.</span>
             **/
            buildLevelDeferred: function() {

                if (this._levelToBuild) {

                    this._levelNeedsBuild = true;

                }

            },

            /**
             * Builds a level immediately.
             * <span class="alert"><strong>IMPORTANT:</strong> for proper stability, use {@link ig.GameExtended#loadLevelDeferred} instead.</span>
             **/
            buildLevel: function() {

                if (this._gameNeedsSetup) {

                    this.setup();

                }

                var levelData = this._levelToBuild;
                var playerSpawnerName = this._playerSpawnerName;
                var entData, ld, newMap;
                var i, il;

                if (levelData) {

                    // start building new

                    this._levelBuilding = true;

                    // unload previous level

                    this.unloadLevel();

                    // maps

                    this.collisionMap = ig.CollisionMap.staticNoCollision;

                    for (i = 0; i < levelData.layer.length; i++) {

                        ld = levelData.layer[i];

                        if (ld.name === 'collision') {

                            this.collisionMap = new ig.CollisionMap(ld.tilesize, ld.data);

                        } else if (ld.name === 'pathfinding') {

                            this.pathfindingMap = new ig.PathfindingMap(ld.tilesize, ld.data);

                        } else {

                            newMap = new ig.BackgroundMapExtended(ld.tilesize, ld.data, ld.tilesetName);
                            newMap.anims = this.backgroundAnims[ld.tilesetName] || {};
                            newMap.repeat = ld.repeat;
                            newMap.distance = ld.distance;
                            newMap.foreground = !! ld.foreground;
                            newMap.preRender = !! ld.preRender;
                            newMap.name = ld.name;

                            // no layer provided, which means we guesstimate
                            if (!newMap.layerName && newMap.foreground) {
                                newMap.layerName = 'foregroundMaps';
                            } else if (!newMap.layerName) {
                                newMap.layerName = 'backgroundMaps';
                            }

                            this.addItem(newMap);

                        }

                    }

                    // build tile shapes

                    _utt.rebuild(this.collisionMap);

                    // create shapes

                    this.createShapes();

                    // build pathfinding for level

                    if (_c.PATHFINDING.BUILD_WITH_LEVEL) {

                        _pf.rebuild(this.collisionMap, this.pathfindingMap);

                    }

                    // entities

                    this.namedEntities = {};

                    for (i = 0, il = levelData.entities.length; i < il; i++) {

                        entData = levelData.entities[i];

                        this.spawnEntity(entData.type, entData.x, entData.y, entData.settings);

                    }

                    // find player if already spawned

                    var player = this.getPlayer();

                    // else try to auto spawn

                    if (!player && this.autoSpawnPlayer) {

                        // player must have already spawned at least once
                        // or the game must have a player class to spawn

                        player = this.persistentEntities['player'] || this.playerClass;

                        if (player) {

                            this.spawnEntity(player, 0, 0);

                        }

                    }

                    // complete transition

                    if (this.transitioner) {

                        if (!this.transitioner._layerNameAdd) {
                            this.spawnEntity(this.transitioner, 0, 0, {
                                alpha: 1
                            });

                        } else {

                            this.transitioner.alpha = 1;


                        }
                        this.transitioner.fadeToDeath();
                        this.transitioner = undefined;

                    }

                    // immediately sort all layers

                    for (i = 0, il = this.layers.length; i < il; i++) {

                        var layer = this.layers[i];
                        layer.items.sort(layer.sortBy);

                    }

                    // level done building

                    this._levelBuilding = false;
                    this.hasLevel = true;

                    // set all layers ready

                    for (i = 0, il = this.layers.length; i < il; i++) {

                        this.layers[i].ready();

                    }

                    // move player to spawner

                    if (player && playerSpawnerName) {

                        var playerSpawner = this.namedEntities[playerSpawnerName];

                        if (playerSpawner) {

                            // try to spawn

                            if (playerSpawner instanceof ig.Spawner) {

                                playerSpawner.spawnNext(player);

                            }
                            // else move to
                            else {

                                player.moveToPosition(playerSpawner);

                            }

                        }

                    }

                    this.unpause(true);

                    if (this.camera) {

                        this.camera.ready();

                    }

                    if (this.playerManager) {

                        this.playerManager.ready();

                    }

                    this.resize(true);

                    this.dirtyEntities = this.dirtyLights = true;

                }

            },

            /**
             * Deferred unload of the current level.
             */
            unloadLevelDeferred: function() {

                this._levelNeedsUnload = true;

            },

            /**
             * Unloads the current level immediately and resets layers, camera, etc.
             * <span class="alert"><strong>IMPORTANT:</strong> for proper stability, use {@link ig.GameExtended#unloadLevelDeferred} instead.</span>
             */
            unloadLevel: function() {

                if (this.hasLevel) {

                    this.hasLevel = false;
                    this.shapesLevel.length = 0;

                    if (this.playerManager) {

                        this.playerManager.reset();

                    }

                    if (this.camera) {

                        this.camera.reset();

                    }

                    // layers reset will handle cleanup of all items
                    // make sure no items are left to add or remove

                    this._removeDeferredItems();
                    this._addDeferredItems();

                    this.resetLoadLevel();

                    _pf.unload();

                    for (var i = 0, il = this.layers.length; i < il; i++) {

                        this.layers[i].reset();

                    }

                }

            },

            /**
             * Resets level loading properties.
             */
            resetLoadLevel: function() {

                this._levelToLoad = this._levelToBuild = undefined;
                this._levelNeedsBuild = this._levelNeedsUnload = false;
                this._playerSpawnerName = '';

            },

            /**
             * Converts collision map to shapes.
             **/
            createShapes: function() {

                var i, il;
                var options, shapes;

                if (this.shapesPasses && this.collisionMap) {

                    for (var pass in this.shapesPasses) {

                        options = this.shapesPasses[pass];
                        shapes = _utt.shapesFromCollisionMap(this.collisionMap, options);

                        // solid shapes

                        for (i = 0, il = shapes.solids.length; i < il; i++) {

                            var shape = shapes.solids[i];

                            // special case for when pass is for level inner shape

                            if (pass === "level") {

                                shape.size = shape.settings.size;
                                shape.vertices = shape.settings.vertices;
                                delete shape.id;
                                delete shape.settings;

                                this.shapesLevel.push(shape);

                            } else {

                                this.spawnEntity(ig.EntityShapeSolid, shape.x, shape.y, shape.settings);

                            }

                        }

                        // one-way shapes

                        for (i = 0, il = shapes.oneWays.length; i < il; i++) {

                            var shape = shapes.oneWays[i];
                            this.spawnEntity(ig.EntityShapeSolid, shape.x, shape.y, shape.settings);

                        }

                        // climbable shapes

                        for (i = 0, il = shapes.climbables.length; i < il; i++) {

                            var shape = shapes.climbables[i];
                            this.spawnEntity((shape.settings.oneWay ? ig.EntityShapeClimbableOneWay : ig.EntityShapeClimbable), shape.x, shape.y, shape.settings);

                        }

                    }

                }

            },

            /**
             * Adds a layer to the active layer list.
             * @param {ig.Layer} layer layer to be added.
             **/
            addLayer: function(layer) {

                this._layersToAdd.push(layer);

                return layer;

            },

            /**
             * Adds all deferred layers immediately.
             * @param {Array} [layers=ig.Game#_layersToRemove] list of layers.
             * @private
             **/
            _addDeferredLayers: function(layers) {

                layers = layers || this._layersToAdd;

                if (layers.length > 0) {

                    for (var i = 0, il = layers.length; i < il; i++) {

                        var layer = layers[i];

                        // new layer

                        if (this.layersMap[layer.name] !== layer) {

                            // remove previous layer with name

                            if (this.layersMap[layer.name]) {

                                this.removeLayer(this.layersMap[layer.name]);

                            }

                            // store new

                            this.layersMap[layer.name] = layer;

                            this.layers.push(layer);

                            // resort layer order

                            if (this.sortLayersBy) {

                                this.layers.sort(this.sortLayersBy);

                            }

                        }

                    }

                    if (layers === this._layersToAdd) {

                        this._layersToAdd.length = 0;

                    }

                }

            },

            /**
             * Deferred removal of layer.
             * @param {ig.Layer} layer layer to be removed.
             **/
            removeLayer: function(layer) {

                this._layersToRemove.push(layer);

            },

            /**
             * Removes all deferred layers immediately.
             * @param {Array} [layers=ig.Game#_layersToRemove] list of layers.
             * @private
             **/
            _removeDeferredLayers: function(layers) {

                layers = layers || this._layersToRemove;

                if (layers.length > 0) {

                    for (var i = 0, il = layers.length; i < il; i++) {

                        var layer = layers[i];

                        _ut.arrayCautiousRemove(this.layers, layer);

                        // remove from layers map

                        if (this.layersMap[layer.name] === layer) {

                            delete this.layersMap[layer.name];

                        }

                        // reset layer

                        layer.reset();

                    }

                    if (layers === this._layersToRemove) {

                        this._layersToRemove.length = 0;

                    }

                }

            },

            /**
             * Deferred layer settings change.
             * @param {String} layerName name of layer to be modified.
             * @param {Object} settings settings to merge into layer.
             **/
            changeLayer: function(layerName, settings) {

                this._layersToChange.push({
                    name: layerName,
                    settings: settings
                });

            },

            /**
             * Changes all deferred layers immediately.
             * @private
             **/
            _changeDeferredLayers: function() {

                if (this._layersToChange.length > 0) {

                    for (var i = 0, il = this._layersToChange.length; i < il; i++) {

                        var change = this._layersToChange[i];
                        var layerName = change.name;
                        var settings = change.settings;
                        var layer = this.layersMap[layerName];

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
             * @param {Object} [settings] settings to be merged into entity.
             * @returns {Entity} created entity.
             **/
            spawnEntity: function(type, x, y, settings) {

                var EntityClass = typeof type === 'string' ? ig[type] || ig.global[type] : type;

                // entity class was not found

                if (!EntityClass) {
                    throw new Error("Can't spawn entity of type: " + type + ". It does not exist in namespace 'ig' or 'ig.global'/'window'.");
                }

                // in case EntityClass is an instance of an Entity already
                // this allows us to spawn entities that already exist

                var entity;

                if (EntityClass instanceof ig.EntityExtended) {

                    entity = EntityClass;

                    // we're already adding this entity but it is deferred

                    if (entity._layerNameAdd) {

                        return entity;

                    }

                    entity.reset(x, y, settings);

                } else {

                    entity = new(EntityClass)(x, y, settings);

                }

                // map entity

                if (entity.name) {

                    // check persistent first

                    if (entity.persistent) {

                        // replace with persistent and merge settings

                        if (this.persistentEntities[entity.name] instanceof ig.EntityExtended) {

                            entity = this.persistentEntities[entity.name];
                            entity.reset(x, y, settings);

                        }
                        // or store as persistent if first time encountering
                        else {

                            this.persistentEntities[entity.name] = entity;

                        }

                    }

                    this.namedEntities[entity.name] = entity;

                }

                // check for extended entity

                if (_c.FORCE_ENTITY_EXTENDED && !(entity instanceof ig.EntityExtended)) {

                    throw new Error("You are trying to spawn an entity that does not inherit or extend ig.EntityExtended. Although it is not recommended (seriously), if you wish to allow this, see ig.CONFIG.FORCE_ENTITY_EXTENDED.")

                }

                // push entity into appropriate layer

                this.addItem(entity);

                return entity;

            },

            /**
             * Removes an entity.
             * <br>- this is not the same as {@link ig.EntityExtended#kill}
             * <span class="alert alert-info"><strong>Tip:</strong> use this to remove an entity for better stability.</span>
             * @param {Entity} entity
             * @param {Object} settings settings for {@link ig.Game#removeItem}
             * @see ig.Game#removeItem
             **/
            removeEntity: function(entity, settings) {

                if (entity instanceof ig.EntityExtended && !entity._killed) {

                    this.flagAsKilled(entity);

                }

                this.removeItem(entity, settings);

            },

            /**
             * Clears a {@link ig.EntityExtended#persistent} entity by name from the game cache, allowing it to be fully reset.
             * <span class="alert"><strong>IMPORTANT:</strong> this does NOT kill the entity.</span>
             * @param {String} name
             **/
            clearPersistentEntity: function(name) {

                var entity = ig.game.persistentEntities[name];

                if (entity) {

                    // wait to cleanup until removed

                    if (entity.added) {

                        entity._cleanupPersistent = true;

                    }
                    // or already removed so we can cleanup right now
                    else {

                        entity.cleanupPersistent();

                    }

                    delete ig.game.persistentEntities[name];

                }

            },

            /**
             * Clears ALL {@link ig.EntityExtended#persistent} entities from game cache.
             * <span class="alert"><strong>IMPORTANT:</strong> this does NOT kill the entity.</span>
             * @param {String} name
             **/
            clearPersistentEntities: function() {

                for (var name in ig.game.persistentEntities) {

                    this.clearPersistentEntity(name);

                }

            },

            /**
             * Flags an entity as killed. Can be used before removal to facilitate death animations.
             * @param {Entity} entity.
             **/
            flagAsKilled: function(entity) {

                if (entity.name) delete this.namedEntities[entity.name];

                entity._killed = true;
                entity.type = ig.EntityExtended.TYPE.NONE;
                entity.checkAgainst = ig.EntityExtended.TYPE.NONE;
                entity.collides = ig.EntityExtended.COLLIDES.NEVER;

            },

            /**
             * Deferred add of an item to a layer.
             * <span class="alert"><strong>IMPORTANT:</strong> to create an entity, use {@link ig.GameExtended#spawnEntity}.</span>
             * @param {*} item item to add.
             * @param {Object} [settings] settings object.
             * @example
             * // add item to a different layer than it is on
             * settings.layerName = 'otherLayer';
             * // add is actually for changing between layers
             * settings.forChange = true;
             */
            addItem: function(item, settings) {

                // an item's killed property should have already been unset
                // but it is possible for an entity to kill itself in init/reset

                if (!item._killed) {

                    // only allow add when not already adding or changing layers

                    var layerNameAdd;

                    if (settings) {

                        item._layerChange = settings.forChange || false;
                        layerNameAdd = settings.layerName || item.layerName || "entities";

                    } else {

                        item._layerChange = false;
                        layerNameAdd = item.layerName || "entities";

                    }

                    if (item._layerChange || !item._layerNameAdd) {

                        // set layer being added to within item

                        item._layerNameAdd = layerNameAdd;

                        // add to deferred list

                        if (!this._levelBuilding) {

                            if (this.deferring) {

                                this._itemsToAdd.push(item);

                            } else {

                                this._itemsToAddNext.push(item);

                            }

                        }
                        // skip deferral
                        else {

                            this._addDeferredItem(item);

                        }

                    }

                }

            },

            /**
             * Adds all deferred items immediately.
             * @private
             **/
            _addDeferredItems: function() {

                if (this._itemsToAdd.length > 0) {

                    for (var i = 0, il = this._itemsToAdd.length; i < il; i++) {

                        this._addDeferredItem(this._itemsToAdd[i]);

                    }

                    this._itemsToAdd.length = 0;

                }

            },

            /**
             * Adds an item immediately.
             * @param {*} item.
             * @private
             **/
            _addDeferredItem: function(item) {

                if (this._gameNeedsSetup) {

                    this.setup();

                }

                item.layerName = item._layerNameAdd;
                item._layerNameAdd = undefined;

                // check layer

                var layer = this.layersMap[item.layerName];

                if (!layer) {
                    throw new Error("Attempting to add item/entity to layer named " + item.layerName + " and that layer doesn't exist. Your item needs a 'layerName' property with a value matching one of the existing game layer names: ", this.layersMap);
                }

                // add to layer

                layer.addItem(item);

                item.added = true;

                // item not just swapping layers and game is not building a level

                if (!item._layerChange && !this._levelBuilding) {

                    // handle this pause state (normally this won't be needed)
                    // helps when item paused state does not match layer paused state

                    if (layer.paused) {

                        if (item.pause) {

                            item.pause();

                        }

                    } else if (item.paused && item.unpause) {

                        item.unpause();

                    }

                    // do adding

                    if (item.adding) {

                        item.adding();

                    }

                }

                item._layerChange = false;

                // changed

                this.dirtyEntities = true;

                if (item instanceof ig.EntityLight) {

                    this.dirtyLights = true;

                }

            },

            /**
             * Deferred removal of item.
             * <span class="alert"><strong>IMPORTANT:</strong> to kill an entity, use {@link ig.EntityExtended#kill}, and to remove an entity, use {@link ig.GameExtended#removeEntity}.</span>
             * @param {*} item item to remove.
             * @param {Object} settings settings object.
             * @example
             * // remove item from a different layer than it is on
             * settings.layerName = 'otherLayer';
             * // removal is actually for changing between layers
             * settings.forChange = true;
             **/
            removeItem: function(item, settings) {

                if (settings) {

                    item._layerNameRemove = settings.layerName || item.layerName;
                    item._layerChange = settings.forChange || false;


                } else {

                    item._layerNameRemove = item.layerName;
                    item._layerChange = false;

                }

                // cleanup item when not just swapping layers

                if (!item._layerChange) {

                    if (item.cleanup) {

                        item.cleanup();

                    }

                    item.added = false;

                }

                // add to deferred list

                if (!this._levelBuilding) {

                    // override add if item is being added
                    // only need to do this check on remove because deferred remove comes before deferred add

                    if (item._layerNameAdd) {

                        item._layerNameAdd = undefined;

                        _ut.arrayCautiousRemove(this._itemsToAddNext, item);
                        _ut.arrayCautiousRemove(this._itemsToAdd, item);

                    }

                    if (this.deferring) {

                        this._itemsToRemove.push(item);

                    } else {

                        this._itemsToRemoveNext.push(item);

                    }

                }
                // skip deferral
                else {

                    this._removeDeferredItem(item);

                }

            },

            /**
             * Removes all deferred items immediately.
             * @private
             **/
            _removeDeferredItems: function() {

                if (this._itemsToRemove.length > 0) {

                    for (var i = 0, il = this._itemsToRemove.length; i < il; i++) {

                        this._removeDeferredItem(this._itemsToRemove[i]);

                    }

                    this._itemsToRemove.length = 0;

                }

            },

            /**
             * Removes an item immediately.
             * @param {*} item.
             * @private
             **/
            _removeDeferredItem: function(item) {

                var layer = this.layersMap[item._layerNameRemove];
                item._layerNameRemove = undefined;

                // remove from layer

                if (layer) {

                    layer.removeItem(item);

                }

                // changed

                this.dirtyEntities = true;

                if (item instanceof ig.EntityLight) {

                    this.dirtyLights = true;

                }

            },

            /**
             * Shifts next deferred to be added/removed on next update.
             * @private
             */
            _advanceDeferredNext: function() {

                if (this._itemsToAddNext.length > 0) {

                    this._itemsToAdd = this._itemsToAddNext;
                    this._itemsToAddNext = [];

                }

                if (this._itemsToRemoveNext.length > 0) {

                    this._itemsToRemove = this._itemsToRemoveNext;
                    this._itemsToRemoveNext = [];

                }

            },

            /**
             * Removes this item from current layer and adds to new layer.
             * @param {*} item item to swap layers.
             * @param {String} [layerName] name of layer to swap to, defaults to previous change layer to allow easy swap to/from.
             **/
            layerChangeItem: function(item, layerName) {

                if (item) {

                    // use reset state layer name if none passed

                    if (!layerName && item.resetState) {

                        layerName = item.resetState.layerName;

                    }

                    // swap layers as long as item is not already on target layer

                    if (layerName && item.layerName !== layerName) {

                        this.removeItem(item, {
                            layerName: item.layerName,
                            forChange: true
                        });

                        this.addItem(item, {
                            layerName: layerName,
                            forChange: true
                        });

                    }

                }

            },

            /**
             * Deferred sort of entities, sorting all layers if no layer name passed.
             * @param {String} [layerName] layer name.
             **/
            sortEntitiesDeferred: function(layerName) {

                if (typeof layerName === 'string') {

                    this.sortEntitiesOnLayerDeferred(this.layersMap[layerName]);

                } else {

                    for (var i = 0, il = this.layers.length; i < il; i++) {

                        this.sortEntitiesOnLayerDeferred(this.layers[i]);

                    }

                }

            },

            /**
             * Deferred sort of entities on a specific layer.
             * @param {ig.Layer} layer layer on which to sort items.
             **/
            sortEntitiesOnLayerDeferred: function(layer) {

                if (layer) {

                    layer.sort();

                }

            },

            /**
             * Alias for deferred sort! See issue #149.
             * @param {String} [layerName] layer name.
             **/
            sortEntities: function(layerName) {

                this.sortEntitiesDeferred(layerName);

            },

            /**
             * Alias for deferred sort! See issue #149.
             * @param {ig.Layer} layer layer on which to sort items.
             **/
            sortEntitiesOnLayer: function(layer) {

                this.sortEntitiesOnLayerDeferred(layer);

            },

            /**
             * Whether an entity or position is inside the level. Most accurate when game is using pathfinding and has a collision map, and always true if using neither!
             * <span class="alert alert-info"><strong>Tip:</strong> if you are having issues with this method, it is most likely because a) your game has pathfinding disabled, and/or b) your level does not have a continuous border of solid tiles in the collision map!</span>
             * @param {Number} x target x
             * @param {Number} y target y
             * @returns {Boolean} whether inside level.
             */
            isInsideLevel: function(x, y) {

                if (_pf.tilesize) {

                    var node = _pf.getNode(x, y);
                    return node && node.insideLevel;

                } else if (this.collisionMap) {

                    return _utt.isTileWalkableStrict(this.collisionMap.getTile(x, y));

                }

                return true;

            },

            /**
             * Get the player object. This method searches for name, then class if {@link ig.GameExtended#canSearchForPlayerByClass}, then type if {@link ig.GameExtended#canSearchForPlayerByType}.
             * @param {Object} [settings] settings for search.
             * @returns {ig.Player} player if exists in game.
             **/
            getPlayer: function(settings) {

                return this.namedEntities["player"] || (this.canSearchForPlayerByClass && this.getEntitiesByClass("Player", settings || {
                    first: true
                })[0]) || (this.canSearchForPlayerByType && this.getEntitiesByType(ig.EntityExtended.TYPE.PLAYER, settings || {
                    first: true
                })[0]);

            },

            /**
             * Gets all entities of a particular class.
             * <span class="alert"><strong>IMPORTANT:</strong> the name is misleading, but this does not search by {@link ig.EntityExtended.TYPE}.</span>
             * @param {ig.Class|String} cls entity class.
             * @param {Object} [settings] settings for search.
             * @returns {Array} all found entities.
             * @see ig.GameExtended#getEntitiesMatching
             **/
            getEntitiesByClass: function(cls, settings) {

                var entityClass = typeof(cls) === 'string' ? ig.global[cls] : cls;

                if (entityClass) {

                    return this.getEntitiesMatching(function(entity) {

                        return entity instanceof entityClass;

                    }, settings);

                } else {

                    return [];

                }

            },

            /**
             * Gets all entities of a particular type.
             * <span class="alert alert-danger"><strong>IMPORTANT:</strong> this method no longer searches for entities by class, but by their {@ig.EntityExtended#type} property. To search by class, use {@ig.GameExtended#getEntitiesByClass}.</span>
             * @param {String|Number|Bitflag} type entity type.
             * @param {Object} [settings] settings for search.
             * @returns {Array} all found entities.
             * @override
             * @see ig.GameExtended#getEntitiesMatching
             **/
            getEntitiesByType: function(type, settings) {

                var entityType = typeof(type) === 'string' ? _ut.getType(ig.EntityExtended, type) : type;

                return this.getEntitiesMatching(function(entity) {

                    return entity.type & entityType;

                }, settings);

            },

            /**
             * Gets all entities of a particular group.
             * @param {String|Number|Bitflag} group entity group.
             * @param {Object} [settings] settings for search.
             * @returns {Array} all found entities.
             * @override
             * @see ig.GameExtended#getEntitiesMatching
             **/
            getEntitiesByGroup: function(group, settings) {

                var entityGroup = typeof(group) === 'string' ? _ut.getType(ig.EntityExtended, group) : group;

                return this.getEntitiesMatching(function(entity) {

                    return entity.group & entityGroup;

                }, settings);

            },

            /**
             * Gets all characters of a particular group.
             * @param {String|Number|Bitflag} group entity group.
             * @param {Object} [settings] settings for search.
             * @returns {Array} all found entities.
             * @override
             * @see ig.GameExtended#getEntitiesMatching
             **/
            getCharactersByGroup: function(group, settings) {

                var entityGroup = typeof(group) === 'string' ? _ut.getType(ig.EntityExtended, group) : group;

                return this.getEntitiesMatching(function(entity) {

                    return (entity.group & entityGroup) && entity instanceof ig.Character;

                }, settings);

            },

            /**
             * Gets all matching entities.
             * @param {Function} matchBy function to use to check if entity matches search.
             * @param {Object} [settings] settings for search.
             * @returns {Array} all found entities.
             * @override
             * @example
             * // the search takes a match function and plain settings object
             * // each entity is passed to the match function
             * // if the function returns true, entity is matched
             * // and the settings control the search
             * // search only the entities layer
             * game.getEntitiesMatching( matchBy, {
             *      layerName: 'entities'
             * });
             * // get only the first
             * game.getEntitiesMatching( matchBy, {
             *      first: true
             * });
             * // skip sorting search results
             * game.getEntitiesMatching( matchBy, {
             *      unsorted: true
             * });
             * // sort results by distance from 100, 100 instead of the game's sortBy
             * // this requires the 'from' property
             * game.getEntitiesMatching( matchBy, {
             *      byDistance: true,
             *      from: { x: 100, y: 100 }
             * });
             * // sort results by distance from myCharacter
             * // this requires the 'from' property
             * game.getEntitiesMatching( matchBy, {
             *      byDistance: true,
             *      from: myCharacter
             * });
             * // only get entities that are within distance squared
             * // this requires the 'from' property
             * game.getEntitiesMatching( matchBy, {
             *      distanceSquared: 10000,
             *      from: myCharacter
             * });
             * // only get entities that intersect bounds
             * game.getEntitiesMatching( matchBy, {
             *      minX: myCharacter.pos.x,
             *      minY: myCharacter.pos.x,
             *      maxX: myCharacter.pos.x + myCharacter.size.x,
             *      maxY: myCharacter.pos.y + myCharacter.size.y
             * });
             * // only get entities in line of sight
             * game.getEntitiesMatching( matchBy, {
             *      lineOfSight: true
             * });
             * // only get entities that are not hidden
             * game.getEntitiesMatching( matchBy, {
             *      nonHidden: true
             * });
             **/
            getEntitiesMatching: function(matchBy, settings) {

                var matching = [];
                var layer;
                var layerName;
                var unsorted;
                var distanceSquared;
                var byDistance;
                var lineOfSight;
                var nonHidden;
                var from;
                var intersects;
                var minX;
                var minY;
                var maxX;
                var maxY;
                var first;
                var i, il;

                // search all layers

                if (!settings || !settings.layerName) {

                    settings = settings || {};

                    // no need to sort each layer search

                    settings.unsorted = true;

                    for (i = 0, il = this.layers.length; i < il; i++) {

                        layer = this.layers[i];

                        if (layer.numEntities) {

                            settings.layerName = layer.name;

                            var layerMatching = this.getEntitiesMatching(matchBy, settings);

                            if (layerMatching.length) {

                                matching = matching.concat(layerMatching);

                                // only looking for first

                                if (settings.first) {

                                    break;

                                }

                            }
                        }

                    }

                } else {

                    if (settings) {

                        layerName = settings.layerName;
                        unsorted = settings.unsorted;
                        distanceSquared = settings.distanceSquared;
                        byDistance = settings.byDistance;
                        lineOfSight = settings.lineOfSight;
                        nonHidden = settings.nonHidden;
                        from = settings.from;
                        first = settings.first;

                        if (typeof settings.minX !== 'undefined') {

                            intersects = true;
                            minX = settings.minX;
                            minY = settings.minY;
                            maxX = settings.maxX;
                            maxY = settings.maxY;

                        }

                    }

                    layer = this.layersMap[layerName];

                    if (layer) {

                        var items = layer.items;

                        for (i = 0, il = items.length; i < il; i++) {

                            var item = items[i];

                            if (!item._killed && matchBy(item) && (!nonHidden || !item.hidden) && (!distanceSquared || item.distanceSquaredTo(from) <= distanceSquared) && (!intersects || _uti.AABBIntersect(minX, minY, maxX, maxY, item.pos.x, item.pos.y, item.pos.x + item.width, item.pos.y + item.height)) && (!lineOfSight || from.lineOfSight(item))) {

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

                    if (byDistance) {

                        if (from instanceof ig.EntityExtended) {

                            _uti.sortByDistance(from.pos.x + from.size.x * 0.5, from.pos.y + from.size.y * 0.5, matching);

                        } else {

                            _uti.sortByDistance(from.x, from.y, matching);

                        }

                    } else {

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
            getMapByName: function(name) {

                var i, il, j, jl, items, layer;

                if (name === 'collision') {

                    return this.collisionMap;

                }

                for (i = 0, il = this.layers.length; i < il; i++) {

                    layer = this.layers[i];
                    items = layer.items;

                    if (layer.numBackgroundMaps) {

                        for (j = 0, jl = items.length; j < jl; j++) {

                            var item = items[j];

                            if (item.name === name) {

                                return item;

                            }

                        }

                    }

                }

            },

            /**
             * Pauses game, provided pause is not locked and a level is not being built.
             * <span class="alert"><strong>IMPORTANT:</strong> locking pause will not allow any other pause or unpause until unlocked!</span>
             * @param {Boolean} [lock=false] whether to lockdown pause and show no visible sign (i.e. no dimming)
             **/
            pause: function(lock) {

                if (!this.pauseLocked && !this._levelBuilding) {

                    // layers

                    for (var i = 0, il = this.layers.length; i < il; i++) {

                        this.layers[i].pause();

                    }

                    // game

                    if (!this.paused) {

                        this.paused = true;
                        this.pauseLocked = lock;

                        if (this.camera) {

                            this.camera.pause();

                        }

                        // dim game with overlay

                        if (!this.pauseLocked && _c.DIMMED_PAUSE) {

                            if (!this.dimmer) {

                                this.dimmer = this.spawnEntity(ig.UIOverlayPause, 0, 0, {
                                    fillStyle: _c.DIMMER_COLOR,
                                    r: _c.DIMMER_R,
                                    g: _c.DIMMER_G,
                                    b: _c.DIMMER_B,
                                    alpha: 0
                                });

                            }

                            this.dimmer.fadeTo(_c.DIMMER_ALPHA);

                        }

                        this.onPaused.dispatch(this);

                    }

                }

            },

            /**
             * Unpauses game, provided pause is not locked and a level is not being built.
             * @param {Boolean} [unlock=false] whether to unlock pause
             **/
            unpause: function(unlock) {

                if (unlock) {

                    this.pauseLocked = false;

                }

                if (!this.pauseLocked && !this._levelBuilding) {

                    // layers

                    for (var i = 0, il = this.layers.length; i < il; i++) {

                        this.layers[i].unpause();

                    }

                    // game

                    if (this.paused) {

                        this.paused = false;

                        if (this.camera) {

                            this.camera.unpause();

                        }

                        if (this.dimmer) {

                            this.dimmer.fadeToDeath();
                            this.dimmer = undefined;

                        }

                        this.onUnpaused.dispatch(this);

                    }

                }

            },

            /**
             * Starts input by setting up some default bindings.
             * <span class="alert"><strong>IMPORTANT:</strong> this method is called automatically on game init!</span>
             * @example
             * // inputStart sets up bindings
             * // including:
             * // WASD, ARROWS, Spacebar Jump
             * // gestures like touch, tap, hold, swipe
             * // for example touch is bound to both mouse keys
             * ig.input.bind(ig.KEY.MOUSE1, 'touch');
             * ig.input.bind(ig.KEY.MOUSE2, 'touch');
             * // and tap is used in place of click
             * // to support both desktop and mobile devices
             * ig.input.bind(ig.KEY.TAP, 'tap');
             **/
            inputStart: function() {

                // touch

                ig.input.bind(ig.KEY.MOUSE1, 'touch');
                ig.input.bind(ig.KEY.MOUSE2, 'touch');
                ig.input.bind(ig.KEY.TAP, 'tap');
                ig.input.bind(ig.KEY.TAP_DOUBLE, 'tapDouble');
                ig.input.bind(ig.KEY.HOLD, 'hold');
                ig.input.bind(ig.KEY.HOLD_ACTIVATE, 'holdActivate');
                ig.input.bind(ig.KEY.SWIPE, 'swipe');
                ig.input.bind(ig.KEY.SWIPE_X, 'swipeX');
                ig.input.bind(ig.KEY.SWIPE_Y, 'swipeY');
                ig.input.bind(ig.KEY.SWIPE_LEFT, 'swipeLeft');
                ig.input.bind(ig.KEY.SWIPE_RIGHT, 'swipeRight');
                ig.input.bind(ig.KEY.SWIPE_UP, 'swipeUp');
                ig.input.bind(ig.KEY.SWIPE_DOWN, 'swipeDown');

                // arrows

                ig.input.bind(ig.KEY.LEFT_ARROW, 'left');
                ig.input.bind(ig.KEY.RIGHT_ARROW, 'right');
                ig.input.bind(ig.KEY.UP_ARROW, 'up');
                ig.input.bind(ig.KEY.DOWN_ARROW, 'down');

                // wasd

                ig.input.bind(ig.KEY.A, 'left');
                ig.input.bind(ig.KEY.D, 'right');
                ig.input.bind(ig.KEY.W, 'up');
                ig.input.bind(ig.KEY.S, 'down');

                ig.input.bind(ig.KEY.SPACE, 'jump');

            },

            /**
             * Ends input by removing all bindings set in {@link ig.GameExtended#inputStart}.
             **/
            inputEnd: function() {

                //touch

                ig.input.unbind(ig.KEY.MOUSE1, 'touch');
                ig.input.unbind(ig.KEY.MOUSE2, 'touch');
                ig.input.unbind(ig.KEY.TAP, 'tap');
                ig.input.unbind(ig.KEY.TAP_DOUBLE, 'tapDouble');
                ig.input.unbind(ig.KEY.HOLD, 'hold');
                ig.input.unbind(ig.KEY.HOLD_ACTIVATE, 'holdActivate');
                ig.input.unbind(ig.KEY.SWIPE, 'swipe');
                ig.input.unbind(ig.KEY.SWIPE_X, 'swipeX');
                ig.input.unbind(ig.KEY.SWIPE_Y, 'swipeY');
                ig.input.unbind(ig.KEY.SWIPE_LEFT, 'swipeLeft');
                ig.input.unbind(ig.KEY.SWIPE_RIGHT, 'swipeRight');
                ig.input.unbind(ig.KEY.SWIPE_UP, 'swipeUp');
                ig.input.unbind(ig.KEY.SWIPE_DOWN, 'swipeDown');

                // arrows

                ig.input.unbind(ig.KEY.LEFT_ARROW, 'left');
                ig.input.unbind(ig.KEY.RIGHT_ARROW, 'right');
                ig.input.unbind(ig.KEY.UP_ARROW, 'up');
                ig.input.unbind(ig.KEY.DOWN_ARROW, 'down');

                // wasd

                ig.input.unbind(ig.KEY.A, 'left');
                ig.input.unbind(ig.KEY.D, 'right');
                ig.input.unbind(ig.KEY.W, 'up');
                ig.input.unbind(ig.KEY.S, 'down');

                ig.input.unbind(ig.KEY.SPACE, 'jump');

            },

            /**
             * Handles input just before entities are updated. If a tap targets a UI element, it will intercept that tap and nothing else will receive it.
             **/
            handleInput: function() {

                var i, il;
                var j, jl;
                var inputPoints;
                var inputPoint;
                var targets;
                var target;

                // tapping

                if (ig.input.released('tap')) {

                    // find all inputs that are tapping

                    inputPoints = ig.input.getInputPoints(['tapped'], [true]);

                    for (i = 0, il = inputPoints.length; i < il; i++) {

                        inputPoint = inputPoints[i];
                        targets = inputPoint.targets;

                        if (targets.length > 0) {

                            // check input targets

                            for (j = 0, jl = targets.length; j < jl; j++) {

                                target = targets[j];

                                // target is UI and fixed

                                if (target.type & ig.EntityExtended.TYPE.UI && target.fixed) {

                                    // toggle activation

                                    target.toggleActivate();

                                    // probably don't want to allow
                                    // this input point for tapping again or
                                    // multiple ui elements to be tapped at once

                                    inputPoint.tapped = false;

                                    if (il === 1) {

                                        ig.input.delayedKeyup.tap = false;

                                    }

                                    break;

                                }

                            }

                        }

                    }

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
            update: function() {

                var i, il;
                var layer;

                // handle deferred

                this.deferring = false;

                this._removeDeferredLayers();

                this._addDeferredLayers();

                this._changeDeferredLayers();

                this._removeDeferredItems();

                this._addDeferredItems();

                this._advanceDeferredNext();

                // load new level

                if (this._levelToLoad) {

                    this.loadLevel();

                }
                // build new level
                else if (this._levelNeedsBuild) {

                    this.buildLevel();

                }
                // only unload current level
                else if (this._levelNeedsUnload) {

                    this.unloadLevel();

                }

                if (this._gameNeedsResize) {

                    this.resize(this._gameForceResize);

                }

                this.deferring = true;

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

                ig.TWEEN.update();

                // input

                ig.input.update();
                this.handleInput();

                if (this.playerManager) {

                    this.playerManager.update();

                }

                // execute update and associated functions for all applicable layers

                this.changed = this.changedLights = false;

                for (i = 0, il = this.layers.length; i < il; i++) {

                    var layer = this.layers[i];

                    layer.update();

                    this.changed |= layer.changed;
                    this.changedLights |= layer.changedLights;

                }

                // background animations

                for (var tileset in this.backgroundAnims) {

                    var anims = this.backgroundAnims[tileset];

                    for (i in anims) {

                        anims[i].update();

                    }

                }

                // camera

                if (this.camera) {

                    this.camera.update();

                }

                // clean

                this.dirtyEntities = this.dirtyLights = false;

            },

            /**
             * Update entities in layer.
             * <span class="alert"><strong>IMPORTANT:</strong> normally, you will not need to call this function.</span>
             * @param {String} layerName layer name.
             **/
            updateEntities: function(layerName) {

                var layer = this.layersMap[layerName];

                if (layer) {

                    var items = layer.items;

                    for (var i = 0, il = items.length; i < il; i++) {

                        var item = items[i];

                        item.update();

                    }

                }

            },

            /**
             * Draws game.
             * <br>- clears canvas
             * <br>- records rounded screen pos
             * <br>- draws all layers
             **/
            draw: function() {

                // clear screen

                if (this.clearColor) {
                    ig.system.clear(this.clearColor);
                }

                // get rounded screen position

                this._rscreen.x = ig.system.getDrawPos(this.screen.x) / ig.system.scale;
                this._rscreen.y = ig.system.getDrawPos(this.screen.y) / ig.system.scale;

                // draw all layers

                for (var i = 0, il = this.layers.length; i < il; i++) {

                    this.layers[i].draw();

                }

            },

            /**
             * Draws all entities (items) on a layer.
             * <span class="alert"><strong>IMPORTANT:</strong> normally, you will not need to call this function.</span>
             * @param {String} [layerName] layer name.
             **/
            drawEntities: function(layerName) {

                var layer = this.layersMap[layerName];

                if (layer) {

                    var entities = layer.items;

                    for (var i = 0, il = entities.length; i < il; i++) {
                        entities[i].draw();
                    }

                }

            },

            /**
             * Resize the canvas based on the window.
             * <span class="alert alert-info"><strong>Tip:</strong> use this to resize Impact++ properly.</span>
             * @param {Boolean} [force=false] whether to force global resize (only do this when absolutely necessary).
             **/
            resize: function(force) {

                // get new size

                var width = _c.GAME_WIDTH_PCT ? ig.global.innerWidth * _c.GAME_WIDTH_PCT : _c.GAME_WIDTH;
                var height = _c.GAME_HEIGHT_PCT ? ig.global.innerHeight * _c.GAME_HEIGHT_PCT : _c.GAME_HEIGHT;
                var scale = _c.SCALE;

                // check view against new size

                if (_c.GAME_WIDTH_VIEW || _c.GAME_HEIGHT_VIEW) {

                    var viewWidth = _c.GAME_WIDTH_VIEW || 1;
                    var viewHeight = _c.GAME_HEIGHT_VIEW || 1;
                    scale = Math.floor(Math.max(Math.min(width / viewWidth, height / viewHeight), 1));

                }

                scale = Math.min(Math.max(scale, _c.SCALE_MIN), _c.SCALE_MAX);
                var scaleReciprocal = (1 / scale);

                ig.system.resize(width * scaleReciprocal, height * scaleReciprocal, scale, force || this._gameForceResize);
                this._gameNeedsResize = this._gameForceResize = false;

            },

            /**
             * Resizes game on next update and is much better on performance (max of 1 resize per update).
             */
            resizeDeferred: function(force) {

                this._gameNeedsResize = true;
                this._gameForceResize = force || false;

            }

        });

        /**
         * Updated sorting methods to handle different types of items in layers.
         */
        ig.Game.SORT.Z_INDEX = function(a, b) {
            return (a.zIndex || 0) - (b.zIndex || 0);
        };

        ig.Game.SORT.POS_X = function(a, b) {
            return ((a.pos && a.size && (a.pos.x + a.size.x)) || 0) - ((b.pos && b.size && (b.pos.x + b.size.x)) || 0);
        };

        ig.Game.SORT.POS_Y = function(a, b) {
            return ((a.pos && a.size && (a.pos.y + a.size.y)) || 0) - ((b.pos && b.size && (b.pos.y + b.size.y)) || 0);
        };

        ig.GameExtended.SORT = ig.Game.SORT;

    });
