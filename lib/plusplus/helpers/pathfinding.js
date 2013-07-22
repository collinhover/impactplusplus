ig.module(
        'plusplus.helpers.pathfinding'
    )
    .requires(
        'plusplus.core.config',
        'plusplus.core.collision-map',
        'plusplus.core.pathfinding-map',
        'plusplus.helpers.utils',
        'plusplus.helpers.utilstile',
        'plusplus.helpers.utilsintersection'
    )
    .defines(function() {
        "use strict";

        var _c = ig.CONFIG;
        var _ut = ig.utils;
        var _utt = ig.utilstile;
        var _uti = ig.utilsintersection;

        /*
         * Static variables and utility objects.
         */

        var TILE_ONE_WAY_UP = _utt.TILE_ID.ONE_WAY_UP = 12;
        var TILE_ONE_WAY_DOWN = _utt.TILE_ID.ONE_WAY_DOWN = 23;
        var TILE_ONE_WAY_RIGHT = _utt.TILE_ID.ONE_WAY_RIGHT = 34;
        var TILE_ONE_WAY_LEFT = _utt.TILE_ID.ONE_WAY_LEFT = 45;
        var TILE_CLIMBABLE_WITH_TOP = _utt.TILE_ID.CLIMBABLE_WITH_TOP = 100;

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
         * <br>- based on: https://github.com/qiao/PathFinding.js / https://github.com/hurik/impact-astar-for-entities / http://en.wikipedia.org/wiki/A*_search_algorithm
         * <br>- path is constructed in reverse order to allow user to ".length--" to remove a node when reached, instead of shifting/splicing which is usually worse on performance.
         * <span class="alert alert-danger"><strong>IMPORTANT:</strong> for garbage collector friendly code, path points are nodes from the pathfinding grid. Please don't modify the path points.</span>
         * @memberof ig
         * @author Jakub Siemiatkowski - jsiemiatkowski@gmail.com
         * @author Collin Hover - collinhover.com
         **/
        ig.pathfinding = {};

        /**
         * Walkable tiles in a collision map.
         * @type {Array}
         * @see ig.CONFIG.PATHFINDING.WALKABLE_COLLISION_TILES
         */
        var WALKABLE_COLLISION_TILES = ig.pathfinding.WALKABLE_COLLISION_TILES = _c.PATHFINDING.WALKABLE_COLLISION_TILES;

        /**
         * Whether to use node weight in pathfinding.
         * @type {Boolean}
         * @see ig.CONFIG.PATHFINDING.WEIGHTED
         */
        var WEIGHTED = ig.pathfinding.WEIGHTED = _c.PATHFINDING.WEIGHTED;

        /**
         * Whether to allow diagonal movement.
         * @type {Boolean}
         * @see ig.CONFIG.PATHFINDING.ALLOW_DIAGONAL
         */
        var ALLOW_DIAGONAL = ig.pathfinding.ALLOW_DIAGONAL = _c.PATHFINDING.ALLOW_DIAGONAL;

        /**
         * Whether diagonal movement requires both direct movements to be walkable.
         * <br>- ex: when true, movement to the top left requires that both top and left are walkable
         * @type {Boolean}
         * @see ig.CONFIG.PATHFINDING.DIAGONAL_REQUIRES_BOTH_DIRECT
         */
        var DIAGONAL_REQUIRES_BOTH_DIRECT = ig.pathfinding.DIAGONAL_REQUIRES_BOTH_DIRECT = _c.PATHFINDING.DIAGONAL_REQUIRES_BOTH_DIRECT;

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
         * Base weight to apply to a node.
         * <span class="alert alert-info"><strong>Tip:</strong> the higher this is, the more likely a path will follow the pathfinding map.</span>
         * @type {Number}
         * @see ig.CONFIG.PATHFINDING.WEIGHT
         */
        var WEIGHT = ig.pathfinding.WEIGHT = _c.PATHFINDING.WEIGHT;

        /**
         * Node used in pathfinding calculations.
         * <span class="alert alert-danger"><strong>IMPORTANT:</strong> for garbage collector friendly code, a returned path consists of nodes from the pathfinding grid. Please don't modify the path points.</span>
         * @class
         * @extends ig.Class
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
             * Whether a pathing entity should jump when moving up through this node.
             * @type {Boolean}
             * @default
             */
            jump: true,

            /**
             * Id of tile node corresponds to.
             * @type {Number}
             * @default
             */
            tile: 0,

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
             * @property topleft false
             * @property topright false
             * @property bottomleft false
             * @property bottomright false
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
                this.climbable = _utt.isTileClimbable( this.tile );
                this.oneWay = _utt.isTileOneWay( this.tile );

                if ( this.oneWay ) {

                    if ( this.tile === _utt.TILE_ID.ONE_WAY_UP
                        || this.tile === _utt.TILE_ID.CLIMBABLE_WITH_TOP
                        || this.tile === _utt.TILE_ID.STAIRS_WITH_TOP ) {

                        this.oneWayFacing.y = -1;

                    }
                    else if ( this.tile === _utt.TILE_ID.ONE_WAY_DOWN ) {

                        this.oneWayFacing.y = 1;

                    }

                    if ( this.tile === _utt.TILE_ID.ONE_WAY_LEFT ) {

                        this.oneWayFacing.x = -1;

                    }
                    else if ( this.tile === _utt.TILE_ID.ONE_WAY_RIGHT ) {

                        this.oneWayFacing.x = 1;

                    }

                }

            },

            /**
             * Cleans node after use.
             * <br>- this method is called after each pathfinding on only nodes that were used
             */
            cleanup: function () {

                this.g = this.h = this.f = this.openIndex = 0;
                this.parent = null;
                this.closed = this.opened = false;

            }

        } );

        /**
         * Flag pathfinding to rebuild before next pathfind.
         * <br>- this is called automatically by {@link ig.GameExtended#buildLevel}
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
         * <span class="alert"><strong>IMPORTANT:</strong> this is called automatically by {@link ig.pathfinding#getPath}.</span>
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

                        gridRow[ x ] = new Node( worldX, worldY, x, y, _ut.indexOfValue( WALKABLE_COLLISION_TILES, tile ) !== -1, tile );

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

                }

            }

        };

        /**
         * Get the path to target entity from another entity.
         * <br>- path is constructed in reverse order to allow user to ".length--" to remove a node when reached, instead of shifting/splicing which is usually worse on performance.
         * @param {ig.EntityExtended} entityPathing entity to find path for
         * @param {ig.EntityExtended} entityTarget entity to find path to
         * @param {Boolean} [avoidEntities=false] whether to try to avoid entities
         * @param {Number} [searchDistance=infinity] maximum positive distance to search
         * @param {String} [heuristicType] Type of heuristic function to use
         * @returns {Array} path as a list of points with x and y properties.
         **/
        ig.pathfinding.getPathEntities = function(entityPathing, entityTarget, avoidEntities, searchDistance, heuristicType) {

            return ig.pathfinding.getPath(
                entityPathing.bounds.minX + entityPathing.bounds.width * 0.5,
                entityPathing.bounds.minY + entityPathing.bounds.height * 0.5,
                entityTarget.bounds.minX + entityTarget.bounds.width * 0.5,
                entityTarget.bounds.minY + entityTarget.bounds.height * 0.5,
                avoidEntities, searchDistance, entityPathing, entityTarget, heuristicType
            );

        };

        /**
         * Get the path to a point from an entity.
         * <br>- path is constructed in reverse order to allow user to ".length--" to remove a node when reached, instead of shifting/splicing which is usually worse on performance.
         * @param {ig.EntityExtended} entityPathing entity to find path for
         * @param {Number} targetX x position to path to
         * @param {Number} targetY y position to path to
         * @param {Boolean} [avoidEntities=false] whether to try to avoid entities
         * @param {Number} [searchDistance=infinity] maximum positive distance to search
         * @param {ig.EntityExtended} [entityTarget] entity to find path to
         * @param {String} [heuristicType] Type of heuristic function to use
         * @returns {Array} path as a list of points with x and y properties.
         **/
        ig.pathfinding.getPathEntityPoint = function(entityPathing, targetX, targetY, avoidEntities, searchDistance, entityTarget, heuristicType) {

            return ig.pathfinding.getPath(
                entityPathing.bounds.minX + entityPathing.bounds.width * 0.5,
                entityPathing.bounds.minY + entityPathing.bounds.height * 0.5,
                targetX, targetY, avoidEntities, searchDistance, entityPathing, entityTarget, heuristicType
            );

        };

        /**
         * Get the path to target point.
         * <br>- path is constructed in reverse order to allow user to ".length--" to remove a node when reached, instead of shifting/splicing which is usually worse on performance.
         * <span class="alert alert-danger"><strong>IMPORTANT:</strong> for garbage collector friendly code, a returned path consists of nodes from the pathfinding grid. Please don't modify the path points.</span>
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
        ig.pathfinding.getPath = function(fromX, fromY, targetX, targetY, avoidEntities, searchDistance, entityPathing, entityTarget, heuristicType) {
            //console.log( '==================== PATHFINDING ========================' );
            // init path

            var path;

            if ( entityPathing && entityPathing.path ) {

                path = entityPathing.path;
                path.length = 0;

            }
            else {

                path = [];

            }

            // rebuild grid if needed

            var grid = _grid;

            if ( grid.length === 0 ) {

                ig.pathfinding.rebuildGrid();

                // grid could not be rebuilt

                if ( grid.length === 0 ) {

                    return path;

                }

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
                    //console.log( '[!] path cost:', currentNode.f, 'after tried', closed.length );
                    while( currentNode ) {
                        //console.log( '> node', currentNode );
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

                        var deltaNeighborDestinationX = gridX - gridDestinationX;
                        var deltaNeighborDestinationY = gridY - gridDestinationY;

                        if ( deltaNeighborDestinationX * deltaNeighborDestinationX + deltaNeighborDestinationY * deltaNeighborDestinationY > searchDistance ) {

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
         * Get the walkable neighbors of the given node.
         * @param {ig.pathfinding.Node} node node to get neighbors for
         * @private
         */
        ig.pathfinding.getNeighbors = function(node){

            var neighbors = [];
            var gridX = node.gridX;
            var gridY = node.gridY;
            var grid = _grid;
            var neighbor;
            var top;
            var right;
            var bottom;
            var left;

            var row = grid[gridY];
            var prevRow = grid[gridY - 1];
            var nextRow = grid[gridY + 1];

            // ↑
            neighbor = prevRow && prevRow[gridX];
            if ( neighbor && neighbor.walkable && ig.pathfinding.isDirectionWalkable( neighbor, 0, -1 ) ) {

                neighbors.push( neighbor );
                top = true;

            }
            // →
            neighbor = row && row[gridX + 1];
            if ( neighbor && neighbor.walkable && ig.pathfinding.isDirectionWalkable( neighbor, 1, 0 ) ) {

                neighbors.push( neighbor );
                right = true;

            }
            // ↓
            neighbor = nextRow && nextRow[gridX];
            if ( neighbor && neighbor.walkable && ig.pathfinding.isDirectionWalkable( neighbor, 0, 1 ) ) {

                neighbors.push( neighbor );
                bottom = true;

            }
            // ←
            neighbor = row && row[gridX - 1];
            if ( neighbor && neighbor.walkable && ig.pathfinding.isDirectionWalkable( neighbor, -1, 0 ) ) {

                neighbors.push( neighbor );
                left = true;

            }

            // get diagonal neighbors as long as direct neighbors are walkable

            if ( ALLOW_DIAGONAL ) {

                var tl;
                var tr;
                var bl;
                var br;

                if ( DIAGONAL_REQUIRES_BOTH_DIRECT ) {

                    tl = top && left;
                    tr = top && right;
                    bl = bottom && left;
                    br = bottom && right;

                }
                else {

                    tl = top || left;
                    tr = top || right;
                    bl = bottom || left;
                    br = bottom || right;

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

                        var halfWidth = entityPathing.bounds.width * 0.45;
                        var halfHeight = entityPathing.bounds.height * 0.45;
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
                                && _uti.boundsAABBIntersect( entity.bounds, minX, minY, maxX, maxY ) ) {

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
         * Get if a node is one way from a direction.
         * @param {ig.pathfinding.Node} node node to check
         * @param {Number} dirX direction x coming from
         * @param {Number} dirY direction y coming from
         * @private
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
         * Check if node is walkable.
         * @param {Number} gridX x index of tile in {@link ig.CollisionMap#data}.
         * @param {Number} gridY y index of tile in {@link ig.CollisionMap#data}.
         * @returns {Boolean} whether node is walkable.
         * @private
         **/
        ig.pathfinding.isWalkableAt = function(gridX, gridY) {

            var node = _grid && _grid[gridY] && _grid[gridY][gridX];

            return node && node.walkable;

        };

        /**
         * Check if node is within the bounds of collision map
         * @param {Number} gridX x location of tile in {@link ig.CollisionMap#data}.
         * @param {Number} gridY y location of tile in {@link ig.CollisionMap#data}.
         * @returns {Boolean} whether node is within bounds.
         * @private
         **/
        ig.pathfinding.isPointInMap = function(gridX, gridY){

            return _grid && _grid[gridY] != null && _grid[gridY][gridX] != null;

        };

    });