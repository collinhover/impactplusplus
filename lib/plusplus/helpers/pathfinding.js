ig.module(
    'plusplus.helpers.pathfinding'
)
    .requires(
        'plusplus.core.config',
        'plusplus.core.collision-map',
        'plusplus.core.pathfinding-map',
        'plusplus.helpers.utilsmath',
        'plusplus.helpers.utilstile',
        'plusplus.helpers.utilsintersection'
)
    .defines(function() {
        "use strict";

        var _c = ig.CONFIG;
        var _utm = ig.utilsmath;
        var _utt = ig.utilstile;
        var _uti = ig.utilsintersection;

        var COLLISION_TILE_ONE_WAY_UP = _c.COLLISION.TILE_ONE_WAY_UP;
        var COLLISION_TILE_ONE_WAY_DOWN = _c.COLLISION.TILE_ONE_WAY_DOWN;
        var COLLISION_TILE_ONE_WAY_RIGHT = _c.COLLISION.TILE_ONE_WAY_RIGHT;
        var COLLISION_TILE_ONE_WAY_LEFT = _c.COLLISION.TILE_ONE_WAY_LEFT;
        var COLLISION_TILE_CLIMBABLE_WITH_TOP = _c.COLLISION.TILE_CLIMBABLE_WITH_TOP;
        var COLLISION_TILE_CLIMBABLE_STAIRS_WITH_TOP = _c.COLLISION.TILE_CLIMBABLE_STAIRS_WITH_TOP;
        var COLLISION_TILES_HASH_WALKABLE = _c.COLLISION.TILES_HASH_WALKABLE;
        var COLLISION_TILES_HASH_SLOPED = _c.COLLISION.TILES_HASH_SLOPED;
        var COLLISION_TILES_HASH_CLIMBABLE = _c.COLLISION.TILES_HASH_CLIMBABLE;
        var COLLISION_TILES_HASH_ONE_WAY = _c.COLLISION.TILES_HASH_ONE_WAY;

        var WEIGHTED = _c.PATHFINDING.WEIGHTED;
        var WEIGHT = _c.PATHFINDING.WEIGHT;
        var WEIGHT_AWAY_FROM = _c.PATHFINDING.WEIGHT_AWAY_FROM;
        var ALLOW_DIAGONAL = _c.PATHFINDING.ALLOW_DIAGONAL;
        var DIAGONAL_REQUIRES_BOTH_DIRECT = _c.PATHFINDING.DIAGONAL_REQUIRES_BOTH_DIRECT;
        var AWAY_FROM_DISTANCE = _c.PATHFINDING.AWAY_FROM_DISTANCE;
        var AWAY_FROM_MAX_NODES = _c.PATHFINDING.AWAY_FROM_MAX_NODES;
        var STRICT_SLOPE_CHECK = _c.PATHFINDING.STRICT_SLOPE_CHECK;

        /**
         * Pathfinding for entities using A*.
         * <br>- some aspects based on PathFinding.js and impact-astar-for-entities
         * <br>- for garbage collector friendly code, path points are nodes from the pathfinding grid (so don't modify the path points).
         * <br>- path is constructed in reverse order to allow user to ".length--" to remove a node when reached, instead of shifting/splicing which is usually worse on performance.
         * <span class="alert"><strong>Tip:</strong> base pathfinding works best when entity size is &lt;= 3x the tilesize. For larger entities, add a {@link ig.PathfindingMap} with green tiles around the middle of your entity's path of travel for best results!</span>
         * <span class="alert alert-danger"><strong>IMPORTANT:</strong> if using a {@link ig.PathfindingMap}, the tilesize must match the {@link ig.CollisionMap}'s tilesize!</span>
         * @memberof ig
         * @namespace ig.pathfinding
         * @author Collin Hover - collinhover.com
         * @author Jakub Siemiatkowski - jsiemiatkowski@gmail.com
         **/
        ig.pathfinding = {};

        /*
         * Collision Map.
         */
        var _collisionMap = null;

        /*
         * Collision Map data.
         */
        var _collisionMapData = null;

        /*
         * Pathfinding Map.
         */
        var _pathfindingMap = null;

        /*
         * Pathfinding Map data.
         */
        var _pathfindingMapData = null;

        /**
         * Map tilesize, calculated on pathfinding rebuild.
         * @type Number
         * @readonly
         * @default
         */
        var _tilesize = ig.pathfinding.tilesize = 1;

        /*
         * Map tilesize reciprocal.
         */
        var _tilesizeReciprocal = 1;

        /*
         * Position object for entity to entity.
         */
        var _positions = {
            from: {
                x: 0.1,
                y: 0.1
            },
            target: {
                x: 0.1,
                y: 0.1
            }
        };

        /*
         * Grid of nodes built from map data.
         */
        var _grid = [];

        /*
         * Open nodes list.
         */
        var _open = [];

        /*
         * Closed nodes list.
         */
        var _closed = [];

        function _cleanup() {

            var i, il;

            for (i = 0, il = _open.length; i < il; i++) {

                _open[i].cleanup();

            }

            for (i = 0, il = _closed.length; i < il; i++) {

                _closed[i].cleanup();

            }

            _open.length = _closed.length = 0;

        }

        /**
         * Heuristic functions used for calculating distances between the nodes.
         * @type {Object}
         */
        var HEURISTIC = ig.pathfinding.HEURISTIC = {
            /**
             * Manhattan distance.
             * @param {Number} dx - Difference in x.
             * @param {Number} dy - Difference in y.
             * @return {Number} dx + dy
             */
            MANHATTAN: function(dx, dy) {
                return dx + dy;
            },

            /**
             * Euclidean distance.
             * @param {Number} dx - Difference in x.
             * @param {Number} dy - Difference in y.
             * @return {Number} sqrt(dx * dx + dy * dy)
             */
            EUCLIDEAN: function(dx, dy) {
                return Math.sqrt(dx * dx + dy * dy);
            },

            /**
             * Chebyshev distance.
             * @param {Number} dx - Difference in x.
             * @param {Number} dy - Difference in y.
             * @return {Number} max(dx, dy)
             */
            CHEBYSHEV: function(dx, dy) {
                return Math.max(dx, dy);
            }
        };

        /**
         * Node used in pathfinding calculations.
         * @class
         * @extends ig.Class
         */
        ig.PathNode = ig.Class.extend( /**@lends ig.PathNode.prototype */ {

            /**
             * Node world x position.
             * @type {Number}
             * @default
             */
            x: 0,

            /**
             * Node world y position.
             * @type {Number}
             * @default
             */
            y: 0,

            /**
             * Node grid x index.
             * @type {Number}
             * @default
             */
            gridX: 0,

            /**
             * Node grid y index.
             * @type {Number}
             * @default
             */
            gridY: 0,

            /**
             * Node size.
             * @type {Number}
             * @default
             */
            size: 0,

            /**
             * Whether node is walkable.
             * @type {Boolean}
             * @default
             */
            walkable: true,

            /**
             * Whether node is likely in the air / ungrounded.
             * @type {Boolean}
             * @default
             */
            ungrounded: true,

            /**
             * Whether node is inside the level based on whether node position is inside {@link ig.GameExtended#shapesLevel}.
             * @type {Boolean}
             * @default
             */
            insideLevel: true,

            /**
             * Id of tile node corresponds to.
             * @type {Number}
             * @default
             */
            tile: 0,

            /**
             * Whether node is sloped.
             * <br>- set automatically by tile check
             * @type {Boolean}
             * @default
             */
            sloped: false,

            /**
             * Normal of slope if node is sloped.
             * <br>- set automatically by tile check
             * @type {Object}
             * @default
             */
            slopeNormal: {
                x: 0,
                y: 0
            },

            /**
             * Whether node is along a smooth slope.
             * <br>- set automatically by tile check
             * @type {Boolean}
             * @default
             */
            slopedAlong: false,

            /**
             * Map of smooth slopes node is along. Currently only supports left and right.
             * <br>- set automatically by tile check
             * @type {Boolean}
             * @default
             */
            slopesAlongMap: {},

            /**
             * Whether node is next to a node that is sloped.
             * <br>- set automatically by tile check
             * @type {Boolean}
             * @default
             */
            slopedNeighbor: false,

            /**
             * Map of neighbors that are sloped.
             * <br>- set automatically by tile check
             * @type {Object}
             * @default
             */
            slopedNeighborMap: {},

            /**
             * Whether node is climbable.
             * <br>- set automatically by tile check
             * @type {Boolean}
             * @default
             */
            climbable: false,

            /**
             * Whether node is one way.
             * <br>- set automatically by tile check
             * @type {Boolean}
             * @default
             */
            oneWay: false,

            /**
             * Facing direction of one way.
             * <br>- set automatically by tile check
             * @type {Vector2|Object}
             * @default 0 x 0
             */
            oneWayFacing: {
                x: 0,
                y: 0
            },

            /**
             * Weight percent between 0 and 1, where 0 is best, 0.5 is neutral, and 1 is worst.
             * <br>- this controls the how much of the modifiers applied to the weight by ig.pathfinding.WEIGHT
             * @type {Number}
             * @default
             */
            weightPct: 1,

            /**
             * Weight value between 0 and infinity.
             * @type {Number}
             * @default
             */
            weight: 0,

            /**
             * Walkable neighbors of node, including direct and diagonal.
             * @type {Array}
             * @default
             */
            neighbors: null,

            /**
             * Walkable direct neighbors of node.
             * @type {Array}
             * @default
             */
            directNeighbors: null,

            /**
             * Neighbors, walkable or otherwise, by direction.
             * @type {Object}
             * @property top
             * @property bottom
             * @property left
             * @property right
             * @property topleft
             * @property topright
             * @property bottomleft
             * @property bottomright
             */
            neighborMap: {},

            /**
             * Whether node is on a corner.
             * <br>- set automatically by tile check
             * @type {Boolean}
             * @default
             */
            corner: false,

            /**
             * Corners by name.
             * @type {Object}
             */
            cornerMap: {},

            // internal properties, do not modify
            // these are all reset after each check

            // whether node has been closed

            closed: false,

            // whether node has been opened

            opened: false,

            // index of node in open list for faster resort

            openIndex: 0,

            // previous node in current path

            prevNode: null,

            // distance

            g: 0,

            // weighted distance

            w: 0,

            // heuristic

            h: 0,

            // total cost to node

            f: 0,

            /**
             * Initializes a node for pathfinding.
             * @param {Number} x world x
             * @param {Number} y world y
             * @param {Number} gridX grid x index
             * @param {Number} gridY grid y index
             * @param {Boolean} [walkable=true]
             * @param {Number} [tile=0]
             * @param {Object} [settings]
             */
            init: function(x, y, gridX, gridY, walkable, tile) {

                var i, il;

                this.x = x || 0;
                this.y = y || 0;

                this.gridX = gridX || 0;
                this.gridY = gridY || 0;

                this.walkable = typeof walkable !== 'undefined' ? walkable : true;

                this.tile = tile || 0;
                this.climbable = !! COLLISION_TILES_HASH_CLIMBABLE[this.tile];
                this.oneWay = !! COLLISION_TILES_HASH_ONE_WAY[this.tile];
                this.sloped = !! COLLISION_TILES_HASH_SLOPED[this.tile];

                if (this.sloped) {

                    var segmentsDef = _utt.defaultTileSegmentsDef[this.tile];

                    if (segmentsDef) {

                        // first segment with a normal where both x and y are not 0 is our slope

                        for (i = 0, il = segmentsDef.length; i < il; i++) {

                            var normal = segmentsDef[i].normal;

                            if (normal.x && normal.y) {

                                this.slopeNormal = normal;
                                break;

                            }

                        }

                    }

                }

                if (this.oneWay) {

                    if (this.tile === COLLISION_TILE_ONE_WAY_UP || this.tile === COLLISION_TILE_CLIMBABLE_WITH_TOP || this.tile === COLLISION_TILE_CLIMBABLE_STAIRS_WITH_TOP) {

                        this.oneWayFacing.y = -1;

                    } else if (this.tile === COLLISION_TILE_ONE_WAY_DOWN) {

                        this.oneWayFacing.y = 1;

                    }

                    if (this.tile === COLLISION_TILE_ONE_WAY_LEFT) {

                        this.oneWayFacing.x = -1;

                    } else if (this.tile === COLLISION_TILE_ONE_WAY_RIGHT) {

                        this.oneWayFacing.x = 1;

                    }

                }

                if (this.walkable) {

                    if (ig.game.shapesLevel.length) {

                        this.insideLevel = false;

                        for (i = 0, il = ig.game.shapesLevel.length; i < il; i++) {

                            var shape = ig.game.shapesLevel[i];

                            if (_uti.pointInAABB(x, y, shape.x, shape.y, shape.x + shape.size.x, shape.y + shape.size.y) && _uti.pointInPolygon(x - (shape.x + shape.size.x * 0.5), y - (shape.y + shape.size.y * 0.5), shape.vertices)) {

                                this.insideLevel = true;
                                break;

                            }

                        }

                    }

                } else {

                    this.insideLevel = false;

                }

            },

            /**
             * Cleans node after use.
             * <br>- this method is called after each pathfinding on only nodes that were used
             */
            cleanup: function() {

                this.g = this.h = this.f = this.w = this.openIndex = 0;
                this.prevNode = null;
                this.closed = this.opened = false;

            }

        });

        /**
         * Rebuild pathfinding.
         * <br>- this is called automatically by {@link ig.GameExtended#buildLevel} when {@link ig.CONFIG.PATHFINDING.BUILD_WITH_LEVEL} is enabled.
         * <span class="alert alert-danger"><strong>IMPORTANT:</strong> if using a {@link ig.PathfindingMap}, the tilesize must match the {@link ig.CollisionMap}'s tilesize!</span>
         * @param {ig.CollisionMap} collisionMap map to determine walkability of nodes
         * @param {ig.PathfindingMap} [pathfindingMap] map to add settings to each node
         */
        ig.pathfinding.rebuild = function(collisionMap, pathfindingMap) {

            ig.pathfinding.unload();

            _collisionMap = collisionMap;
            _pathfindingMap = pathfindingMap;

            // tilesize mismatch makes us all sad

            if (_collisionMap && _pathfindingMap && _pathfindingMap.tilesize !== _collisionMap.tilesize) {

                throw new Error("Maps tilesize mismatch: pathfinding map and collision map must have the same tilesize!");

            }

            if (_collisionMap) {

                _collisionMapData = _collisionMap.data;
                _tilesize = ig.pathfinding.tilesize = _collisionMap.tilesize;
                _tilesizeReciprocal = 1 / _collisionMap.tilesize;

            }

            if (_pathfindingMap) {

                _pathfindingMapData = _pathfindingMap.data;
                _tilesize = ig.pathfinding.tilesize = _pathfindingMap.tilesize;
                _tilesizeReciprocal = 1 / _pathfindingMap.tilesize;

            }

            ig.pathfinding.rebuildGrid();

        };

        /**
         * Unload pathfinding and clear map, grid, etc.
         * <span class="alert"><strong>IMPORTANT:</strong> this is called automatically by {@link ig.GameExtended#unloadLevel}.</span>
         */
        ig.pathfinding.unload = function() {

            _grid.length = 0;
            _collisionMap = _collisionMapData = _pathfindingMap = _pathfindingMapData = null;
            _tilesize = ig.pathfinding.tilesize = 0;

        };

        /**
         * Rebuild grid from maps.
         * <span class="alert"><strong>IMPORTANT:</strong> do not call this method directly, use {@link ig.pathfinding#rebuild} instead.</span>
         * @private
         */
        ig.pathfinding.rebuildGrid = function() {

            var row;
            var tile;
            var gridRow;
            var node;
            var y, yl;
            var x, xl;
            var worldX, worldY;

            // create basic nodes from collision map

            if (_collisionMap && _collisionMapData) {

                for (y = 0, yl = _collisionMapData.length; y < yl; y++) {

                    row = _collisionMapData[y];
                    gridRow = _grid[y];

                    if (!gridRow) {

                        gridRow = _grid[y] = [];

                    }

                    for (x = 0, xl = row.length; x < xl; x++) {

                        tile = row[x];

                        // precalculate world position of node
                        // and set to center of tile

                        worldX = x * _tilesize + _tilesize * 0.5;
                        worldY = y * _tilesize + _tilesize * 0.5;

                        gridRow[x] = new ig.PathNode(worldX, worldY, x, y, !! COLLISION_TILES_HASH_WALKABLE[tile], tile);

                    }

                }

            }

            // add settings based on pathfinding map

            if (_pathfindingMap && _pathfindingMapData) {

                for (y = 0, yl = _pathfindingMapData.length; y < yl; y++) {

                    row = _pathfindingMapData[y];
                    gridRow = _grid[y];

                    if (!gridRow) {

                        gridRow = _grid[y] = [];

                    }

                    for (x = 0, xl = (!_collisionMap || !_collisionMapData[0] || row.length >= _collisionMapData[0].length ? row.length : _collisionMapData[0].length); x < xl; x++) {

                        tile = row[x] || 0;
                        var settings = _pathfindingMap.tiledef[tile];

                        node = gridRow[x];

                        // when pathfinding map is bigger than collision map
                        // create a new node and set walkable from settings

                        if (!node) {

                            // precalculate world position of node
                            // and set to center of tile

                            worldX = x * _tilesize + _tilesize * 0.5;
                            worldY = y * _tilesize + _tilesize * 0.5;

                            node = gridRow[x] = new ig.PathNode(worldX, worldY, x, y, settings && typeof settings.walkable !== 'undefined' ? settings.walkable : true, tile);

                        }

                        // merge settings into node

                        ig.merge(node, settings);

                    }

                }

            }

            // process each node

            for (y = 0, yl = _grid.length; y < yl; y++) {

                row = _grid[y];

                for (x = 0, xl = row.length; x < xl; x++) {

                    node = row[x];

                    // set size

                    node.size = _tilesize;

                    // neighbors by direction

                    var nm = node.neighborMap;
                    var prevRow = _grid[y - 1];
                    var nextRow = _grid[y + 1];

                    if (prevRow) {

                        nm.top = prevRow[x];

                        if (x > 0) {

                            nm.topleft = prevRow[x - 1];

                        }

                        if (x < xl - 1) {

                            nm.topright = prevRow[x + 1];

                        }

                    }

                    if (x > 0) {

                        nm.left = row[x - 1];

                    }

                    if (x < xl - 1) {

                        nm.right = row[x + 1];

                    }

                    if (nextRow) {

                        nm.bottom = nextRow[x];

                        if (x > 0) {

                            nm.bottomleft = nextRow[x - 1];

                        }

                        if (x < xl - 1) {

                            nm.bottomright = nextRow[x + 1];

                        }

                    }

                    // is node in the air?

                    node.ungrounded = !nm.bottom || (nm.bottom.walkable && nm.bottom.oneWayFacing.y >= 0);

                    // is node a corner?

                    if (nm.top && nm.top.walkable && (nm.top.climbable || nm.top.oneWayFacing.y <= 0) && nm.left && nm.left.walkable && (nm.left.climbable || nm.left.oneWayFacing.x <= 0) && (!nm.topleft || (!nm.topleft.walkable && !nm.topleft.sloped))) {

                        node.corner = node.cornerMap.topleft = true;

                    }

                    if (nm.top && nm.top.walkable && (nm.top.climbable || nm.top.oneWayFacing.y <= 0) && nm.right && nm.right.walkable && (nm.right.climbable || nm.right.oneWayFacing.x >= 0) && (!nm.topright || (!nm.topright.walkable && !nm.topright.sloped))) {

                        node.corner = node.cornerMap.topright = true;

                    }

                    if (nm.bottom && nm.bottom.walkable && (nm.bottom.climbable || nm.bottom.oneWayFacing.y >= 0) && nm.left && nm.left.walkable && (nm.left.climbable || nm.left.oneWayFacing.x <= 0) && (!nm.bottomleft || (!nm.bottomleft.walkable && !nm.bottomleft.sloped))) {

                        node.corner = node.cornerMap.bottomleft = true;

                    }

                    if (nm.bottom && nm.bottom.walkable && (nm.bottom.climbable || nm.bottom.oneWayFacing.y >= 0) && nm.right && nm.right.walkable && (nm.right.climbable || nm.right.oneWayFacing.x >= 0) && (!nm.bottomright || (!nm.bottomright.walkable && !nm.bottomright.sloped))) {

                        node.corner = node.cornerMap.bottomright = true;

                    }

                    // is node next to sloped?

                    if (nm.top && nm.top.sloped) {

                        node.slopedNeighbor = node.slopedNeighborMap.top = true;

                    }

                    if (nm.bottom && nm.bottom.sloped) {

                        node.slopedNeighbor = node.slopedNeighborMap.bottom = true;

                    }

                    if (nm.right && nm.right.sloped) {

                        node.slopedNeighbor = node.slopedNeighborMap.right = true;

                    }

                    if (nm.left && nm.left.sloped) {

                        node.slopedNeighbor = node.slopedNeighborMap.left = true;

                    }

                    if (nm.topleft && nm.topleft.sloped) {

                        node.slopedNeighbor = node.slopedNeighborMap.topleft = true;

                    }

                    if (nm.topright && nm.topright.sloped) {

                        node.slopedNeighbor = node.slopedNeighborMap.topright = true;

                    }

                    if (nm.bottomleft && nm.bottomleft.sloped) {

                        node.slopedNeighbor = node.slopedNeighborMap.bottomleft = true;

                    }

                    if (nm.bottomright && nm.bottomright.sloped) {

                        node.slopedNeighbor = node.slopedNeighborMap.bottomright = true;

                    }

                    node.slopesAlongMap.top = false;
                    node.slopesAlongMap.bottom = node.walkable && !node.oneWay && nm.bottom && nm.bottom.sloped;

                    if (ig.pathfinding.getIsAlongSlope(node, -1, 0)) {

                        node.slopesAlongMap.left = node.slopedAlong = true;

                    }

                    if (ig.pathfinding.getIsAlongSlope(node, 1, 0)) {

                        node.slopesAlongMap.right = node.slopedAlong = true;

                    }

                    if (ig.pathfinding.getIsAlongSlope(node, -1, -1)) {

                        node.slopesAlongMap.topleft = node.slopedAlong = true;

                    }

                    if (ig.pathfinding.getIsAlongSlope(node, 1, -1)) {

                        node.slopesAlongMap.topright = node.slopedAlong = true;

                    }

                    if (ig.pathfinding.getIsAlongSlope(node, -1, 1)) {

                        node.slopesAlongMap.bottomleft = node.slopedAlong = true;

                    }

                    if (ig.pathfinding.getIsAlongSlope(node, 1, 1)) {

                        node.slopesAlongMap.bottomright = node.slopedAlong = true;

                    }

                    // walkable neighbors

                    node.directNeighbors = ig.pathfinding.getDirectNeighbors(node);
                    node.neighbors = [].concat(node.directNeighbors, ig.pathfinding.getDiagonalNeighbors(node));

                }

            }

        };

        /**
         * Get the path to target entity from another entity.
         * @param {ig.EntityExtended} entityPathing entity to find path for
         * @param {ig.EntityExtended} entityTarget entity to find path to
         * @param {Boolean} [avoidEntities=false] whether to try to avoid entities
         * @param {Number} [searchDistance=infinity] maximum positive distance to search
         * @param {String} [heuristicType] Type of heuristic function to use
         * @returns {Array} path as a list of points with x and y properties.
         **/
        ig.pathfinding.getPathToEntity = function(entityPathing, entityTarget, avoidEntities, searchDistance, heuristicType) {

            var positions = ig.pathfinding.getPositionPathfindingEntities(entityPathing, entityTarget, _positions);

            return ig.pathfinding.getPathTo(
                positions.from.x, positions.from.y, positions.target.x, positions.target.y,
                avoidEntities, searchDistance, entityPathing, entityTarget, heuristicType
            );

        };

        /**
         * Get the path to a point from an entity.
         * @param {ig.EntityExtended} entityPathing entity to find path for
         * @param {Number} targetX x position to path to
         * @param {Number} targetY y position to path to
         * @param {Boolean} [avoidEntities=false] whether to try to avoid entities
         * @param {Number} [searchDistance=infinity] maximum positive distance to search
         * @param {ig.EntityExtended} [entityTarget] entity to find path to
         * @param {String} [heuristicType] Type of heuristic function to use
         * @returns {Array} path as a list of points with x and y properties.
         **/
        ig.pathfinding.getPathToPoint = function(entityPathing, targetX, targetY, avoidEntities, searchDistance, entityTarget, heuristicType) {

            var from = ig.pathfinding.getPositionPathfindingPoint(entityPathing, targetX, targetY, _positions.from);

            return ig.pathfinding.getPathTo(
                from.x, from.y, targetX, targetY,
                avoidEntities, searchDistance, entityPathing, entityTarget, heuristicType
            );

        };

        /**
         * Get the path to target point.
         * @param {Number} fromX x position to start from
         * @param {Number} fromY y position to start from
         * @param {Number} targetX x position to path to
         * @param {Number} targetY y position to path to
         * @param {Boolean} [avoidEntities=false] whether to try to avoid entities
         * @param {Number} [searchDistance=infinity] maximum positive distance to search
         * @param {ig.EntityExtended} [entityPathing] entity to find path for
         * @param {ig.EntityExtended} [entityTarget] entity to find path to
         * @param {String} [heuristicType] Type of heuristic function to use
         * @returns {Array} path as a list of points with x and y properties.
         **/
        ig.pathfinding.getPathTo = function(fromX, fromY, targetX, targetY, avoidEntities, searchDistance, entityPathing, entityTarget, heuristicType) {

            // init path

            var path;

            if (entityPathing && entityPathing.path) {

                path = entityPathing.path;
                path.length = 0;

            } else {

                path = [];

            }

            // check for empty grid

            var grid = _grid;

            if (grid.length === 0) {

                return path;

            }

            // get the map information

            var gridFromX = Math.floor(fromX * _tilesizeReciprocal);
            var gridFromY = Math.floor(fromY * _tilesizeReciprocal);
            var gridDestinationX = Math.floor(targetX * _tilesizeReciprocal);
            var gridDestinationY = Math.floor(targetY * _tilesizeReciprocal);
            var startNode = grid[gridFromY] && grid[gridFromY][gridFromX];
            var destinationNode = grid[gridDestinationY] && grid[gridDestinationY][gridDestinationX];

            // start or destination nodes must be within map and start cannot be the destination

            if (!startNode || !destinationNode || startNode === destinationNode) {

                return path;

            }

            var open = _open;
            var closed = _closed;
            var heuristic = HEURISTIC[heuristicType || 'MANHATTAN'];
            var abs = Math.abs;
            var SQRT2 = Math.SQRT2;
            var neighbors;
            var neighbor;
            var openNode;
            var i, il;
            var j, jl;

            // when pathing entity present

            var tilesize = _tilesize;
            var entityPathingSize = tilesize;
            var needsAvoidEntityCheck;
            var diagonalDouble;
            var nodeHasCollidingEntities;
            var neighborMap;
            var diagonalUnsafe;
            var topleft;
            var topright;
            var bottomleft;
            var bottomright;
            var diagonalStartIndex;

            if (entityPathing) {

                entityPathingSize = Math.max(entityPathing.size.x, entityPathing.size.y);
                diagonalDouble = ALLOW_DIAGONAL && DIAGONAL_REQUIRES_BOTH_DIRECT;

                // avoiding other entities

                if (avoidEntities) {

                    needsAvoidEntityCheck = true;
                    nodeHasCollidingEntities = ig.pathfinding.nodeHasCollidingEntities;

                }

            }

            // when target entity present

            var needsDistCheck;

            if (entityTarget && searchDistance > 0) {

                needsDistCheck = true;
                searchDistance *= _tilesizeReciprocal;
                searchDistance *= searchDistance;

            } else {

                needsDistCheck = false;

            }

            // add start as first open node

            open.push(startNode);

            // until the destination is found work off the open nodes

            while (open.length > 0) {

                // get best open node

                var currentNode = open.pop();
                var gridCurrentX = currentNode.gridX;
                var gridCurrentY = currentNode.gridY;

                // add the current node to the closed list

                closed.push(currentNode);
                currentNode.closed = true;

                // we're at the destination
                // go up the path chain to recreate the path

                if (currentNode === destinationNode) {

                    while (currentNode) {

                        path.push(currentNode);
                        currentNode = currentNode.prevNode;

                    }

                    _cleanup();

                    return path;

                }

                // get neighbors of the current node

                neighbors = currentNode.neighbors;
                il = neighbors.length;

                // setup for diagonal

                if (diagonalDouble) {

                    // when pathing entity size is bigger than tilesize
                    // to avoid getting entity caught on corners
                    // it should probably only be allowed to walk on straight tiles
                    // unless node is surrounded by walkable neighbors

                    if (entityPathingSize > tilesize && il < 8 && !currentNode.slopedNeighbor) {

                        neighbors = currentNode.directNeighbors;
                        il = neighbors.length;
                        diagonalStartIndex = -1;
                        diagonalUnsafe = false;

                    }
                    // otherwise prep for diagonal fix when avoiding entities on straight
                    else {

                        neighborMap = currentNode.neighborMap;
                        topleft = topright = bottomleft = bottomright = diagonalUnsafe = false;
                        diagonalStartIndex = (il * 0.5) | 0 + 1;

                    }

                }

                for (i = 0; i < il; i++) {

                    neighbor = neighbors[i];

                    // neighbor already tried

                    if (neighbor.closed) {

                        continue;

                    }

                    var gridX = neighbor.gridX;
                    var gridY = neighbor.gridY;

                    if (neighbor !== destinationNode) {

                        // don't search outside range

                        if (needsDistCheck) {

                            var deltaX = gridX - gridDestinationX;
                            var deltaY = gridY - gridDestinationY;

                            if (deltaX * deltaX + deltaY * deltaY > searchDistance) {

                                continue;

                            }

                        }

                        // avoid colliding entities

                        if (needsAvoidEntityCheck) {

                            // diagonal may be unsafe to walk when direct has colliding entity

                            if (diagonalUnsafe && ((topleft && neighbor === neighborMap.topleft) || (topright && neighbor === neighborMap.topright) || (bottomleft && neighbor === neighborMap.bottomleft) || (bottomright && neighbor === neighborMap.bottomright))) {

                                continue;

                            } else if (nodeHasCollidingEntities(neighbor, currentNode, entityPathing, entityTarget)) {

                                // when diagonal movement requires walkable on both direct nodes
                                // then a direct node with a colliding entity automatically rules out the diagonal
                                // direct neighbors are always in the first half of neighbor list

                                if (diagonalDouble && i < diagonalStartIndex) {

                                    if (neighbor === neighborMap.top) {

                                        diagonalUnsafe = topleft = topright = true;

                                    }

                                    if (neighbor === neighborMap.bottom) {

                                        diagonalUnsafe = bottomleft = bottomright = true;;

                                    }

                                    if (neighbor === neighborMap.left) {

                                        diagonalUnsafe = topleft = bottomleft = true;

                                    }

                                    if (neighbor === neighborMap.right) {

                                        diagonalUnsafe = topright = bottomright = true;

                                    }

                                }

                                continue;

                            }

                        }

                    }

                    // get the distance between current node and the neighbor to find the next g value

                    var dg = (gridX - gridCurrentX) === 0 || (gridY - gridCurrentY) === 0 ? 1 : SQRT2;
                    var ng = currentNode.g + dg;

                    // add the weighted distance between current node and the neighbor

                    var nw;

                    if (WEIGHTED) {

                        nw = currentNode.w + dg + neighbor.weight + WEIGHT * neighbor.weightPct;

                    } else {

                        nw = ng;

                    }

                    // check if the neighbor has not been inspected yet, or
                    // can be reached with smaller cost from the current node

                    if (!neighbor.opened || nw < neighbor.w) {

                        neighbor.g = ng;
                        neighbor.w = nw;
                        neighbor.h = neighbor.h || heuristic(abs(gridX - gridDestinationX), abs(gridY - gridDestinationY));
                        neighbor.f = neighbor.w + neighbor.h;
                        neighbor.prevNode = currentNode;

                        if (!neighbor.opened) {

                            neighbor.opened = true;

                            // insert sort neighbor into the open list
                            // where index 0 = highest value

                            for (j = open.length; j > 0; j--) {

                                openNode = open[j - 1];

                                if (neighbor.f <= openNode.f) {

                                    break;

                                } else {

                                    openNode.openIndex = j;
                                    open[j] = openNode;

                                }

                            }

                            neighbor.openIndex = j;
                            open[j] = neighbor;

                        } else {

                            // neighbor can be reached with smaller cost
                            // we need to shift it up, towards the end of the list

                            var shifted;

                            for (j = neighbor.openIndex, jl = open.length - 1; j < jl; j++) {

                                openNode = open[j + 1];

                                if (openNode.f <= neighbor.f) {

                                    shifted = true;
                                    break;

                                } else {

                                    openNode.openIndex = j;
                                    open[j] = openNode;

                                }

                            }

                            if (!shifted) {

                                j = open.length;

                            }

                            neighbor.openIndex = j;
                            open[j] = neighbor;

                        }

                    }

                }

            }

            _cleanup();

            return path;

        };

        /**
         * Get the path that goes furthest away from a target entity for another entity.
         * @param {ig.EntityExtended} entityPathing entity to find path for
         * @param {ig.EntityExtended} entityTarget entity to find path away from
         * @param {Boolean} [avoidEntities=false] whether to try to avoid entities
         * @param {Number} [searchDistance=ig.pathfinding.AWAY_FROM_DISTANCE] distance to flee
         * @param {String} [heuristicType] Type of heuristic function to use
         * @returns {Array} path as a list of points with x and y properties.
         **/
        ig.pathfinding.getPathAwayFromEntity = function(entityPathing, entityTarget, avoidEntities, searchDistance, heuristicType) {

            return ig.pathfinding.getPathAwayFrom(
                entityPathing.pos.x + entityPathing.size.x * 0.5,
                entityPathing.pos.y + entityPathing.size.y * 0.5,
                entityTarget.pos.x + entityTarget.size.x * 0.5,
                entityTarget.pos.y + entityTarget.size.y * 0.5,
                avoidEntities, searchDistance, entityPathing, heuristicType
            );

        };

        /**
         * Get a path that goes furthest away from a point for an entity.
         * @param {ig.EntityExtended} entityPathing entity to find path for
         * @param {Number} awayFromX x position to path away from
         * @param {Number} awayFromY y position to path away from
         * @param {Boolean} [avoidEntities=false] whether to try to avoid entities
         * @param {Number} [searchDistance=ig.pathfinding.AWAY_FROM_DISTANCE] distance to flee
         * @param {String} [heuristicType] Type of heuristic function to use
         * @returns {Array} path as a list of points with x and y properties.
         **/
        ig.pathfinding.getPathAwayFromPoint = function(entityPathing, awayFromX, awayFromY, avoidEntities, searchDistance, heuristicType) {

            return ig.pathfinding.getPathAwayFrom(
                entityPathing.pos.x + entityPathing.size.x * 0.5,
                entityPathing.pos.y + entityPathing.size.y * 0.5,
                awayFromX, awayFromY, avoidEntities, searchDistance, entityPathing, heuristicType
            );

        };

        /**
         * Get a path that goes furthest away from a point.
         * @param {Number} fromX x position to start from
         * @param {Number} fromY y position to start from
         * @param {Number} awayFromX x position to path away from
         * @param {Number} awayFromY y position to path away from
         * @param {Boolean} [avoidEntities=false] whether to try to avoid entities
         * @param {Number} [searchDistance=ig.pathfinding.AWAY_FROM_DISTANCE] distance to flee
         * @param {ig.EntityExtended} [entityPathing] entity to find path for
         * @param {String} [heuristicType] Type of heuristic function to use
         * @returns {Array} path as a list of points with x and y properties.
         **/
        ig.pathfinding.getPathAwayFrom = function(fromX, fromY, awayFromX, awayFromY, avoidEntities, searchDistance, entityPathing, heuristicType) {

            // init path

            var path;

            if (entityPathing && entityPathing.path) {

                path = entityPathing.path;
                path.length = 0;

            } else {

                path = [];

            }

            // check for empty grid

            var grid = _grid;

            if (grid.length === 0) {

                return path;

            }

            // get the map information

            var gridFromX = Math.floor(fromX * _tilesizeReciprocal);
            var gridFromY = Math.floor(fromY * _tilesizeReciprocal);
            var gridAwayFromX = Math.floor(awayFromX * _tilesizeReciprocal);
            var gridAwayFromY = Math.floor(awayFromY * _tilesizeReciprocal);
            var startNode = grid[gridFromY] && grid[gridFromY][gridFromX];
            var awayFromNode = grid[gridAwayFromY] && grid[gridAwayFromY][gridAwayFromX];

            // start or away from node is invalid

            if (!startNode || !awayFromNode) {

                return path;

            }

            var open = _open;
            var closed = _closed;
            var heuristic = HEURISTIC[heuristicType || 'MANHATTAN'];
            var abs = Math.abs;
            var SQRT2 = Math.SQRT2;
            var neighbors;
            var neighbor;
            var openNode;
            var i, il;
            var j, jl;

            // when pathing entity present

            var tilesize = _tilesize;
            var entityPathingSize = tilesize;
            var needsAvoidEntityCheck;
            var diagonalDouble;
            var nodeHasCollidingEntities;
            var neighborMap;
            var diagonalUnsafe;
            var topleft;
            var topright;
            var bottomleft;
            var bottomright;
            var diagonalStartIndex;

            if (entityPathing) {

                entityPathingSize = Math.max(entityPathing.size.x, entityPathing.size.y);
                diagonalDouble = ALLOW_DIAGONAL && DIAGONAL_REQUIRES_BOTH_DIRECT;

                // avoiding other entities

                if (avoidEntities) {

                    needsAvoidEntityCheck = true;
                    nodeHasCollidingEntities = ig.pathfinding.nodeHasCollidingEntities;

                }

            }

            // setup search distance

            if (searchDistance > 0) {

                searchDistance *= _tilesizeReciprocal;

            } else {

                searchDistance = AWAY_FROM_DISTANCE * _tilesizeReciprocal;

            }

            searchDistance *= searchDistance;

            // add start as first open node

            open.push(startNode);

            var bestCost = Infinity;
            var bestDistance = -Infinity;
            var bestFleeNode;
            var gridDeltaX = gridFromX - gridAwayFromX;
            var gridDeltaY = gridFromY - gridAwayFromY;
            var gridDistanceAwayStart = gridDeltaX * gridDeltaX + gridDeltaY * gridDeltaY;
            var fleeNode;

            // until the destination is found work off the open nodes

            while (open.length > 0) {

                // get best open node

                var currentNode = open.pop();
                var gridCurrentX = currentNode.gridX;
                var gridCurrentY = currentNode.gridY;

                // add the current node to the closed list

                closed.push(currentNode);
                currentNode.closed = true;

                // check current distance against best
                // and store the best so we can use it
                // in case we've tried as many paths as allowed

                gridDeltaX = gridCurrentX - gridAwayFromX;
                gridDeltaY = gridCurrentY - gridAwayFromY;
                var gridDistanceAway = (gridDeltaX * gridDeltaX + gridDeltaY * gridDeltaY) - gridDistanceAwayStart;

                if (gridDistanceAway > 0 && currentNode.g > 1 && gridDistanceAway > bestDistance && currentNode.w * 0.5 < bestCost) {

                    bestFleeNode = currentNode;
                    bestCost = currentNode.w;
                    bestDistance = gridDistanceAway;

                }

                if (closed.length >= AWAY_FROM_MAX_NODES) {

                    fleeNode = bestFleeNode;

                }

                // we're as far away as we need to be
                // go up the path chain to recreate the path

                if (fleeNode) {

                    while (fleeNode) {

                        path.push(fleeNode);
                        fleeNode = fleeNode.prevNode;

                    }

                    _cleanup();

                    return path;

                }

                // get neighbors of the current node

                neighbors = currentNode.neighbors;
                il = neighbors.length;

                // setup for diagonal

                if (diagonalDouble) {

                    // when pathing entity size is bigger than tilesize
                    // to avoid getting entity caught on corners
                    // it should probably only be allowed to walk on straight tiles
                    // unless node is surrounded by walkable neighbors

                    if (entityPathingSize > tilesize && !currentNode.slopedNeighbor && il < 8) {

                        neighbors = currentNode.directNeighbors;
                        il = neighbors.length;
                        diagonalStartIndex = -1;
                        diagonalUnsafe = false;

                    }
                    // otherwise prep for diagonal fix when avoiding entities on straight
                    else {

                        neighborMap = currentNode.neighborMap;
                        topleft = topright = bottomleft = bottomright = diagonalUnsafe = false;
                        diagonalStartIndex = (il * 0.5) | 0 + 1;

                    }

                }

                for (i = 0; i < il; i++) {

                    neighbor = neighbors[i];

                    // neighbor already tried

                    if (neighbor.closed) {

                        continue;

                    }

                    // avoid colliding entities

                    if (needsAvoidEntityCheck) {

                        // diagonal may be unsafe to walk when direct has colliding entity

                        if (diagonalUnsafe && ((topleft && neighbor === neighborMap.topleft) || (topright && neighbor === neighborMap.topright) || (bottomleft && neighbor === neighborMap.bottomleft) || (bottomright && neighbor === neighborMap.bottomright))) {

                            continue;

                        } else if (nodeHasCollidingEntities(neighbor, currentNode, entityPathing)) {

                            // when diagonal movement requires walkable on both direct nodes
                            // then a direct node with a colliding entity automatically rules out the diagonal
                            // direct neighbors are always in the first half of neighbor list

                            if (diagonalDouble && i < diagonalStartIndex) {

                                if (neighbor === neighborMap.top) {

                                    diagonalUnsafe = topleft = topright = true;

                                }

                                if (neighbor === neighborMap.bottom) {

                                    diagonalUnsafe = bottomleft = bottomright = true;;

                                }

                                if (neighbor === neighborMap.left) {

                                    diagonalUnsafe = topleft = bottomleft = true;

                                }

                                if (neighbor === neighborMap.right) {

                                    diagonalUnsafe = topright = bottomright = true;

                                }

                            }

                            continue;

                        }

                    }

                    var gridX = neighbor.gridX;
                    var gridY = neighbor.gridY;

                    // get the distance between current node and the neighbor to find the next g value

                    var dx = gridX - gridCurrentX;
                    var dy = gridY - gridCurrentY;
                    var dg = dx === 0 || dy === 0 ? 1 : SQRT2;
                    var ng = currentNode.g + dg;

                    // add the weighted distance between current node and the neighbor

                    var dw;

                    if (WEIGHTED) {

                        dw = dg + neighbor.weight + WEIGHT * neighbor.weightPct;

                    } else {

                        dw = dg;

                    }

                    // add weight if this would take us closer to away from position

                    if ((gridDeltaX > 0 && gridDeltaX + dx < gridDeltaX) || (gridDeltaX < 0 && gridDeltaX + dx > gridDeltaX)) {

                        dw += WEIGHT_AWAY_FROM;

                    }

                    if ((gridDeltaY > 0 && gridDeltaY + dy < gridDeltaY) || (gridDeltaY < 0 && gridDeltaY + dy > gridDeltaY)) {

                        dw += WEIGHT_AWAY_FROM;

                    }

                    var nw = currentNode.w + dw;

                    // check if the neighbor has not been inspected yet, or
                    // can be reached with smaller cost from the current node

                    if (!neighbor.opened || nw < neighbor.w) {

                        neighbor.g = ng;
                        neighbor.w = nw;
                        neighbor.h = neighbor.h || heuristic(abs(gridX - gridAwayFromX), abs(gridY - gridAwayFromY));
                        neighbor.f = neighbor.w + neighbor.h;
                        neighbor.prevNode = currentNode;

                        if (!neighbor.opened) {

                            neighbor.opened = true;

                            // insert sort neighbor into the open list
                            // where index 0 = highest value

                            for (j = open.length; j > 0; j--) {

                                openNode = open[j - 1];

                                if (neighbor.f <= openNode.f) {

                                    break;

                                } else {

                                    openNode.openIndex = j;
                                    open[j] = openNode;

                                }

                            }

                            neighbor.openIndex = j;
                            open[j] = neighbor;

                        } else {

                            // neighbor can be reached with smaller cost
                            // we need to shift it up, towards the end of the list

                            var shifted;

                            for (j = neighbor.openIndex, jl = open.length - 1; j < jl; j++) {

                                openNode = open[j + 1];

                                if (openNode.f <= neighbor.f) {

                                    shifted = true;
                                    break;

                                } else {

                                    openNode.openIndex = j;
                                    open[j] = openNode;

                                }

                            }

                            if (!shifted) {

                                j = open.length;

                            }

                            neighbor.openIndex = j;
                            open[j] = neighbor;

                        }

                    }

                }

            }

            _cleanup();

            return path;

        };

        /**
         * Get all walkable neighbors of the given node.
         * @param {ig.pathfinding.Node} node node to get neighbors for
         * @returns {Array} neighbors of node
         * @example
         * // neighbors are precalculated on rebuild
         * // so this is usually a bad idea:
         * var myNeighbors = ig.pathfinding.getNeighbors( myNode );
         * // this is a better idea
         * var myNeighbors = myNode.neighbors;
         */
        ig.pathfinding.getNeighbors = function(node) {

            var neighbors = [];
            var gridX = node.gridX;
            var gridY = node.gridY;
            var grid = _grid;
            var neighbor;

            var row = grid[gridY];
            var prevRow = grid[gridY - 1];
            var nextRow = grid[gridY + 1];

            // direct neighbors

            neighbor = prevRow && prevRow[gridX];
            if (neighbor && neighbor.walkable && ig.pathfinding.isDirectionWalkable(neighbor, 0, -1, node)) {

                neighbors.push(neighbor);
            }

            neighbor = row && row[gridX + 1];
            if (neighbor && neighbor.walkable && ig.pathfinding.isDirectionWalkable(neighbor, 1, 0, node)) {

                neighbors.push(neighbor);

            }

            neighbor = nextRow && nextRow[gridX];
            if (neighbor && neighbor.walkable && ig.pathfinding.isDirectionWalkable(neighbor, 0, 1, node)) {

                neighbors.push(neighbor);

            }

            neighbor = row && row[gridX - 1];
            if (neighbor && neighbor.walkable && ig.pathfinding.isDirectionWalkable(neighbor, -1, 0, node)) {

                neighbors.push(neighbor);

            }

            // diagonal neighbors

            neighbor = prevRow && prevRow[gridX - 1];
            if (neighbor && neighbor.walkable && ig.pathfinding.isDirectionWalkable(neighbor, -1, -1, node)) {

                neighbors.push(neighbor);

            }

            neighbor = prevRow && prevRow[gridX + 1];
            if (neighbor && neighbor.walkable && ig.pathfinding.isDirectionWalkable(neighbor, 1, -1, node)) {

                neighbors.push(neighbor);

            }

            neighbor = nextRow && nextRow[gridX + 1];
            if (neighbor && neighbor.walkable && ig.pathfinding.isDirectionWalkable(neighbor, 1, 1, node)) {

                neighbors.push(neighbor);

            }

            neighbor = nextRow && nextRow[gridX - 1];
            if (neighbor && neighbor.walkable && ig.pathfinding.isDirectionWalkable(neighbor, -1, 1, node)) {

                neighbors.push(neighbor);

            }

            return neighbors;

        };

        /**
         * Get only the direct walkable neighbors of the given node, excluding diagonals.
         * @param {ig.pathfinding.Node} node node to get neighbors for
         * @returns {Array} neighbors of node
         * @example
         * // neighbors are precalculated on rebuild
         * // so this is usually a bad idea:
         * var myNeighbors = ig.pathfinding.getNeighbors( myNode );
         * // this is a better idea
         * var myNeighbors = myNode.neighbors;
         */
        ig.pathfinding.getDirectNeighbors = function(node) {

            var neighbors = [];
            var gridX = node.gridX;
            var gridY = node.gridY;
            var grid = _grid;
            var neighbor;

            var row = grid[gridY];
            var prevRow = grid[gridY - 1];
            var nextRow = grid[gridY + 1];

            neighbor = prevRow && prevRow[gridX];
            if (neighbor && (neighbor.walkable || node.slopesAlongMap.left) && ig.pathfinding.isDirectionWalkable(neighbor, 0, -1, node)) {

                neighbors.push(neighbor);
            }

            neighbor = row && row[gridX + 1];
            if (neighbor && (neighbor.walkable || node.slopesAlongMap.right) && ig.pathfinding.isDirectionWalkable(neighbor, 1, 0, node)) {

                neighbors.push(neighbor);

            }

            neighbor = nextRow && nextRow[gridX];
            if (neighbor && (neighbor.walkable || node.slopesAlongMap.bottom) && ig.pathfinding.isDirectionWalkable(neighbor, 0, 1, node)) {

                neighbors.push(neighbor);

            }

            neighbor = row && row[gridX - 1];
            if (neighbor && neighbor.walkable && ig.pathfinding.isDirectionWalkable(neighbor, -1, 0, node)) {

                neighbors.push(neighbor);

            }

            return neighbors;

        };

        /**
         * Get only the diagonal walkable neighbors of the given node, excluding direct.
         * @param {ig.pathfinding.Node} node node to get neighbors for
         * @returns {Array} neighbors of node
         * @example
         * // neighbors are precalculated on rebuild
         * // so this is usually a bad idea:
         * var myNeighbors = ig.pathfinding.getNeighbors( myNode );
         * // this is a better idea
         * var myNeighbors = myNode.neighbors;
         */
        ig.pathfinding.getDiagonalNeighbors = function(node) {

            var neighbors = [];
            var gridX = node.gridX;
            var gridY = node.gridY;
            var grid = _grid;
            var neighbor;

            var row = grid[gridY];
            var prevRow = grid[gridY - 1];
            var nextRow = grid[gridY + 1];

            neighbor = prevRow && prevRow[gridX - 1];
            if (neighbor && (neighbor.walkable || node.slopesAlongMap.topleft) && ig.pathfinding.isDirectionWalkable(neighbor, -1, -1, node)) {

                neighbors.push(neighbor);

            }

            neighbor = prevRow && prevRow[gridX + 1];
            if (neighbor && (neighbor.walkable || node.slopesAlongMap.topright) && ig.pathfinding.isDirectionWalkable(neighbor, 1, -1, node)) {

                neighbors.push(neighbor);

            }

            neighbor = nextRow && nextRow[gridX + 1];
            if (neighbor && (neighbor.walkable || node.slopesAlongMap.bottomright) && ig.pathfinding.isDirectionWalkable(neighbor, 1, 1, node)) {

                neighbors.push(neighbor);

            }

            neighbor = nextRow && nextRow[gridX - 1];
            if (neighbor && (neighbor.walkable || node.slopesAlongMap.bottomleft) && ig.pathfinding.isDirectionWalkable(neighbor, -1, 1, node)) {

                neighbors.push(neighbor);

            }

            return neighbors;

        };

        /**
         * Checks a node to see if there are any entities that would collide with pathing entity.
         * @param {ig.pathfinding.Node} node node to get weight for
         * @param {ig.pathfinding.Node} nodeFrom node moving from
         * @param {ig.EntityExtended} entityPathing entity to find path for
         * @param {ig.EntityExtended} [entityTarget] entity to find path to
         * @returns {Boolean} whether node has a colliding entity
         */
        ig.pathfinding.nodeHasCollidingEntities = function(node, nodeFrom, entityPathing, entityTarget) {

            // check pathing entity's layer's spatial hash

            var layer = ig.game.layersMap[entityPathing.layerName];

            if (layer && layer.spatialHash) {

                var hash = layer.spatialHash;
                var cellSize = layer.spatialHashCellSize;
                var x = node.x;
                var y = node.y;
                var cellX = (x / cellSize) | 0;
                var cellY = (y / cellSize) | 0;

                // see if there is a cell in the spatial hash at this location

                var column = hash[cellX];

                if (column) {

                    var cell = column[cellY];

                    if (cell && cell.length > 0) {

                        var halfWidth = entityPathing.size.x * 0.45;
                        var halfHeight = entityPathing.size.y * 0.45;
                        var minX = x - halfWidth;
                        var minY = y - halfHeight;
                        var maxX = x + halfWidth;
                        var maxY = y + halfHeight;
                        var dirX = node.gridX - nodeFrom.gridX;
                        var dirY = node.gridY - nodeFrom.gridY;

                        for (var i = 0, il = cell.length; i < il; i++) {

                            var entity = cell[i];

                            // this location is probably not walkable, provided that the entity in the cell:
                            // is not the entity that is pathing or the entity that is the target
                            // is not the same group as the entity that is pathing
                            // is not hidden or killed
                            // does collide and the pathing entity intersects the entity's bounds

                            if (entity !== entityPathing && !(entity.group & entityPathing.group) && (!entityTarget || entity !== entityTarget) && !entity.hidden && !entity._killed && (entity.collides !== ig.EntityExtended.COLLIDES.NEVER || ((entity.type & ig.EntityExtended.TYPE.DANGEROUS) && (entity.checkAgainst & entityPathing.type))) && _uti.AABBIntersect(
                                minX, minY, maxX, maxY,
                                entity.pos.x, entity.pos.y, entity.pos.x + entity.size.x, entity.pos.y + entity.size.y
                            )) {

                                // not one way

                                if (!entity.oneWay
                                    // no one way climbable will ever block a climbing or flying entity
                                    || (!(entity.climbable && (entityPathing.canClimb || entityPathing.gravityFactor === 0 || ig.game.gravity === 0))
                                        // offset and one way opposite on x or y
                                        && (((dirY < 0 && entity.oneWayFacing.y > 0) || (dirY > 0 && entity.oneWayFacing.y < 0)) || ((dirX < 0 && entity.oneWayFacing.x > 0) || (dirX > 0 && entity.oneWayFacing.x < 0))))) {

                                    return true;

                                }

                            }

                        }

                    }

                }

            }

            return false;

        };

        /**
         * Get a node in the pathfinding grid using grid coordinates.
         * @param {Number} gridX x index of node.
         * @param {Number} gridY y index of node.
         * @returns {ig.pathfinding.Node} node at index.
         **/
        ig.pathfinding.getGridNode = function(gridX, gridY) {

            return _grid[gridY] && _grid[gridY][gridX];

        };

        /**
         * Get a node in the pathfinding grid using world coordinates.
         * @param {Number} x x location in world.
         * @param {Number} y y location in world.
         * @param {Number} [gridOffsetX=0] number of nodes to offset on x.
         * @param {Number} [gridOffsetY=0] number of nodes to offset on y.
         * @returns {ig.pathfinding.Node} node at point.
         **/
        ig.pathfinding.getNode = function(x, y, gridOffsetX, gridOffsetY) {

            var gridX = Math.floor(x * _tilesizeReciprocal) + (gridOffsetX || 0);
            var gridY = Math.floor(y * _tilesizeReciprocal) + (gridOffsetY || 0);

            return ig.pathfinding.getGridNode(gridX, gridY);

        };

        /**
         * Get a walkable node in the pathfinding grid using grid coordinates.
         * @param {Number} x x index to start from.
         * @param {Number} y y index to start from.
         * @param {Number} [gridOffsetX=0] number of nodes to offset on x.
         * @param {Number} [gridOffsetY=0] number of nodes to offset on y.
         * @param {Boolean} [avoidEntities=false] whether to take into account entities that may collide, requires entityPathing.
         * @param {ig.EntityExtended} [entityPathing] entity that will be walking to node, only required when avoiding entities.
         * @returns {ig.pathfinding.Node} walkable node at index.
         **/
        ig.pathfinding.getGridWalkableNode = function(x, y, gridOffsetX, gridOffsetY, avoidEntities, entityPathing) {

            var gridX = x + (gridOffsetX || 0);
            var gridY = y + (gridOffsetY || 0);
            var node = _grid[gridY] && _grid[gridY][gridX];
            var nodeFrom = _grid[y] && _grid[y][x];

            if (node && node.walkable && ((!gridOffsetX && !gridOffsetY) || ig.pathfinding.isDirectionWalkable(node, gridOffsetX, gridOffsetY, nodeFrom))) {

                if (avoidEntities && entityPathing) {

                    if (!nodeFrom || !ig.pathfinding.nodeHasCollidingEntities(node, nodeFrom, entityPathing)) {

                        return node;

                    }

                } else {

                    return node;

                }

            }

        };

        /**
         * Get a walkable node in the pathfinding grid using world coordinates.
         * @param {Number} x x location in world to start from.
         * @param {Number} y y location in world to start from.
         * @param {Number} [gridOffsetX=0] number of nodes to offset on x.
         * @param {Number} [gridOffsetY=0] number of nodes to offset on y.
         * @param {Boolean} [avoidEntities=false] whether to take into account entities that may collide, requires entityPathing.
         * @param {ig.EntityExtended} [entityPathing] entity that will be walking to node, only required when avoiding entities.
         * @returns {ig.pathfinding.Node} walkable node at point.
         **/
        ig.pathfinding.getWalkableNode = function(x, y, gridOffsetX, gridOffsetY, avoidEntities, entityPathing) {

            return ig.pathfinding.getGridWalkableNode(
                Math.floor(x * _tilesizeReciprocal),
                Math.floor(y * _tilesizeReciprocal),
                gridOffsetX, gridOffsetY,
                avoidEntities, entityPathing
            );

        };

        /**
         * Get a chain of walkable nodes in the pathfinding grid using world coordinates in a direction.
         * @param {Number} x x location in world to start from.
         * @param {Number} y y location in world to start from.
         * @param {Number} dirX x direction, between -1 and 1, to find chain.
         * @param {Number} dirY y direction, between -1 and 1, to find chain.
         * @param {Number} [numNodes=2] maximum number of nodes to find.
         * @param {Boolean} [avoidEntities=false] whether to take into account entities that may collide, requires entityPathing.
         * @param {ig.EntityExtended} [entityPathing] entity that will be walking to node, only required when avoiding entities.
         * @param {Array} [nodes] array to add nodes to
         * @returns {Array} walkable nodes in direction.
         **/
        ig.pathfinding.getWalkableNodeChain = function(x, y, dirX, dirY, numNodes, avoidEntities, entityPathing, nodes) {

            // setup parameters

            var gridX = Math.floor(x * _tilesizeReciprocal);
            var gridY = Math.floor(y * _tilesizeReciprocal);

            numNodes = numNodes || 2;

            if (nodes) {

                nodes.length = 0;

            } else {

                nodes = [];

            }

            // find chain

            for (var i = 1; i <= numNodes; i++) {

                var node = ig.pathfinding.getGridWalkableNode(gridX + dirX * i, gridY + dirY * i, dirX, dirY, avoidEntities, entityPathing);

                if (!node) {

                    break;

                }

                nodes.push(node);

            }

            return nodes;

        };

        /**
         * Check if a grid location is walkable using grid coordinates.
         * @param {Number} x x index to start from.
         * @param {Number} y y index to start from.
         * @param {Number} [gridOffsetX=0] number of nodes to offset on x.
         * @param {Number} [gridOffsetY=0] number of nodes to offset on y.
         * @param {Boolean} [avoidEntities=false] whether to take into account entities that may collide, requires entityPathing.
         * @param {ig.EntityExtended} [entityPathing] entity that will be walking to node, only required when avoiding entities.
         * @returns {Boolean} whether node is walkable.
         **/
        ig.pathfinding.isGridWalkable = function(x, y, gridOffsetX, gridOffsetY, avoidEntities, entityPathing) {

            var gridX = x + (gridOffsetX || 0);
            var gridY = y + (gridOffsetY || 0);
            var node = _grid[gridY] && _grid[gridY][gridX];
            var nodeFrom = _grid[y] && _grid[y][x];

            if (node && node.walkable && ((!gridOffsetX && !gridOffsetY) || ig.pathfinding.isDirectionWalkable(node, gridOffsetX, gridOffsetY, nodeFrom))) {

                if (avoidEntities && entityPathing) {

                    if (nodeFrom && !ig.pathfinding.nodeHasCollidingEntities(node, nodeFrom, entityPathing)) {

                        return true;

                    }

                } else {

                    return true;

                }

            }

            return false;

        };

        /**
         * Check if a world location is walkable using world coordinates.
         * @param {Number} x x location in world to start from.
         * @param {Number} y y location in world to start from.
         * @param {Number} [gridOffsetX=0] number of nodes to offset on x.
         * @param {Number} [gridOffsetY=0] number of nodes to offset on y.
         * @param {Boolean} [avoidEntities=false] whether to take into account entities that may collide, requires entityPathing.
         * @param {ig.EntityExtended} [entityPathing] entity that will be walking to node, only required when avoiding entities.
         * @returns {Boolean} whether node is walkable.
         **/
        ig.pathfinding.isWalkable = function(x, y, gridOffsetX, gridOffsetY, avoidEntities, entityPathing) {

            return ig.pathfinding.isGridWalkable(
                Math.floor(x * _tilesizeReciprocal),
                Math.floor(y * _tilesizeReciprocal),
                gridOffsetX, gridOffsetY,
                avoidEntities, entityPathing
            );

        };

        /**
         * Get if a node is walkable from a direction, accounting for one way and, when the node from is passed, diagonal movement.
         * @param {ig.pathfinding.Node} node node to check
         * @param {Number} dirX direction of travel on x
         * @param {Number} dirY direction of travel on y
         * @param {ig.pathfinding.Node} [nodeFrom] node traveling from
         */
        ig.pathfinding.isDirectionWalkable = function(node, dirX, dirY, nodeFrom) {

            if (dirX !== 0 && dirY !== 0 && nodeFrom) {

                if (!ALLOW_DIAGONAL) {

                    return false;

                }

                var nm = nodeFrom.neighborMap;

                if (DIAGONAL_REQUIRES_BOTH_DIRECT) {

                    if (dirX > 0) {

                        if (!nm.right || (!nm.right.walkable && !nm.right.sloped)) {

                            return false;

                        }

                        if (dirY > 0) {

                            if (!nm.bottom || (!nm.bottom.walkable && !nm.bottom.sloped)) {

                                return false;

                            }

                        } else if (!nm.top || (!nm.top.walkable && !nm.top.sloped)) {

                            return false;

                        }

                    } else {

                        if (!nm.left || (!nm.left.walkable && !nm.left.sloped)) {

                            return false;

                        }

                        if (dirY > 0) {

                            if (!nm.bottom || (!nm.bottom.walkable && !nm.bottom.sloped)) {

                                return false;

                            }

                        } else if (!nm.top || (!nm.top.walkable && !nm.top.sloped)) {

                            return false;

                        }

                    }

                } else {

                    if (dirX > 0) {

                        if (dirY > 0) {

                            if ((!nm.right || (!nm.right.walkable && !nm.right.sloped)) && (!nm.bottom || (!nm.bottom.walkable && !nm.bottom.sloped))) {

                                return false;

                            }

                        } else if ((!nm.right || (!nm.right.walkable && !nm.right.sloped)) && (!nm.top || (!nm.top.walkable && !nm.top.sloped))) {

                            return false;

                        }

                    } else {

                        if (dirY > 0) {

                            if ((!nm.left || (!nm.left.walkable && !nm.left.sloped)) && (!nm.bottom || (!nm.bottom.walkable && !nm.bottom.sloped))) {

                                return false;

                            }

                        } else if ((!nm.left || (!nm.left.walkable && !nm.left.sloped)) && (!nm.top || (!nm.top.walkable && !nm.top.sloped))) {

                            return false;

                        }

                    }

                }

            }

            if (node.oneWay && !node.climbable && (((dirY < 0 && node.oneWayFacing.y > 0) || (dirY > 0 && node.oneWayFacing.y < 0)) || ((dirX < 0 && node.oneWayFacing.x > 0) || (dirX > 0 && node.oneWayFacing.x < 0)))) {

                return false;

            }

            return true;

        };

        /**
         * Check if node is within the bounds of pathfinding grid using grid coordinates.
         * @param {Number} gridX x index of node.
         * @param {Number} gridY y index of node.
         * @returns {Boolean} whether node is within grid.
         **/
        ig.pathfinding.isGridPointInGrid = function(gridX, gridY) {

            return _grid[gridY] && _grid[gridY][gridX] instanceof Node;

        };

        /**
         * Check if node is within the bounds of pathfinding grid using world coordinates.
         * @param {Number} x x location in world.
         * @param {Number} y y location in world.
         * @param {Number} [gridOffsetX=0] number of nodes to offset on x.
         * @param {Number} [gridOffsetY=0] number of nodes to offset on y.
         * @returns {Boolean} whether node is within grid.
         **/
        ig.pathfinding.isPointInGrid = function(x, y, gridOffsetX, gridOffsetY) {

            var gridX = Math.floor(x * _tilesizeReciprocal) + (gridOffsetX || 0);
            var gridY = Math.floor(y * _tilesizeReciprocal) + (gridOffsetY || 0);

            return _grid[gridY] && _grid[gridY][gridX] instanceof Node;

        };

        /**
         * Calculates the positions and bounds for entities to align for pathfinding.
         * @param {ig.EntityExtended} entity entity to find position for.
         * @param {ig.EntityExtended} target target entity.
         * @param {Object} [positions] positions object with from and target vectors
         * @returns {Object} positions within bounds of entity to start and align for pathfinding.
         */
        ig.pathfinding.getPositionPathfindingEntities = function(entityPathing, entityTarget, positions) {

            if (!positions) {

                positions = {
                    from: {
                        x: 0.1,
                        y: 0.1
                    },
                    target: {
                        x: 0.1,
                        y: 0.1
                    }
                };

            }

            var pWidth = entityPathing.size.x;
            var pHeight = entityPathing.size.y;
            var pMinX = entityPathing.pos.x;
            var pMaxX = pMinX + pWidth;
            var pMinY = entityPathing.pos.y;
            var pMaxY = pMinY + pHeight;
            var pCenterX = pMinX + pWidth * 0.5;
            var pCenterY = pMinY + pHeight * 0.5;

            var tWidth = entityTarget.size.x;
            var tHeight = entityTarget.size.y;
            var tMinX = entityTarget.pos.x;
            var tMaxX = tMinX + tWidth;
            var tMinY = entityTarget.pos.y;
            var tMaxY = tMinY + tHeight;
            var tCenterX = tMinX + tWidth * 0.5;
            var tCenterY = tMinY + tHeight * 0.5;

            var tilesizeQuarter = _tilesize * 0.25;

            if (pCenterX > tCenterX) {

                positions.from.x = pMinX + tilesizeQuarter;
                positions.target.x = tMaxX - tilesizeQuarter;

            } else if (pCenterX < tCenterX) {

                positions.from.x = pMaxX - tilesizeQuarter;
                positions.target.x = tMinX + tilesizeQuarter;

            } else {

                positions.from.x = pMinX + pWidth * 0.5;
                positions.target.x = tMinX + tWidth * 0.5;

            }

            if (pCenterY > tCenterY) {

                positions.from.y = entityPathing.hasGravity ? pMaxY - tilesizeQuarter : pMinY + tilesizeQuarter;
                positions.target.y = tMaxY - tilesizeQuarter;

            } else if (pCenterY < tCenterY) {

                positions.from.y = pMaxY - tilesizeQuarter;
                positions.target.y = entityTarget.hasGravity ? tMaxY - tilesizeQuarter : tMinY + tilesizeQuarter;

            } else {

                positions.from.y = entityPathing.hasGravity ? pMaxY - tilesizeQuarter : pMinY + pHeight * 0.5;
                positions.target.y = entityTarget.hasGravity ? tMaxY - tilesizeQuarter : tMinY + tHeight * 0.5;

            }

            return positions;

        };

        /**
         * Calculates the positions and bounds for entity to align for pathfinding.
         * @param {ig.EntityExtended} entity entity to find position for.
         * @param {Number} targetX target x
         * @param {Number} targetY target y
         * @param {Object} [position] position object
         * @returns {Object} position within bounds of entity to start and align for pathfinding.
         */
        ig.pathfinding.getPositionPathfindingPoint = function(entityPathing, targetX, targetY, position) {

            if (!position) {

                position = {};

            }

            position.x = entityPathing.pos.x + entityPathing.size.x * 0.5;
            position.y = entityPathing.pos.y + entityPathing.size.y * 0.5;

            if (position.x > targetX) {

                position.x = entityPathing.pos.x + _tilesize * 0.25;

            } else if (position.x < targetX) {

                position.x = entityPathing.pos.x + entityPathing.size.x - _tilesize * 0.25;

            }

            if (entityPathing.hasGravity || position.y < targetY) {

                position.y = entityPathing.pos.y + entityPathing.size.y - _tilesize * 0.25;

            } else if (position.y > targetY) {

                position.y = entityPathing.pos.y + _tilesize * 0.25;

            }

            return position;

        };

        /**
         * Calculates following position and bounds for an entity to align with while following a path.
         * @param {ig.EntityExtended} entity entity to find position for.
         * @param {Number} x x position of entity
         * @param {Number} y y position of entity
         * @param {Number} width width of entity
         * @param {Number} height height of entity
         * @param {ig.pathfinding.Node|Vector2|Object} target target node or position
         * @param {Boolean} [zeroGrav=false] whether to treat as if has no gravity
         * @param {Object} [bounds] bounding object
         * @returns {Object} bounds within bounds of entity to start and align while following a path.
         */
        ig.pathfinding.getBoundsPathfollowing = function(x, y, width, height, target, zeroGrav, bounds) {

            if (!bounds) {

                bounds = {};

            }

            var tileWidth = Math.min(_tilesize * 0.5, width * 0.5);
            var tileHeight = Math.min(_tilesize * 0.5, height * 0.5);

            // corners need bounds based on corner

            if (target.corner) {

                if (target.cornerMap.bottomleft) {

                    bounds.minX = x;
                    bounds.maxX = bounds.minX + tileWidth;
                    bounds.maxY = y + height;
                    bounds.minY = bounds.maxY - tileHeight;

                } else if (target.cornerMap.bottomright) {

                    bounds.maxX = x + width;
                    bounds.minX = bounds.maxX - tileWidth;
                    bounds.maxY = y + height;
                    bounds.minY = bounds.maxY - tileHeight;

                } else if (target.cornerMap.topleft) {

                    bounds.minX = x;
                    bounds.maxX = bounds.minX + tileWidth;
                    bounds.minY = y;
                    bounds.maxY = bounds.minY + tileHeight;

                } else if (target.cornerMap.topright) {

                    bounds.maxX = x + width;
                    bounds.minX = bounds.maxX - tileWidth;
                    bounds.minY = y;
                    bounds.maxY = bounds.minY + tileHeight;

                }

            }
            // modify bounds away from node based on node size
            else {

                // usually it is best to force bounds to corner
                // and then be a little more flexible

                if (bounds.ignoreCornerX) {

                    bounds.minX = x + width * 0.5 - tileWidth * 0.5;
                    bounds.maxX = bounds.minX + tileWidth;

                } else {

                    bounds.minX = x + width * 0.5;
                    bounds.maxX = bounds.minX;

                }

                bounds.maxY = y + height;
                bounds.minY = bounds.maxY - tileHeight;

                if (target.x > bounds.maxX) {

                    bounds.minX = x;
                    bounds.maxX = bounds.minX + tileWidth;

                } else if (target.x < bounds.minX) {

                    bounds.maxX = x + width;
                    bounds.minX = bounds.maxX - tileWidth;

                }

                if (!bounds.ignoreCornerX && target.x >= bounds.minX - 1 && target.x <= bounds.maxX + 1) {

                    bounds.ignoreCornerX = true;

                }

                if (zeroGrav) {

                    if (bounds.ignoreCornerY) {

                        bounds.minY = y + height * 0.5 - tileHeight * 0.5;
                        bounds.maxY = bounds.minY + tileHeight;

                    } else {

                        bounds.minY = y + height * 0.5;
                        bounds.maxY = bounds.minY;

                    }

                    if (target.y > bounds.maxY) {

                        bounds.minY = y;
                        bounds.maxY = bounds.minY + tileHeight;

                    } else if (target.y < bounds.minY) {

                        bounds.maxY = y + height;
                        bounds.minY = bounds.maxY - tileHeight;

                    }

                    if (!bounds.ignoreCornerY && target.y >= bounds.minY - 1 && target.y <= bounds.maxY + 1) {

                        bounds.ignoreCornerY = true;

                    }

                }

            }

            bounds.width = tileWidth;
            bounds.height = tileHeight;

            return bounds;

        };

        /**
         * Calculates x position of node next to entity.
         * @param {Number} x x position of entity
         * @param {Number} width width of entity
         * @param {Number} dirX x direction
         */
        ig.pathfinding.getEntityNeighborPositionX = function(x, width, dirX) {

            if (dirX !== 0) {

                if (dirX < 0) {

                    return x - _tilesize;

                } else {

                    return x + width + _tilesize;

                }

            } else {

                return x + width * 0.5;

            }

        };

        /**
         * Calculates y position of node next to entity.
         * @param {Number} y y position of entity
         * @param {Number} height height of entity
         * @param {Number} dirY y direction
         * @param {Boolean} [zeroGrav=false] whether to treat as if has no gravity
         */
        ig.pathfinding.getEntityNeighborPositionY = function(y, height, dirY, zeroGrav) {

            if (dirY !== 0) {

                if (dirY < 0) {

                    return y - _tilesize;

                } else {

                    return y + height + _tilesize;

                }

            } else if (zeroGrav) {

                return y + height * 0.5;

            } else {

                return y + height - _tilesize * 0.25;

            }

        };

        /**
         * Calculates whether entity (with gravity) may be moving along a smooth slope. This is useful for knowing if the entity can just move or if it needs to jump.
         * @param {ig.EntityExtended} entity entity
         * @param {Number} dirX x direction of movement, where < 0 is left
         * @param {Number} [dirY=both] y direction of movement, where < 0 is up
         * @returns {boolean} true if moving along a smooth slope
         */
        ig.pathfinding.getEntityOnSmoothSlope = function(entity, dirX, dirY) {

            var tilesizeQuarter = _tilesize * 0.25;
            var node;

            if (dirX < 0) {

                node = ig.pathfinding.getNode(entity.pos.x + tilesizeQuarter, entity.pos.y + entity.size.y - tilesizeQuarter);

            } else {

                node = ig.pathfinding.getNode(entity.pos.x + entity.size.x - tilesizeQuarter, entity.pos.y + entity.size.y - tilesizeQuarter);

            }

            if (node) {

                if (STRICT_SLOPE_CHECK) {

                    var neighborName;

                    if (dirX < 0) {

                        neighborName = "left";

                    } else {

                        neighborName = "right";

                    }

                    return node.slopesAlongMap[neighborName] || (dirY && node.slopesAlongMap[(dirY < 0 ? "top" : "bottom") + neighborName]) || (!dirY && (node.slopesAlongMap["top" + neighborName] || node.slopesAlongMap["bottom" + neighborName]));


                } else {

                    return node.slopedAlong;

                }

            }

            return false;

        };

        /**
         * Calculates the y direction of a slope an entity (with gravity) is moving on, based on the x direction of movement. This is useful for knowing if the entity should move down or up in addition to sideways.
         * @param {ig.EntityExtended} entity entity
         * @param {Number} dirX x direction of movement, where < 0 is left
         * @returns {Number} direction y, where -1 is up
         */
        ig.pathfinding.getSlopeDirectionY = function(entity, dirX) {

            var tilesizeQuarter = _tilesize * 0.25;
            var node;

            if (dirX < 0) {

                node = ig.pathfinding.getNode(entity.pos.x + tilesizeQuarter, entity.pos.y + entity.size.y - tilesizeQuarter);

            } else {

                node = ig.pathfinding.getNode(entity.pos.x + entity.size.x - tilesizeQuarter, entity.pos.y + entity.size.y - tilesizeQuarter);

            }

            if (node && node.sloped && node.slopeNormal) {

                return _utm.direction(-node.slopeNormal.x * (dirX < 0 ? 1 : -1));

            }

            return 0;

        };

        /**
         * Calculates whether a node is along a smooth slope in a direction.
         * @param {ig.pathfinding.Node} node node
         * @param {Number} dirX x direction of movement, where < 0 is left
         * @param {Number} dirY y direction of movement, where < 0 is up
         * @returns {boolean} true if node is along a smooth slope in direction
         * @private
         */
        ig.pathfinding.getIsAlongSlope = function(node, dirX, dirY) {

            var neighborName;
            var tileDefIndexA;
            var tileDefIndexB;

            if (dirX < 0) {

                neighborName = "left";
                tileDefIndexA = 1;
                tileDefIndexB = 3;

            } else {

                neighborName = "right";
                tileDefIndexA = 3;
                tileDefIndexB = 1;

            }

            var nodeNeighbor;
            var loc;
            var mod;

            if (typeof dirY !== 'undefined') {

                if (dirY !== 0) {

                    if (dirY < 0) {

                        nodeNeighbor = node.neighborMap["top" + neighborName];
                        loc = 0;
                        mod = 1;

                    } else {

                        nodeNeighbor = node.neighborMap["bottom" + neighborName];
                        loc = 0;
                        mod = -1;

                    }

                } else {

                    nodeNeighbor = node.neighborMap[neighborName];
                    loc = 1;
                    mod = 0;

                }

            } else if (node.sloped) {

                nodeNeighbor = node.neighborMap["top" + neighborName];
                loc = 0;
                mod = 1;

            } else {

                nodeNeighbor = node.neighborMap[neighborName];
                loc = 1;
                mod = 0;

            }

            if (nodeNeighbor && nodeNeighbor.sloped) {

                var dtd = (ig.game.collisionMap && ig.game.collisionMap.tiledef) || ig.CollisionMap.defaultTileDef;
                var tileDef = dtd[node.tile];
                var tileDefNeighbor = dtd[nodeNeighbor.tile];

                if (!tileDefNeighbor || ((!tileDef && tileDefNeighbor[tileDefIndexB] === loc) || (tileDef && tileDef[tileDefIndexA] + mod === tileDefNeighbor[tileDefIndexB]))) {

                    return true;

                }

            }

            return false;

        };

    });
