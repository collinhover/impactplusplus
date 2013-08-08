ig.module(
        'plusplus.helpers.pathfinding'
    )
    .requires(
        'plusplus.core.config',
        'plusplus.core.collision-map',
        'plusplus.core.pathfinding-map',
        'plusplus.helpers.utilstile',
        'plusplus.helpers.utilsintersection'
    )
    .defines(function() {
        "use strict";

        var _c = ig.CONFIG;
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

        /*
         * Open nodes list.
         */
        var _open = [];

        /*
         * Closed nodes list.
         */
        var _closed = [];

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

        /*
         * Map tilesize.
         */
        var _mapTilesize = 1;

        /*
         * Map tilesize reciprocal.
         */
        var _mapTilesizeReciprocal = 1;

        /*
         * Grid of nodes built from map data.
         */
        var _grid = [];

        function _cleanup () {

            var i, il;

            for ( i = 0, il = _open.length; i < il; i++ ) {

                _open[ i ].cleanup();

            }

            for ( i = 0, il = _closed.length; i < il; i++ ) {

                _closed[ i ].cleanup();

            }

            _open.length = _closed.length = 0;

        }

        /**
         * Pathfinding for entities using A*.
         * <br>- some aspects based on PathFinding.js and impact-astar-for-entities
         * <br>- path is constructed in reverse order to allow user to ".length--" to remove a node when reached, instead of shifting/splicing which is usually worse on performance.
         * <span class="alert alert-danger"><strong>IMPORTANT:</strong> for garbage collector friendly code, path points are nodes from the pathfinding grid. Please don't modify the path points.</span>
         * @memberof ig
         * @namespace ig.pathfinding
         * @author Jakub Siemiatkowski - jsiemiatkowski@gmail.com
         * @author Collin Hover - collinhover.com
         **/
        ig.pathfinding = {};

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
            MANHATTAN: function(dx, dy){
                return dx + dy;
            },

            /**
             * Euclidean distance.
             * @param {Number} dx - Difference in x.
             * @param {Number} dy - Difference in y.
             * @return {Number} sqrt(dx * dx + dy * dy)
             */
            EUCLIDEAN: function(dx, dy){
                return Math.sqrt(dx * dx + dy * dy);
            },

            /**
             * Chebyshev distance.
             * @param {Number} dx - Difference in x.
             * @param {Number} dy - Difference in y.
             * @return {Number} max(dx, dy)
             */
            CHEBYSHEV: function(dx, dy){
                return Math.max(dx, dy);
            }
        };

        /**
         * Node used in pathfinding calculations.
         * @class
         * @extends ig.Class
         * @memberof ig.pathfinding
         */
        var Node = ig.pathfinding.Node = ig.Class.extend(/**@lends ig.pathfinding.Node.prototype */{

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
             * Whether node is next to a node that is also sloped.
             * <br>- set automatically by tile check
             * @type {Boolean}
             * @default
             */
            slopedNeighbor: false,

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
            oneWayFacing: { x: 0, y: 0 },

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
             * Walkable neighbors of node, automatically calculated when grid is created.
             * @type {Array}
             * @default
             */
            neighbors: null,

            /**
             * Neighbors, walkable or otherwise, by direction.
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

            // parent node in current path

            parent: null,

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
            init: function ( x, y, gridX, gridY, walkable, tile ) {

                this.x = x || 0;
                this.y = y || 0;

                this.gridX = gridX || 0;
                this.gridY = gridY || 0;

                this.walkable = typeof walkable !== 'undefined' ? walkable : true;

                this.tile = tile || 0;
                this.climbable = !!COLLISION_TILES_HASH_CLIMBABLE[ this.tile ];
                this.oneWay = !!COLLISION_TILES_HASH_ONE_WAY[ this.tile ];
                this.sloped = !!COLLISION_TILES_HASH_SLOPED[ this.tile ];

                if ( this.oneWay ) {

                    if ( this.tile === COLLISION_TILE_ONE_WAY_UP
                        || this.tile === COLLISION_TILE_CLIMBABLE_WITH_TOP
                        || this.tile === COLLISION_TILE_CLIMBABLE_STAIRS_WITH_TOP ) {

                        this.oneWayFacing.y = -1;

                    }
                    else if ( this.tile === COLLISION_TILE_ONE_WAY_DOWN ) {

                        this.oneWayFacing.y = 1;

                    }

                    if ( this.tile === COLLISION_TILE_ONE_WAY_LEFT ) {

                        this.oneWayFacing.x = -1;

                    }
                    else if ( this.tile === COLLISION_TILE_ONE_WAY_RIGHT ) {

                        this.oneWayFacing.x = 1;

                    }

                }

            },

            /**
             * Cleans node after use.
             * <br>- this method is called after each pathfinding on only nodes that were used
             */
            cleanup: function () {

                this.g = this.h = this.f = this.w = this.openIndex = 0;
                this.parent = null;
                this.closed = this.opened = false;

            }

        } );

        /**
         * Rebuild pathfinding.
         * <br>- this is called automatically by {@link ig.GameExtended#buildLevel} when {@link ig.CONFIG.PATHFINDING.BUILD_WITH_LEVEL} is enabled.
         * <span class="alert alert-danger"><strong>IMPORTANT:</strong> collision map and pathfinding map must have the same tilesize!</span>
         * @param {ig.CollisionMap} collisionMap map to determine walkability of nodes
         * @param {ig.PathfindingMap} [pathfindingMap] map to add settings to each node
         */
        ig.pathfinding.rebuild = function ( collisionMap, pathfindingMap ) {

            ig.pathfinding.unload();

            _collisionMap = collisionMap;
            _pathfindingMap = pathfindingMap;

            if ( _collisionMap && ( !_pathfindingMap || _pathfindingMap.tilesize === _collisionMap.tilesize ) ) {

                _collisionMapData = _collisionMap.data;
                _mapTilesize = _collisionMap.tilesize;
                _mapTilesizeReciprocal = 1 / _collisionMap.tilesize;

            }

            if ( _pathfindingMap && ( !_collisionMap || _pathfindingMap.tilesize === _collisionMap.tilesize ) ) {

                _pathfindingMapData = _pathfindingMap.data;
                _mapTilesize = _pathfindingMap.tilesize;
                _mapTilesizeReciprocal = 1 / _pathfindingMap.tilesize;

            }

            ig.pathfinding.rebuildGrid();

        };

        /**
         * Unload pathfinding and clear map, grid, etc.
         * <span class="alert"><strong>IMPORTANT:</strong> this is called automatically by {@link ig.GameExtended#unloadLevel}.</span>
         */
        ig.pathfinding.unload = function () {

            _grid.length = 0;
            _collisionMap = _collisionMapData = _pathfindingMap = _pathfindingMapData = null;

        };

        /**
         * Rebuild grid from maps.
         * <span class="alert"><strong>IMPORTANT:</strong> do not call this method directly, use {@link ig.pathfinding#rebuild} instead.</span>
         * @private
         */
        ig.pathfinding.rebuildGrid = function () {

            var row;
            var tile;
            var gridRow;
            var node;
            var y, yl;
            var x, xl;
            var worldX, worldY;

            // create basic nodes from collision map

            if ( _collisionMap && _collisionMapData ) {

                for ( y = 0, yl = _collisionMapData.length; y < yl; y++ ) {

                    row = _collisionMapData[ y ];
                    gridRow = _grid[ y ];

                    if ( !gridRow ) {

                        gridRow = _grid[ y ] = [];

                    }

                    for ( x = 0, xl = row.length; x < xl; x++ ) {

                        tile = row[ x ];

                        // precalculate world position of node
                        // and set to center of tile

                        worldX = x * _mapTilesize + _mapTilesize * 0.5;
                        worldY = y * _mapTilesize + _mapTilesize * 0.5;

                        gridRow[ x ] = new Node( worldX, worldY, x, y, !!COLLISION_TILES_HASH_WALKABLE[ tile ], tile );

                    }

                }

            }

            // add settings based on pathfinding map

            if ( _pathfindingMap && _pathfindingMapData ) {

                for ( y = 0, yl = _pathfindingMapData.length; y < yl; y++ ) {

                    row = _pathfindingMapData[ y ];
                    gridRow = _grid[ y ];

                    if ( !gridRow ) {

                        gridRow = _grid[ y ] = [];

                    }

                    for ( x = 0, xl = ( !_collisionMap || !_collisionMapData[ 0 ] || row.length >= _collisionMapData[ 0 ].length ? row.length : _collisionMapData[ 0 ].length ); x < xl; x++ ) {

                        tile = row[ x ] || 0;
                        var settings = _pathfindingMap.tiledef[ tile ];

                        node = gridRow[ x ];

                        // when pathfinding map is bigger than collision map
                        // create a new node and set walkable from settings

                        if ( !node ) {

                            // precalculate world position of node
                            // and set to center of tile

                            worldX = x * _mapTilesize + _mapTilesize * 0.5;
                            worldY = y * _mapTilesize + _mapTilesize * 0.5;

                            node = gridRow[ x ] = new Node( worldX, worldY, x, y, settings && typeof settings.walkable !== 'undefined' ? settings.walkable : true, tile );

                        }

                        // merge settings into node

                        ig.merge( node, settings );

                    }

                }

            }

            // process each node

            for ( y = 0, yl = _grid.length; y < yl; y++ ) {

                row = _grid[ y ];

                for ( x = 0, xl = row.length; x < xl; x++ ) {

                    node = row[ x ];

                    // set size

                    node.size = _mapTilesize;

                    // neighbors list

                    node.neighbors = ig.pathfinding.getNeighbors( node );

                    // neighbors by direction

                    var nm = node.neighborMap;
                    var prevRow = _grid[ y - 1 ];
                    var nextRow = _grid[ y + 1 ];

                    if ( prevRow ) {

                        nm.top = prevRow[ x ];

                        if ( x > 0 ) {

                            nm.topleft = prevRow[ x - 1 ];

                        }

                        if ( x < xl - 1 ) {

                            nm.topright = prevRow[ x + 1 ];

                        }

                    }

                    if ( x > 0 ) {

                        nm.left = row[ x - 1 ];

                    }

                    if ( x < xl - 1 ) {

                        nm.right = row[ x + 1 ];

                    }

                    if ( nextRow ) {

                        nm.bottom = nextRow[ x ];

                        if ( x > 0 ) {

                            nm.bottomleft = nextRow[ x - 1 ];

                        }

                        if ( x < xl - 1 ) {

                            nm.bottomright = nextRow[ x + 1 ];

                        }

                    }

                    // is node in the air?

                    node.ungrounded = !nm.bottom || ( nm.bottom.walkable && nm.bottom.oneWayFacing.y >= 0 );

                    // is node a corner?

                    if ( nm.top && nm.top.walkable && ( nm.top.climbable || nm.top.oneWayFacing.y <= 0 )
                        && nm.left && nm.left.walkable && ( nm.left.climbable || nm.left.oneWayFacing.x <= 0 )
                        && ( !nm.topleft || !nm.topleft.walkable ) ) {

                        node.corner = node.cornerMap.topleft = true;

                    }

                    if ( nm.top && nm.top.walkable && ( nm.top.climbable || nm.top.oneWayFacing.y <= 0 )
                        && nm.right && nm.right.walkable && ( nm.right.climbable || nm.right.oneWayFacing.x >= 0 )
                        && ( !nm.topright || !nm.topright.walkable ) ) {

                        node.corner = node.cornerMap.topright = true;

                    }

                    if ( nm.bottom && nm.bottom.walkable && ( nm.bottom.climbable || nm.bottom.oneWayFacing.y >= 0 )
                        && nm.left && nm.left.walkable && ( nm.left.climbable || nm.left.oneWayFacing.x <= 0 )
                        && ( !nm.bottomleft || !nm.bottomleft.walkable ) ) {

                        node.corner = node.cornerMap.bottomleft = true;

                    }

                    if ( nm.bottom && nm.bottom.walkable && ( nm.bottom.climbable || nm.bottom.oneWayFacing.y >= 0 )
                        && nm.right && nm.right.walkable && ( nm.right.climbable || nm.right.oneWayFacing.x >= 0 )
                        && ( !nm.bottomright || !nm.bottomright.walkable ) ) {

                        node.corner = node.cornerMap.bottomright = true;

                    }

                    // is node next to sloped?

                    if ( ( nm.top && nm.top.sloped )
                        || ( nm.bottom && nm.bottom.sloped )
                        || ( nm.right && nm.right.sloped )
                        || ( nm.left && nm.left.sloped )
                        || ( nm.topleft && nm.topleft.sloped )
                        || ( nm.topright && nm.topright.sloped )
                        || ( nm.bottomleft && nm.bottomleft.sloped )
                        || ( nm.bottomright && nm.bottomright.sloped ) ) {

                        node.slopedNeighbor = true;

                    }

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

            return ig.pathfinding.getPathTo(
                entityPathing.pos.x + entityPathing.size.x * 0.5,
                entityPathing.pos.y + entityPathing.size.y * 0.5,
                entityTarget.pos.x + entityTarget.size.x * 0.5,
                entityTarget.pos.y + entityTarget.size.y * 0.5,
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

            return ig.pathfinding.getPathTo(
                entityPathing.pos.x + entityPathing.size.x * 0.5,
                entityPathing.pos.y + entityPathing.size.y * 0.5,
                targetX, targetY, avoidEntities, searchDistance, entityPathing, entityTarget, heuristicType
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

            if ( entityPathing && entityPathing.path ) {

                path = entityPathing.path;
                path.length = 0;

            }
            else {

                path = [];

            }

            // check for empty grid

            var grid = _grid;

            if ( grid.length === 0 ) {

                return path;

            }

            // get the map information

            var gridFromX = Math.floor(fromX * _mapTilesizeReciprocal);
            var gridFromY = Math.floor(fromY * _mapTilesizeReciprocal);
            var gridDestinationX = Math.floor(targetX * _mapTilesizeReciprocal);
            var gridDestinationY = Math.floor(targetY * _mapTilesizeReciprocal);
            var startNode = grid[ gridFromY ] && grid[ gridFromY ][ gridFromX ];
            var destinationNode = grid[ gridDestinationY ] && grid[ gridDestinationY ][ gridDestinationX ];

            // start or destination nodes must be within map and start cannot be the destination

            if( !startNode || !destinationNode || startNode === destinationNode ) {

                return path;

            }

            var open = _open;
            var closed = _closed;
            var heuristic = HEURISTIC[ heuristicType || 'MANHATTAN' ];
            var abs = Math.abs;
            var SQRT2 = Math.SQRT2;
            var neighbors;
            var neighbor;
            var openNode;
            var i, il;
            var j, jl;

            var needsAvoidEntityCheck = avoidEntities && entityPathing;
            var nodeHasCollidingEntities = ig.pathfinding.nodeHasCollidingEntities;
            var needsDiagonalFix = needsAvoidEntityCheck && ALLOW_DIAGONAL && DIAGONAL_REQUIRES_BOTH_DIRECT;
            var neighborMap;
            var diagonalUnsafe;
            var topleft;
            var topright;
            var bottomleft;
            var bottomright;
            var diagonalStartIndex;

            var needsDistCheck;

            if ( entityTarget && searchDistance > 0 ) {

                needsDistCheck = true;
                searchDistance *= _mapTilesizeReciprocal;
                searchDistance *= searchDistance;

            }
            else {

                needsDistCheck = false;

            }

            // add start as first open node

            open.push(startNode);

            // until the destination is found work off the open nodes

            while(open.length > 0) {

                // get best open node

                var currentNode = open.pop();
                var gridCurrentX = currentNode.gridX;
                var gridCurrentY = currentNode.gridY;

                // add the current node to the closed list

                closed.push(currentNode);
                currentNode.closed = true;

                // we're at the destination
                // go up the path chain to recreate the path

                if( currentNode === destinationNode ) {

                    while( currentNode ) {

                        path.push( currentNode );
                        currentNode = currentNode.parent;

                    }

                    _cleanup();

                    return path;

                }

                // get neighbors of the current node

                neighbors = currentNode.neighbors;
                il = neighbors.length;

                // setup for diagonal fix

                if ( needsDiagonalFix ) {

                    neighborMap = currentNode.neighborMap;
                    topleft = topright = bottomleft = bottomright = diagonalUnsafe = false;
                    diagonalStartIndex = ( il * 0.5 ) | 0 + 1;

                }

                for (i = 0; i < il; i++) {

                    neighbor = neighbors[i];

                    // neighbor already tried

                    if ( neighbor.closed ) {

                        continue;

                    }

                    var gridX = neighbor.gridX;
                    var gridY = neighbor.gridY;

                    // don't search outside range

                    if ( needsDistCheck ) {

                        var deltaX = gridX - gridDestinationX;
                        var deltaY = gridY - gridDestinationY;

                        if ( deltaX * deltaX + deltaY * deltaY > searchDistance ) {

                            continue;

                        }

                    }

                    // avoid colliding entities

                    if ( needsAvoidEntityCheck ) {

                        // diagonal may be unsafe to walk when direct has colliding entity

                        if ( diagonalUnsafe
                            && ( ( topleft && neighbor === neighborMap.topleft )
                            || ( topright && neighbor === neighborMap.topright )
                            || ( bottomleft && neighbor === neighborMap.bottomleft )
                            || ( bottomright && neighbor === neighborMap.bottomright ) ) ) {

                            continue;

                        }
                        else if ( nodeHasCollidingEntities( neighbor, currentNode, entityPathing, entityTarget ) ) {

                            // when diagonal movement requires walkable on both direct nodes
                            // then a direct node with a colliding entity automatically rules out the diagonal

                            if ( needsDiagonalFix ) {

                                // direct neighbors are always in the first half of neighbor list

                                if ( i < diagonalStartIndex ) {

                                    if ( neighbor === neighborMap.top ) {

                                        diagonalUnsafe = topleft = topright = true;

                                    }

                                    if ( neighbor === neighborMap.bottom ) {

                                        diagonalUnsafe = bottomleft = bottomright = true;;

                                    }

                                    if ( neighbor === neighborMap.left ) {

                                        diagonalUnsafe = topleft = bottomleft = true;

                                    }

                                    if ( neighbor === neighborMap.right ) {

                                        diagonalUnsafe = topright = bottomright = true;

                                    }

                                }

                            }

                            continue;

                        }

                    }

                    // get the distance between current node and the neighbor to find the next g value

                    var dg = ( gridX - gridCurrentX ) === 0 || ( gridY - gridCurrentY ) === 0 ? 1 : SQRT2;
                    var ng = currentNode.g + dg;

                    // add the weighted distance between current node and the neighbor

                    var nw;

                    if ( WEIGHTED ) {

                        nw = currentNode.w + dg + neighbor.weight + WEIGHT * neighbor.weightPct;

                    }
                    else {

                        nw = ng;

                    }

                    // check if the neighbor has not been inspected yet, or
                    // can be reached with smaller cost from the current node

                    if (!neighbor.opened || nw < neighbor.w) {

                        neighbor.g = ng;
                        neighbor.w = nw;
                        neighbor.h = neighbor.h || heuristic(abs(gridX - gridDestinationX), abs(gridY - gridDestinationY));
                        neighbor.f = neighbor.w + neighbor.h;
                        neighbor.parent = currentNode;

                        if (!neighbor.opened) {

                            neighbor.opened = true;

                            // insert sort neighbor into the open list
                            // where index 0 = highest value

                            for( j = open.length; j > 0; j-- ) {

                                openNode = open[ j - 1 ];

                                if(neighbor.f <= openNode.f) {

                                    break;

                                }
                                else {

                                    openNode.openIndex = j;
                                    open[ j ] = openNode;

                                }

                            }

                            neighbor.openIndex = j;
                            open[ j ] = neighbor;

                        }
                        else {

                            // neighbor can be reached with smaller cost
                            // we need to shift it up, towards the end of the list

                            var shifted;

                            for( j = neighbor.openIndex, jl = open.length - 1; j < jl; j++ ) {

                                openNode = open[ j + 1 ];

                                if ( openNode.f <= neighbor.f ) {

                                    shifted = true;
                                    break;

                                }
                                else {

                                    openNode.openIndex = j;
                                    open[ j ] = openNode;

                                }

                            }

                            if ( !shifted ) {

                                j = open.length;

                            }

                            neighbor.openIndex = j;
                            open[ j ] = neighbor;

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
        ig.pathfinding.getPathAwayFrom = function ( fromX, fromY, awayFromX, awayFromY, avoidEntities, searchDistance, entityPathing, heuristicType ) {

            // init path

            var path;

            if ( entityPathing && entityPathing.path ) {

                path = entityPathing.path;
                path.length = 0;

            }
            else {

                path = [];

            }

            // check for empty grid

            var grid = _grid;

            if ( grid.length === 0 ) {

                return path;

            }

            // get the map information

            var gridFromX = Math.floor(fromX * _mapTilesizeReciprocal);
            var gridFromY = Math.floor(fromY * _mapTilesizeReciprocal);
            var gridAwayFromX = Math.floor(awayFromX * _mapTilesizeReciprocal);
            var gridAwayFromY = Math.floor(awayFromY * _mapTilesizeReciprocal);
            var startNode = grid[ gridFromY ] && grid[ gridFromY ][ gridFromX ];
            var awayFromNode = grid[ gridAwayFromY ] && grid[ gridAwayFromY ][ gridAwayFromX ];

            // start or away from node is invalid

            if( !startNode || !awayFromNode ) {

                return path;

            }

            var open = _open;
            var closed = _closed;
            var heuristic = HEURISTIC[ heuristicType || 'MANHATTAN' ];
            var abs = Math.abs;
            var SQRT2 = Math.SQRT2;
            var neighbors;
            var neighbor;
            var openNode;
            var i, il;
            var j, jl;

            var needsAvoidEntityCheck = avoidEntities && entityPathing;
            var nodeHasCollidingEntities = ig.pathfinding.nodeHasCollidingEntities;
            var needsDiagonalFix = needsAvoidEntityCheck && ALLOW_DIAGONAL && DIAGONAL_REQUIRES_BOTH_DIRECT;
            var neighborMap;
            var diagonalUnsafe;
            var topleft;
            var topright;
            var bottomleft;
            var bottomright;
            var diagonalStartIndex;

            // setup search distance

            if ( searchDistance > 0 ) {

                searchDistance *= _mapTilesizeReciprocal;

            }
            else {

                searchDistance = AWAY_FROM_DISTANCE * _mapTilesizeReciprocal;

            }

            searchDistance *= searchDistance;

            // add start as first open node

            open.push(startNode);

            // until the destination is found work off the open nodes

            while(open.length > 0) {

                // get best open node

                var currentNode = open.pop();
                var gridCurrentX = currentNode.gridX;
                var gridCurrentY = currentNode.gridY;

                // add the current node to the closed list

                closed.push(currentNode);
                currentNode.closed = true;

                // we're as far away as we need to be
                // or have tried as many paths as allowed
                // go up the path chain to recreate the path

                var gridDeltaX = gridCurrentX - gridAwayFromX;
                var gridDeltaY = gridCurrentY - gridAwayFromY;

                if( closed.length >= AWAY_FROM_MAX_NODES || gridDeltaX * gridDeltaX + gridDeltaY * gridDeltaY >= searchDistance ) {

                    while( currentNode ) {

                        path.push( currentNode );
                        currentNode = currentNode.parent;

                    }

                    _cleanup();

                    return path;

                }

                // get neighbors of the current node

                neighbors = currentNode.neighbors;
                il = neighbors.length;

                // setup for diagonal fix

                if ( needsDiagonalFix ) {

                    neighborMap = currentNode.neighborMap;
                    topleft = topright = bottomleft = bottomright = diagonalUnsafe = false;
                    diagonalStartIndex = ( il * 0.5 ) | 0 + 1;

                }

                for (i = 0; i < il; i++) {

                    neighbor = neighbors[i];

                    // neighbor already tried

                    if ( neighbor.closed ) {

                        continue;

                    }

                    // avoid colliding entities

                    if ( needsAvoidEntityCheck ) {

                        // diagonal may be unsafe to walk when direct has colliding entity

                        if ( diagonalUnsafe
                            && ( ( topleft && neighbor === neighborMap.topleft )
                            || ( topright && neighbor === neighborMap.topright )
                            || ( bottomleft && neighbor === neighborMap.bottomleft )
                            || ( bottomright && neighbor === neighborMap.bottomright ) ) ) {

                            continue;

                        }
                        else if ( nodeHasCollidingEntities( neighbor, currentNode, entityPathing ) ) {

                            // when diagonal movement requires walkable on both direct nodes
                            // then a direct node with a colliding entity automatically rules out the diagonal

                            if ( needsDiagonalFix ) {

                                // direct neighbors are always in the first half of neighbor list

                                if ( i < diagonalStartIndex ) {

                                    if ( neighbor === neighborMap.top ) {

                                        diagonalUnsafe = topleft = topright = true;

                                    }

                                    if ( neighbor === neighborMap.bottom ) {

                                        diagonalUnsafe = bottomleft = bottomright = true;;

                                    }

                                    if ( neighbor === neighborMap.left ) {

                                        diagonalUnsafe = topleft = bottomleft = true;

                                    }

                                    if ( neighbor === neighborMap.right ) {

                                        diagonalUnsafe = topright = bottomright = true;

                                    }

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

                    if ( WEIGHTED ) {

                        dw = dg + neighbor.weight + WEIGHT * neighbor.weightPct;

                    }
                    else {

                        dw = dg;

                    }

                    // add weight if this would take us closer to away from position

                    if ( ( gridDeltaX > 0 && gridDeltaX + dx < gridDeltaX ) || ( gridDeltaX < 0 && gridDeltaX + dx > gridDeltaX ) ) {

                        dw += WEIGHT_AWAY_FROM;

                    }

                    if ( ( gridDeltaY > 0 && gridDeltaY + dy < gridDeltaY ) || ( gridDeltaY < 0 && gridDeltaY + dy > gridDeltaY ) ) {

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
                        neighbor.parent = currentNode;

                        if (!neighbor.opened) {

                            neighbor.opened = true;

                            // insert sort neighbor into the open list
                            // where index 0 = highest value

                            for( j = open.length; j > 0; j-- ) {

                                openNode = open[ j - 1 ];

                                if(neighbor.f <= openNode.f) {

                                    break;

                                }
                                else {

                                    openNode.openIndex = j;
                                    open[ j ] = openNode;

                                }

                            }

                            neighbor.openIndex = j;
                            open[ j ] = neighbor;

                        }
                        else {

                            // neighbor can be reached with smaller cost
                            // we need to shift it up, towards the end of the list

                            var shifted;

                            for( j = neighbor.openIndex, jl = open.length - 1; j < jl; j++ ) {

                                openNode = open[ j + 1 ];

                                if ( openNode.f <= neighbor.f ) {

                                    shifted = true;
                                    break;

                                }
                                else {

                                    openNode.openIndex = j;
                                    open[ j ] = openNode;

                                }

                            }

                            if ( !shifted ) {

                                j = open.length;

                            }

                            neighbor.openIndex = j;
                            open[ j ] = neighbor;

                        }

                    }

                }

            }

            _cleanup();

            return path;

        };

        /**
         * Get the walkable neighbors of the given node.
         * @param {ig.pathfinding.Node} node node to get neighbors for
         * @returns {Array} neighbors of node
         * @example
         * // neighbors are precalculated on rebuild
         * // so this is usually a bad idea:
         * var myNeighbors = ig.pathfinding.getNeighbors( myNode );
         * // this is a better idea
         * var myNeighbors = myNode.neighbors;
         */
        ig.pathfinding.getNeighbors = function(node){

            var neighbors = [];
            var gridX = node.gridX;
            var gridY = node.gridY;
            var grid = _grid;
            var neighbor;
            var top;
            var topWalkable;
            var bottom;
            var bottomWalkable;
            var right;
            var rightWalkable;
            var left;
            var leftWalkable;

            var row = grid[gridY];
            var prevRow = grid[gridY - 1];
            var nextRow = grid[gridY + 1];

            // ↑
            top = prevRow && prevRow[gridX];
            if ( top ) {

                if ( top.walkable && ig.pathfinding.isDirectionWalkable( top, 0, -1 ) ) {

                    neighbors.push( top );
                    topWalkable = true;

                }
                else if ( top.sloped ) {

                    topWalkable = true;

                }

            }

            // →
            right = row && row[gridX + 1];
            if ( right ) {

                if ( right.walkable && ig.pathfinding.isDirectionWalkable( right, 1, 0 ) ) {

                    neighbors.push( right );
                    rightWalkable = true;

                }
                else if ( right.sloped ) {

                    rightWalkable = true;

                }

            }

            // ↓
            bottom = nextRow && nextRow[gridX];
            if ( bottom ) {

                if ( bottom.walkable && ig.pathfinding.isDirectionWalkable( bottom, 0, 1 ) ) {

                    neighbors.push( bottom );
                    bottomWalkable = true;

                }
                else if ( bottom.sloped ) {

                    bottomWalkable = true;

                }

            }

            // ←
            left = row && row[gridX - 1];
            if ( left ){

                if ( left.walkable && ig.pathfinding.isDirectionWalkable( left, -1, 0 ) ) {

                    neighbors.push( left );
                    leftWalkable = true;

                }
                else if ( left.sloped ) {

                    leftWalkable = true;

                }

            }

            // get diagonal neighbors as long as direct neighbors are walkable

            if ( ALLOW_DIAGONAL ) {

                var tl;
                var tr;
                var bl;
                var br;

                if ( DIAGONAL_REQUIRES_BOTH_DIRECT ) {

                    tl = topWalkable && leftWalkable;
                    tr = topWalkable && rightWalkable;
                    bl = bottomWalkable && leftWalkable;
                    br = bottomWalkable && rightWalkable;

                }
                else {

                    tl = topWalkable || leftWalkable;
                    tr = topWalkable || rightWalkable;
                    bl = bottomWalkable || leftWalkable;
                    br = bottomWalkable || rightWalkable;

                }

                // ↖
                if ( tl ) {

                    neighbor = prevRow && prevRow[gridX - 1];
                    if ( neighbor && neighbor.walkable && ig.pathfinding.isDirectionWalkable( neighbor, -1, -1 ) ) {

                        neighbors.push( neighbor );

                    }

                }
                // ↗
                if ( tr ) {

                    neighbor = prevRow && prevRow[gridX + 1];
                    if ( neighbor && neighbor.walkable && ig.pathfinding.isDirectionWalkable( neighbor, 1, -1 ) ) {

                        neighbors.push( neighbor );

                    }

                }
                // ↘
                if ( br ) {

                    neighbor = nextRow && nextRow[gridX + 1];
                    if ( neighbor && neighbor.walkable && ig.pathfinding.isDirectionWalkable( neighbor, 1, 1 ) ) {

                        neighbors.push( neighbor );

                    }

                }
                // ↙
                if ( bl ) {

                    neighbor = nextRow && nextRow[gridX - 1];
                    if ( neighbor && neighbor.walkable && ig.pathfinding.isDirectionWalkable( neighbor, -1, 1 ) ) {

                        neighbors.push( neighbor );

                    }

                }

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
        ig.pathfinding.nodeHasCollidingEntities = function ( node, nodeFrom, entityPathing, entityTarget ) {

            // check pathing entity's layer's spatial hash

            var layer = ig.game.layersMap[ entityPathing.layerName ];

            if ( layer && layer.spatialHash ) {

                var hash = layer.spatialHash;
                var cellSize = layer.spatialHashCellSize;
                var x = node.x;
                var y = node.y;
                var cellX = ( x / cellSize ) | 0;
                var cellY = ( y / cellSize ) | 0;

                // see if there is a cell in the spatial hash at this location

                var column = hash[ cellX ];

                if ( column ) {

                    var cell = column[ cellY ];

                    if ( cell && cell.length > 0 ) {

                        var halfWidth = entityPathing.size.x * 0.45;
                        var halfHeight = entityPathing.size.y * 0.45;
                        var minX = x - halfWidth;
                        var minY = y - halfHeight;
                        var maxX = x + halfWidth;
                        var maxY = y + halfHeight;
                        var dirX = node.gridX - nodeFrom.gridX;
                        var dirY = node.gridY - nodeFrom.gridY;

                        for ( var i = 0, il = cell.length; i < il; i++ ) {

                            var entity = cell[ i ];

                            // this location is probably not walkable, provided that the entity in the cell:
                            // is not the entity that is pathing or the entity that is the target
                            // is not the same group as the entity that is pathing
                            // does collide and the pathing entity intersects the entity's bounds

                            if ( entity.collides !== ig.Entity.COLLIDES.NONE
                                && entity !== entityPathing
                                && !( entity.group & entityPathing.group )
                                && ( !entityTarget || entity !== entityTarget )
                                && _uti.AABBIntersect( 
									minX, minY, maxX, maxY,
									entity.pos.x, entity.pos.y, entity.pos.x + entity.size.x, entity.pos.y + entity.size.y
									) ) {

                                // not one way

                                if ( !entity.oneWay
                                    // no one way climbable will ever block a climbing entity
                                    || ( !( entity.climbable && entityPathing.canClimb )
                                    // offset and one way opposite on x or y
                                    && ( ( ( dirY < 0 && entity.oneWayFacing.y > 0 ) || ( dirY > 0 && entity.oneWayFacing.y < 0 ) )
                                    || ( ( dirX < 0 && entity.oneWayFacing.x > 0 ) || ( dirX > 0 && entity.oneWayFacing.x < 0 ) ) ) ) ) {

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
        ig.pathfinding.getNodeAt = function(gridX, gridY){

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
        ig.pathfinding.getWorldNodeAt = function(x, y, gridOffsetX, gridOffsetY ){

            var gridX = Math.floor(x * _mapTilesizeReciprocal) + ( gridOffsetX || 0 );
            var gridY = Math.floor(y * _mapTilesizeReciprocal) + ( gridOffsetY || 0 );

            return ig.pathfinding.getNodeAt( gridX, gridY );

        };

        /**
         * Get a walkable node in the pathfinding grid using grid coordinates.
         * @param {Number} gridX x index of node.
         * @param {Number} gridY y index of node.
         * @param {Number} [dirX] direction x coming from.
         * @param {Number} [dirY] direction y coming from.
         * @returns {ig.pathfinding.Node} walkable node at index.
         **/
        ig.pathfinding.getWalkableNodeAt = function(gridX, gridY, dirX, dirY){

            var node = _grid[gridY] && _grid[gridY][gridX];

            if ( node && node.walkable
                && ( ( !dirX && !dirY ) || ig.pathfinding.isDirectionWalkable( node, dirX, dirY ) ) ) {

                return node;

            }

        };

        /**
         * Get a walkable node in the pathfinding grid using world coordinates.
         * @param {Number} x x location in world.
         * @param {Number} y y location in world.
         * @param {Number} [gridOffsetX=0] number of nodes to offset on x.
         * @param {Number} [gridOffsetY=0] number of nodes to offset on y.
         * @param {Number} [dirX] direction x coming from.
         * @param {Number} [dirY] direction y coming from.
         * @returns {ig.pathfinding.Node} walkable node at point.
         **/
        ig.pathfinding.getWorldWalkableNodeAt = function(x, y, gridOffsetX, gridOffsetY, dirX, dirY ){

            var gridX = Math.floor(x * _mapTilesizeReciprocal) + ( gridOffsetX || 0 );
            var gridY = Math.floor(y * _mapTilesizeReciprocal) + ( gridOffsetY || 0 );

            return ig.pathfinding.getWalkableNodeAt( gridX, gridY, dirX, dirY );

        };

        /**
         * Get a chain of walkable nodes in the pathfinding grid using world coordinates in a direction.
         * @param {Number} x x location in world.
         * @param {Number} y y location in world.
         * @param {Number} dirX x direction, between -1 and 1, to find chain.
         * @param {Number} dirY y direction, between -1 and 1, to find chain.
         * @param {Number} [numNodes=2] maximum number of nodes to find.
         * @param {Array} [nodes] array to add nodes to
         * @returns {Array} walkable nodes in direction.
         **/
        ig.pathfinding.getWorldWalkableNodeChain = function(x, y, dirX, dirY, numNodes, nodes ){
			
			// setup parameters
			
            var gridX = Math.floor(x * _mapTilesizeReciprocal);
            var gridY = Math.floor(y * _mapTilesizeReciprocal);
			
			numNodes = numNodes || 2;
			
			if ( nodes ) {
				
				nodes.length = 0;
				
			}
			else {
				
				nodes = [];
				
			}
			
			// find chain
			
			for ( var i = 1; i <= numNodes; i++ ) {
				
				var node = ig.pathfinding.getWalkableNodeAt( gridX + dirX * i, gridY + dirY * i, dirX, dirY );
				
				if ( !node ) {
					
					break;
					
				}
				
				nodes.push( node );
				
			}
			
			return nodes;

        };

        /**
         * Check if node is walkable using grid coordinates.
         * @param {Number} gridX x index of node.
         * @param {Number} gridY y index of node.
         * @param {Number} [dirX] direction x coming from.
         * @param {Number} [dirY] direction y coming from.
         * @returns {Boolean} whether node is walkable.
         **/
        ig.pathfinding.isWalkableAt = function(gridX, gridY, dirX, dirY) {

            var node = ig.pathfinding.getNodeAt( gridX, gridY );

            if ( node && node.walkable ) {

                if ( dirX || dirY ) {

                     return ig.pathfinding.isDirectionWalkable( node, dirX, dirY );

                }
                else {

                    return true;

                }

            }

            return false;

        };

        /**
         * Check if node is walkable using world coordinates.
         * @param {Number} x x location in world.
         * @param {Number} y y location in world.
         * @param {Number} [gridOffsetX=0] number of nodes to offset on x.
         * @param {Number} [gridOffsetY=0] number of nodes to offset on y.
         * @param {Number} [dirX] direction x coming from.
         * @param {Number} [dirY] direction y coming from.
         * @returns {Boolean} whether node is walkable.
         **/
        ig.pathfinding.isWorldWalkableAt = function(x, y, gridOffsetX, gridOffsetY, dirX, dirY) {

            var gridX = Math.floor(x * _mapTilesizeReciprocal) + ( gridOffsetX || 0 );
            var gridY = Math.floor(y * _mapTilesizeReciprocal) + ( gridOffsetY || 0 );

            return ig.pathfinding.isWalkableAt( gridX, gridY, dirX, dirY );

        };

        /**
         * Get if a node is walkable from a direction, accounting for one way.
         * @param {ig.pathfinding.Node} node node to check
         * @param {Number} dirX direction x coming from
         * @param {Number} dirY direction y coming from
         */
        ig.pathfinding.isDirectionWalkable = function(node, dirX, dirY){

            if ( node.oneWay && !node.climbable
                && ( ( ( dirY < 0 && node.oneWayFacing.y > 0 ) || ( dirY > 0 && node.oneWayFacing.y < 0 ) )
                || ( ( dirX < 0 && node.oneWayFacing.x > 0 ) || ( dirX > 0 && node.oneWayFacing.x < 0 ) ) ) ) {

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
        ig.pathfinding.isPointInGrid = function(gridX, gridY){

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
        ig.pathfinding.isWorldPointInGrid = function(x, y, gridOffsetX, gridOffsetY){

            var gridX = Math.floor(x * _mapTilesizeReciprocal) + ( gridOffsetX || 0 );
            var gridY = Math.floor(y * _mapTilesizeReciprocal) + ( gridOffsetY || 0 );

            return ig.pathfinding.isPointInGrid( gridX, gridY );

        };

    });