ig.module(
        'plusplus.helpers.utilstile'
    )
    .requires(
        'plusplus.core.collision-map',
        'plusplus.helpers.utils',
        'plusplus.helpers.utilsintersection',
        'plusplus.helpers.utilsvector2'
    )
    .defines(function () {
        "use strict";

        var _ut = ig.utils;
        var _uti = ig.utilsintersection;
        var _utv2 = ig.utilsvector2;

        /**
         * Static utilities for working with tiles and collision maps.
         * <br>- shapes are extracted by {@link ig.GameExtended#loadLevel}, but the work is done by {@link ig.utilstile.shapesFromCollisionMap}
         * <span class="alert alert-info"><strong>Tip:</strong> Impact++ can automatically convert collision maps into shapes (vertices, edges, etc).</span>
         * @memberof ig
         * @namespace ig.utilstile
         * @author Collin Hover - collinhover.com
         **/
        ig.utilstile = {};

        // static values used in conversions

        var SEGMENT_A = 1;
        var SEGMENT_B = 2;
        var TILE_ONE_WAY_UP = 12;
        var TILE_ONE_WAY_DOWN = 23;
        var TILE_ONE_WAY_RIGHT = 34;
        var TILE_ONE_WAY_LEFT = 45;
        var TILE_CLIMBABLE_WITH_TOP = 100;
        var TILE_CLIMBABLE = 111;

        /**
         * Definitions of tile types as vertices so we don't have to recalculate each tile.
         * @type {Object}
         * @readonly
         */
        ig.utilstile.defaultTileVerticesDef = {};

        /**
         * Definitions of tile types as segments so we don't have to recalculate each tile.
         * @type {Object}
         * @readonly
         */
        ig.utilstile.defaultTileSegmentsDef = {};

        /**
         * Gets if a tile is one-way.
         * @param {String} tileId tile id.
         * @returns {Boolean} whether tile is one-way
         **/
        ig.utilstile.isTileOneWay = function (tileId) {

            return tileId === TILE_ONE_WAY_UP || tileId === TILE_ONE_WAY_DOWN || tileId === TILE_ONE_WAY_RIGHT || tileId === TILE_ONE_WAY_LEFT;

        };

        /**
         * Gets if a tile is climbable.
         * @param {String} tileId tile id.
         * @returns {Boolean} whether tile is climbable
         **/
        ig.utilstile.isTileClimbable = function (tileId) {

            return tileId === TILE_CLIMBABLE_WITH_TOP || tileId === TILE_CLIMBABLE;

        };

        /**
         * Gets if a tile is climbable and one way.
         * @param {String} tileId tile id.
         * @returns {Boolean} whether tile is climbable and one way
         **/
        ig.utilstile.isTileClimbableOneWay = function (tileId) {

            return tileId === TILE_CLIMBABLE_WITH_TOP;

        };

        /**
         * Extracts all shapes from an impact collision map, with vertices in clockwise order.
         * <br>- this method does its best to intelligently combine tiles into as big of shapes as it can
         * <br>- shapes consist of an x and y position, and a settings object with an array of vertices and a size object
         * @param {ig.CollisionMap} map map data object
         * @param {Object} options options object
         * @returns {Array} array of shapes including a list of oneWays, edges, and climbables
         * @example
         * // options is a plain object
         * options = {};
         * // we can ignore climbable tiles when extracting shapes
         * options.ignoreClimbables = true;
         * // we can ignore one way tiles when extracting shapes
         * options.ignoreOneWays = true;
         * // we can ignore solid tiles when extracting shapes
         * options.ignoreSolids = true;
         * // we can keep the outer boundary edge shape when converting a collision map
         * // but by default, the outer boundary is thrown away
         * // this is because it is unlikely the player will ever be outside the level
         * // so the outer boundary edge is usually useless
         * options.retainBoundaryOuter = true;
         * // we can throw away the inner boundary edge shape
         * // i.e. the edge shape on the inside of the outer boundary
         * options.discardBoundaryInner = true;
         * // we can also throw away any shapes inside the inner boundary edge shape
         * options.discardBoundaryInner = true;
         * // we can force rectangles to be created instead of contour shapes
         * // this is useful when we may have concave shapes that don't play nice with bounding boxes
         * options.rectangles = true;
         * // we can force just climbables to be rectangles
         * options.contourClimbables = false;
         * // we can force just solids to be rectangles
         * options.contourSolids = false;
         * // we can force shapes to only be constructed by tiles of the same type / id
         * options.ungrouped = false;
         * // we can throw away all collinear vertices to improve performance
         * options.discardCollinear = true;
         * // we can reverse the shape vertex order to counter-clockwise
         * options.reverse = true;
         **/
        ig.utilstile.shapesFromCollisionMap = function (map, options) {

            var shapes = {
                oneWays: [],
                edges: [],
                climbables: []
            };

            if (map instanceof ig.CollisionMap) {

                options = options || {};

                // copy data so we can clear spots we've already visited and used
                // data is edited as we go so we don't extract duplicates

                var data = ig.copy(map.data);

                // extract each tile shape from map

                var tilesize = map.tilesize;
                var width = map.width;
                var height = map.height;
                var solids = [];
                var climbables = [];
                var oneWays = [];
                var vertices, scaledVertices, segments, segment;

                var ix, iy, x, y;
                var i, il, tile, shape;

                for (iy = 0; iy < height; iy++) {

                    for (ix = 0; ix < width; ix++) {

                        shape = ig.utilstile.shapeFromTile(map, ix, iy);

                        tile = {
                            id: map.data[ iy ][ ix ],
                            ix: ix,
                            iy: iy,
                            x: ix * tilesize,
                            y: iy * tilesize,
                            width: tilesize,
                            height: tilesize,
                            shape: shape
                        };

                        // not empty

                        if (shape.vertices.length > 0) {

                            // copy, absolutely position, and scale vertices

                            scaledVertices = [];
                            vertices = shape.vertices;
                            segments = shape.segments;

                            for (i = 0, il = segments.length; i < il; i++) {

                                segment = segments[ i ];

                                var va = vertices[ segment.a ];
                                scaledVertices[ segment.a ] = { x: tile.x + va.x * tilesize, y: tile.y + va.y * tilesize };

                            }

                            shape.vertices = scaledVertices;

                            // add to list by type

                            if (ig.utilstile.isTileClimbable(tile.id) && !options.ignoreClimbables) {

                                climbables.push(tile);

                            }
                            else if (ig.utilstile.isTileOneWay(tile.id) && !options.ignoreOneWays) {

                                oneWays.push(tile);

                            }
                            else if (!options.ignoreSolids) {

                                solids.push(tile);

                            }

                        }

                        // store in copied data so other tiles can compare

                        data[ iy ][ ix ] = tile;

                    }

                }

                // solid tiles to shapes

                shapes.edges = shapes.edges.concat(ig.utilstile.shapedTilesToShapes(solids, data, {
                    retainBoundaryOuter: options.retainBoundaryOuter,
                    discardBoundaryInner: options.discardBoundaryInner,
                    discardEdgesInner: options.discardEdgesInner
                }));

                // climbable tiles to shapes

                shapes.climbables = shapes.climbables.concat(ig.utilstile.shapedTilesToShapes(climbables, data, {
                    rectangles: options.rectangles || !options.contourClimbables,
                    groupByTileId: !options.ungrouped
                }));

                // adjust climbable shapes by id

                for (i = 0, il = shapes.climbables.length; i < il; i++) {

                    shape = shapes.climbables[ i ];

                    if (shape.id === TILE_CLIMBABLE_WITH_TOP) {

                        shape.settings.oneWay = true;

                    }
                    else {

                        shape.settings.sensor = true;

                    }

                }

                // one-way tiles to shapes

                shapes.oneWays = shapes.oneWays.concat(ig.utilstile.shapedTilesToShapes(oneWays, data, {
                    rectangles: options.rectangles || !options.contourSolids,
                    groupByTileId: !options.ungrouped
                }));

                // adjust one-way shapes by id

                for (i = 0, il = shapes.oneWays.length; i < il; i++) {

                    shape = shapes.oneWays[ i ];

                    // one-way

                    if (ig.utilstile.isTileOneWay(shape.id)) {

                        shape.settings.oneWay = true;

                        // set one way facing (default up)

                        if (shape.id === TILE_ONE_WAY_DOWN) {

                            shape.settings.oneWayFacing = { x: 0, y: 1 };

                        }
                        else if (shape.id === TILE_ONE_WAY_RIGHT) {

                            shape.settings.oneWayFacing = { x: 1, y: 0 };

                        }
                        else if (shape.id === TILE_ONE_WAY_LEFT) {

                            shape.settings.oneWayFacing = { x: -1, y: 0 };

                        }

                    }

                }

            }

            return shapes;

        };

        /**
         * Converts a list of tiles with vertices into shapes.
         * <span class="alert alert-info"><strong>Tip:</strong> when converting tiles to shapes, is usually better to call {@link ig.utilstile.shapesFromCollisionMap}.</span>
         * @param {Array} tiles shaped tiles to convert
         * @param {Array} data 2d list of all tiles in map
         * @param {Object} options options object
         * @returns {Array} list of shapes
         **/
        ig.utilstile.shapedTilesToShapes = function (tiles, data, options) {

            options = options || {};

            var shapes = [];
            var vertices = [];
            var contours = [];
            var i, il, j, jl, index;

            // create tile groups from tiles

            if (options.groupByTileId) {

                // lets avoid infinite recursion!

                delete options.groupByTileId;

                // group by id

                var ids = [];
                var id;
                var groups = {};
                var group;

                for (i = 0, il = tiles.length; i < il; i++) {

                    var tile = tiles[ i ];

                    if (groups[ tile.id ]) {

                        groups[ tile.id ].push(tile);

                    }
                    else {

                        ids.push(tile.id);
                        groups[ tile.id ] = [ tile ];

                    }

                }

                // create shapes for each group

                for (i = 0, il = ids.length; i < il; i++) {

                    id = ids[ i ];
                    group = groups[ id ];
                    options.id = id;

                    shapes = shapes.concat(ig.utilstile.shapedTilesToShapes(group, data, options));

                }

            }
            else {

                // rectangle shapes that may or may not be concave

                if (options.rectangles) {

                    // step horizontal connected tiles
                    // add line if matches last, else create new rectangle

                    var tilePool = tiles.slice(0);
                    var rectangles = [];
                    var line, length, stepped, rectangle;

                    while (tilePool.length > 0) {

                        // get first horizontal line of tiles

                        line = ig.utilstile.findShapedTileLine(tilePool);
                        _ut.arrayCautiousRemoveMulti(tilePool, line);

                        length = line.length;
                        rectangle = line;
                        stepped = true;

                        // find as many matching length rows as possible

                        while (stepped) {

                            stepped = false;

                            var tileLast = line[ 0 ];
                            var tileFrom = data[ tileLast.iy ][ tileLast.ix + 1 ];

                            if (tileFrom) {

                                // get tile at start of next row and make sure it is part of tile pool

                                index = _ut.indexOfValue(tilePool, tileFrom);

                                if (index !== -1) {

                                    line = ig.utilstile.findShapedTileLine(tilePool, false, index, length);

                                    if (line.length === length) {

                                        _ut.arrayCautiousRemoveMulti(tilePool, line);

                                        rectangle = rectangle.concat(line);

                                        stepped = true;

                                    }

                                }

                            }

                        }

                        if (rectangle.length > 0) {

                            rectangles.push(rectangle);

                        }

                    }

                    for (j = 0, jl = rectangles.length; j < jl; j++) {

                        rectangle = rectangles[ j ];

                        // keep non-duplicate edge vertices

                        vertices = [];

                        for (i = 0, il = rectangle.length; i < il; i++) {

                            vertices = vertices.concat(ig.utilstile.getNonDuplicateSegmentVertices(rectangle[ i ], data, rectangle));

                        }

                        // vertices to contours

                        contours = contours.concat(ig.utilstile.verticesToContours(vertices, options));

                    }

                }
                // general shapes that may or may not be concave
                else {

                    // keep non-duplicate edge vertices

                    for (i = 0, il = tiles.length; i < il; i++) {

                        vertices = vertices.concat(ig.utilstile.getNonDuplicateSegmentVertices(tiles[ i ], data, tiles));

                    }

                    // vertices to contours

                    contours = ig.utilstile.verticesToContours(vertices, options);

                }

                // contours to shapes

                for (i = 0, il = contours.length; i < il; i++) {

                    var contour = contours[ i ];

                    shapes.push({
                        id: options.id,
                        x: contour.minX,
                        y: contour.minY,
                        settings: {
                            size: {
                                x: contour.width,
                                y: contour.height
                            },
                            vertices: contour.vertices
                        }
                    });

                }

            }

            return shapes;

        };

        /**
         * Finds the first line in either horizontal or vertical direction from tiles.
         * <span class="alert alert-info"><strong>Tip:</strong> when converting tiles to shapes, is usually better to call {@link ig.utilstile.shapesFromCollisionMap}.</span>
         * @param {Array} tiles shaped tiles to search.
         * @param {Boolean} [horizontal=false] line is horizontal, else vertical.
         * @param {Number} [indexFrom=0] index in tiles to start from.
         * @param {Number} [length=0] max length of line.
         * @returns {Array} list of tiles in line.
         **/
        ig.utilstile.findShapedTileLine = function (tiles, horizontal, indexFrom, length) {

            indexFrom = indexFrom || 0;
            length = length || 0;

            var tileFrom = tiles[ indexFrom ];
            var line = [];
            var stepped = true;
            var i, il;

            while (stepped) {

                stepped = false;

                // add tile to line

                line.push(tileFrom);

                if (line.length === length) {

                    break;

                }

                // step to next in line

                var tileNext = horizontal ? ig.utilstile.stepShapedTileHorizontally(tiles, tileFrom) : ig.utilstile.stepShapedTileVertically(tiles, tileFrom);

                if (tileFrom !== tileNext) {

                    stepped = true;
                    tileFrom = tileNext;

                }

            }

            return line;

        };

        /**
         * Attempts to step to the next tile horizontally.
         * <span class="alert alert-info"><strong>Tip:</strong> when converting tiles to shapes, is usually better to call {@link ig.utilstile.shapesFromCollisionMap}.</span>
         * @param {Array} tiles shaped tiles to search
         * @param {Object} tileFrom tile stepping from
         * @returns {Object} next tile, or current tile if next not found
         **/
        ig.utilstile.stepShapedTileHorizontally = function (tiles, tileFrom) {

            for (var i = 0, il = tiles.length; i < il; i++) {

                var tileNext = tiles[ i ];

                if (tileFrom.iy === tileNext.iy && tileFrom.ix + 1 === tileNext.ix) {

                    return tileNext;

                }

            }

            return tileFrom;

        };

        /**
         * Attempts to step to the next tile vertically.
         * <span class="alert alert-info"><strong>Tip:</strong> when converting tiles to shapes, is usually better to call {@link ig.utilstile.shapesFromCollisionMap}.</span>
         * @param {Array} tiles shaped tiles to search
         * @param {Object} tileFrom tile stepping from
         * @returns {Object} next tile, or current tile if next not found
         **/
        ig.utilstile.stepShapedTileVertically = function (tiles, tileFrom) {

            for (var i = 0, il = tiles.length; i < il; i++) {

                var tileNext = tiles[ i ];

                if (tileFrom.ix === tileNext.ix && tileFrom.iy + 1 === tileNext.iy) {

                    return tileNext;

                }

            }

            return tileFrom;

        };

        /**
         * Converts a list of vertices into contours.
         * <span class="alert alert-info"><strong>Tip:</strong> when converting tiles to shapes, is usually better to call {@link ig.utilstile.shapesFromCollisionMap}.</span>
         * @param {Array} vertices list of vertices
         * @param {Object} options options object
         * @returns {Array} list of contours
         **/
        ig.utilstile.verticesToContours = function (vertices, options) {

            var contours = [];

            if (vertices.length > 1) {

                options = options || {};

                // find each contour within vertices

                var vertexPool = vertices.slice(0);
                var contour = {
                    vertices: [],
                    minX: Number.MAX_VALUE,
                    minY: Number.MAX_VALUE,
                    maxX: -Number.MAX_VALUE,
                    maxY: -Number.MAX_VALUE
                };
                var contourVertices = contour.vertices;
                var vb = vertexPool.pop();
                var va = vertexPool.pop();
                var pva, pvb;
                var sva, svb;
                var i, il, j, jl;

                // length > -2 because we need 1 extra loop for final segment/contour

                while (vertexPool.length > -2) {

                    var stepped = false;

                    // if we haven't looped around, try to step to next

                    sva = contourVertices[ 0 ];
                    svb = contourVertices[ 1 ];

                    if (contourVertices.length <= 2 || vb.x !== sva.x || vb.y !== sva.y) {

                        for (i = 0, il = vertexPool.length; i < il; i += 2) {

                            pva = vertexPool[ i ];
                            pvb = vertexPool[ i + 1 ];

                            if (vb.x === pva.x && vb.y === pva.y) {

                                stepped = true;
                                break;

                            }

                        }

                    }

                    // only add the second vector of each pair

                    contourVertices.push(vb);

                    // update contour min/max

                    if (vb.x < contour.minX) contour.minX = vb.x;
                    if (vb.x > contour.maxX) contour.maxX = vb.x;
                    if (vb.y < contour.minY) contour.minY = vb.y;
                    if (vb.y > contour.maxY) contour.maxY = vb.y;

                    if (stepped === true) {

                        vertexPool.splice(i, 2);
                        va = pva;
                        vb = pvb;

                    }
                    else {

                        contours.push(contour);

                        if (vertexPool.length > 0) {

                            contour = {
                                vertices: []
                            };
                            contour.minX = contour.minY = Number.MAX_VALUE;
                            contour.maxX = contour.maxY = -Number.MAX_VALUE;
                            contourVertices = contour.vertices;

                            vb = vertexPool.pop();
                            va = vertexPool.pop();

                        }
                        else {

                            break;

                        }

                    }

                }

                // set contour size

                for (i = 0, il = contours.length; i < il; i++) {

                    contour = contours[ i ];
                    contour.width = contour.maxX - contour.minX;
                    contour.height = contour.maxY - contour.minY;

                }

                // sort contours by largest up

                contours.sort(function (a, b) {

                    return ( b.width * b.width + b.height * b.height ) - ( a.width * a.width + a.height * a.height );

                });

                // test each contour to find containing contours
                // if shape's AABB is fully contained by another shape, make chain ordered from smallest to largest

                var contourPool = contours.slice(0);
                var containerChains = [];
                var containerChain = [];
                var containingContour, contained;

                contour = contourPool.pop();

                while (contourPool.length > -1) {

                    contained = false;

                    if (contour) {

                        // search contours instead of contour pool so we can find all containers

                        for (i = contours.length - 1; i > -1; i--) {

                            containingContour = contours[ i ];

                            if (contour !== containingContour && _uti.AABBContains(contour.minX, contour.minY, contour.maxX, contour.maxY, containingContour.minX, containingContour.minY, containingContour.maxX, containingContour.maxY)) {

                                contained = true;
                                break;

                            }

                        }

                        containerChain.push(contour);

                    }

                    if (contained) {

                        contourPool.erase(containingContour);
                        contour = containingContour;

                    }
                    else {

                        if (containerChain.length > 1) {

                            containerChains.push(containerChain);

                        }

                        if (contourPool.length > 0) {

                            containerChain = [];

                            contour = contourPool.pop();

                        }
                        else {

                            break;

                        }

                    }

                }

                // check each container chain

                var contoursReversed = [];
                var contoursRemoved = [];

                for (i = 0, il = containerChains.length; i < il; i++) {

                    containerChain = containerChains[ i ];
                    var outerBoundary = containerChain[ containerChain.length - 1 ];
                    var innerBoundary = containerChain[ containerChain.length - 2 ];

                    // reverse vertices of every other contour to avoid creating ccw contours
                    // this happens because converting tiles to vertices cannot control the direction of the segments

                    // even length chain, start with first

                    if (containerChain.length % 2 === 0) {

                        j = 0;

                    }
                    // odd length chain, start with second
                    else {

                        j = 1;

                    }

                    for (jl = containerChain.length; j < jl; j += 2) {

                        contour = containerChain[ j ];

                        if (_ut.indexOfValue(contoursReversed, contour) === -1) {

                            contour.vertices.reverse();
                            contoursReversed.push(contour);

                        }

                    }

                    // discard outer boundary contour
                    // generally, we know that the tiles have edges on both sides
                    // so there should always be a container at the end of the chain that wraps the outside
                    // we don't need these edges/vertices as it is unlikely the player will ever walk outside the map

                    if (!options.retainBoundaryOuter && _ut.indexOfValue(contoursRemoved, outerBoundary) === -1) {

                        contoursRemoved.push(outerBoundary);
                        _ut.arrayCautiousRemove(contours, outerBoundary);

                    }

                    // discard inner boundary contour

                    if (options.discardBoundaryInner && _ut.indexOfValue(contoursRemoved, innerBoundary) === -1) {

                        contoursRemoved.push(innerBoundary);
                        _ut.arrayCautiousRemove(contours, innerBoundary);

                    }

                    // discard anything beyond inner boundary contour

                    if (options.discardEdgesInner && containerChain.length > 2) {

                        var otherContours = containerChain.slice(2);
                        contoursRemoved = contoursRemoved.concat(otherContours);
                        _ut.arrayCautiousRemoveMulti(contours, otherContours);

                    }

                }

                // finalize contours

                for (i = 0, il = contours.length; i < il; i++) {

                    contour = contours[ i ];
                    contourVertices = contour.vertices;

                    // optimization (default): find and remove all intermediary collinear vertices

                    if (!options.discardCollinear) {

                        sva = contourVertices[ 0 ];

                        for (j = contourVertices.length - 1; j > 0; j--) {

                            va = contourVertices[ j ];
                            vb = contourVertices[ j - 1 ];

                            if (_utv2.pointsCW(sva, va, vb) === 0) {

                                contourVertices.splice(j, 1);

                            }
                            else {

                                sva = va;

                            }

                            va = vb;

                        }

                        // do one extra collinear check with first vertex as target for removal

                        if (_utv2.pointsCW(contourVertices[ j + 1 ], contourVertices[ j ], contourVertices[ contourVertices.length - 1 ]) === 0) {

                            contourVertices.splice(0, 1);

                        }

                    }

                    // if vertices should be in reverse order

                    if (options.reverse) {

                        contourVertices.reverse();

                    }

                    // make vertices relative

                    var minX = contour.minX;
                    var minY = contour.minY;
                    var width = contour.width;
                    var height = contour.height;

                    for (j = 0, jl = contourVertices.length; j < jl; j++) {

                        va = contourVertices[ j ];
                        va.x -= minX + width * 0.5;
                        va.y -= minY + height * 0.5;

                    }

                }

            }

            return contours;

        };

        /**
         * Generates boolean for empty or, if solid, vertices and segments in clockwise order from a tile.
         * <span class="alert alert-info"><strong>Tip:</strong> when converting tiles to shapes, is usually better to call {@link ig.utilstile.shapesFromCollisionMap}.</span>
         * @param {Object} map collision Map
         * @param {Number} ix x position
         * @param {Number} iy y Position
         * @returns {Object} object with array of 0 to 5 vertices and array of 0 to 5 segments
         **/
        ig.utilstile.shapeFromTile = function (map, ix, iy) {

            var i, il;
            var tileId = map.data[ iy ][ ix ];
            var vertices = ig.utilstile.verticesFromTile(map, ix, iy);
            var segments;

            if (vertices) {

                // get or compute segments from tile

                if (ig.utilstile.defaultTileSegmentsDef[ tileId ]) {

                    segments = ig.utilstile.defaultTileSegmentsDef[ tileId ];

                }
                else {

                    ig.utilstile.defaultTileSegmentsDef[ tileId ] = segments = [];

                    for (i = 0, il = vertices.length; i < il; i++) {

                        var va = vertices[ i ];
                        var indexB = i === il - 1 ? 0 : i + 1;
                        var vb = vertices[ indexB ];

                        // store segment with pre-computed normal for later use
                        // normal should be facing out and normalized between 0 and 1

                        var dx = vb.x - va.x;
                        var dy = vb.y - va.y;
                        var l = Math.sqrt(dx * dx + dy * dy);
                        var nx = dy / l;
                        var ny = -dx / l;

                        segments.push({ a: i, b: indexB, normal: { x: nx, y: ny } });

                    }

                }

            }

            return {
                vertices: vertices,
                segments: segments || []
            };

        };

        /**
         * Generates boolean for empty or, if solid, vertices in clockwise order from a tile.9
         * <br>- this function makes some assumptions about tiles, such as being either 3, 4, or 5 sided, always having a corner, and being convex
         * <span class="alert alert-info"><strong>Tip:</strong> when converting tiles to shapes, is usually better to call {@link ig.utilstile.shapesFromCollisionMap}.</span>
         * @param {Object} map Collision Map
         * @param {Number} ix x position
         * @param {Number} iy y Position
         * @returns {Array} array of 0 to 5 vertices
         **/
        ig.utilstile.verticesFromTile = function (map, ix, iy) {

            var tileId = map.data[ iy ][ ix ];
            var vertices;

            // get or compute shape from tile

            if (ig.utilstile.defaultTileVerticesDef[ tileId ]) {

                vertices = ig.utilstile.defaultTileVerticesDef[ tileId ];

            }
            else {

                // solid square (1) or climbable (100/111)

                if (tileId === 1 || ig.utilstile.isTileClimbable(tileId)) {

                    vertices = [
                        { x: 0, y: 0 },
                        { x: 1, y: 0 },
                        { x: 1, y: 1 },
                        { x: 0, y: 1 }
                    ];

                }
                // solid sloped
                else {

                    vertices = [];

                    // find vertices

                    var def = map.tiledef[ tileId ];

                    if (def) {

                        var va = vertices[ 0 ] = { x: def[0], y: def[1] };
                        var vb = vertices[ 1 ] = { x: def[2], y: def[3] };
                        var ax = va.x;
                        var ay = va.y;
                        var bx = vb.x;
                        var by = vb.y;
                        var fx = bx - ax;
                        var fy = by - ay;

                        // we have two points and the slope's facing direction
                        // find remaining points

                        // corner

                        var vc = vertices[ 2 ] = { x: ( fy < 0 ? 1 : 0 ), y: ( fx > 0 ? 1 : 0 ) };
                        var cx = vc.x;
                        var cy = vc.y;

                        var vd, ve, dax, day, dbx, dby;

                        // check if 5 sided

                        var fiveSided = false;

                        if (Math.abs(fx) < 1 && Math.abs(fy) < 1) {

                            var quadrantA = _utv2.pointQuadrant(ax, ay, 0.5, 0.5);
                            var quadrantB = _utv2.pointQuadrant(bx, by, 0.5, 0.5);
                            var quadrantC = _utv2.pointQuadrant(cx, cy, 0.5, 0.5);

                            if (!( quadrantA & quadrantC ) && !( quadrantB & quadrantC )) {

                                fiveSided = true;

                            }

                        }

                        if (fiveSided === true) {

                            // generate vertices in both directions from corner

                            if (cx !== cy) {

                                dax = cx;
                                dby = cy;

                                if (cx == 1) {

                                    day = 1;
                                    dbx = 0;

                                }
                                else {

                                    day = 0;
                                    dbx = 1;

                                }

                            }
                            else {

                                day = cy;
                                dbx = cx;

                                if (cx == 1) {

                                    dax = 0;
                                    dby = 0;

                                }
                                else {

                                    dax = 1;
                                    dby = 1;

                                }

                            }

                            vd = vertices[ 3 ] = { x: dax, y: day };
                            ve = vertices[ 4 ] = { x: dbx, y: dby };

                        }
                        else {

                            // check from corner to connected points
                            // generate d vertices in both directions for testing against a and b

                            if (cx !== cy) {

                                dax = cx;
                                dby = cy;

                                if (cx == 1) {

                                    day = Math.max(ay, by);
                                    dbx = Math.min(ax, bx);

                                }
                                else {

                                    day = Math.min(ay, by);
                                    dbx = Math.max(ax, bx);

                                }

                            }
                            else {

                                day = cy;
                                dbx = cx;

                                if (cx == 1) {

                                    dax = Math.min(ax, bx);
                                    dby = Math.min(ay, by);

                                }
                                else {

                                    dax = Math.max(ax, bx);
                                    dby = Math.max(ay, by);

                                }

                            }

                            // da is duplicate of a

                            if (( dax === ax && day === ay ) || ( dax === bx && day === by )) {

                                // db is not duplicate of b

                                if (!( ( dbx === ax && dby === ay ) || ( dbx === bx && dby === by ) )) {

                                    vd = vertices[ 3 ] = { x: dbx, y: dby };

                                }

                            }
                            else {

                                vd = vertices[ 3 ] = { x: dax, y: day };

                            }

                        }

                        vertices = _utv2.pointsToConvexHull(vertices);

                    }

                    // store so we don't compute again

                    ig.utilstile.defaultTileVerticesDef[ tileId ] = vertices;

                }

            }

            return vertices;

        };

        /**
         * Checks and returns all of a tile's non-duplicate segment vertices.
         * <span class="alert alert-info"><strong>Tip:</strong> when converting tiles to shapes, is usually better to call {@link ig.utilstile.shapesFromCollisionMap}.</span>
         * @param {Object} tile shaped tile
         * @param {Array} tileData tiles data (2D array).
         * @param {Array} tilesAllowed tiles allowed to check against (flat array)
         * @returns {Array} list of vertices
         **/
        ig.utilstile.getNonDuplicateSegmentVertices = function (tile, tileData, tilesAllowed) {

            var ix = tile.ix;
            var iy = tile.iy;
            var shape = tile.shape;
            var vertices = shape.vertices;
            var segments = shape.segments;
            var nonDuplicates = [];

            // add segment vertices in clockwise order while checking for duplicates

            var i, il;
            var j, jl;

            for (i = 0, il = segments.length; i < il; i++) {

                var segment = segments[ i ];
                var va = vertices[ segment.a ];
                var vb = vertices[ segment.b ];
                var normal = segment.normal;
                var overlap = false;

                // if normal is axis aligned to x/y
                // compare segment to touching tiles from normal direction

                if (( normal.x === 0 && normal.y !== 0 ) || ( normal.x !== 0 && normal.y === 0 )) {

                    var touchingTiles = ig.utilstile.getTouchingTilesByDirection(tile, normal, tileData, tilesAllowed);

                    // check each touching for overlap

                    for (j = 0, jl = touchingTiles.length; j < jl; j++) {

                        var touchingTile = touchingTiles[ j ];

                        if (touchingTile.shape.vertices.length > 0) {

                            overlap = ig.utilstile.getSegmentOverlapWithTile(va, vb, normal, touchingTile);

                            if (overlap) break;

                        }

                    }

                }

                // no overlap at all

                if (overlap === false) {

                    nonDuplicates.push(va, vb);

                }
                // partial overlap found, use returned non-overlapping segment
                else if (overlap.segmentA) {

                    nonDuplicates.push(overlap.segmentA.va, overlap.segmentA.vb);

                }

            }

            return nonDuplicates;

        };

        /**
         * Gets touching tiles based on a direction.
         * <span class="alert alert-info"><strong>Tip:</strong> when converting tiles to shapes, is usually better to call {@link ig.utilstile.shapesFromCollisionMap}.</span>
         * @param {Object} tile shaped tile
         * @param {Object} direction direction to look (normalized)
         * @param {Array} tileData tiles data (2D array)
         * @param {Array} tilesAllowed tiles allowed to check against (flat array)
         * @returns {Array} all tiles directly touching a tile based on direction
         **/
        ig.utilstile.getTouchingTilesByDirection = function (tile, direction, tileData, tilesAllowed) {

            var ix = tile.ix;
            var iy = tile.iy;
            var nx = direction.x;
            var ny = direction.y;
            var touchingTiles = [];
            var touchingTile;
            var row;

            if (nx !== 0) {

                row = tileData[ iy ];

                if (nx > 0) {

                    if (ix < row.length - 1) {

                        touchingTile = row[ ix + 1 ];

                        if (!tilesAllowed || _ut.indexOfValue(tilesAllowed, touchingTile) !== -1) {

                            touchingTiles.push(touchingTile);

                        }

                    }

                }
                else {

                    if (ix > 0) {

                        touchingTile = row[ ix - 1 ];

                        if (!tilesAllowed || _ut.indexOfValue(tilesAllowed, touchingTile) !== -1) {

                            touchingTiles.push(touchingTile);

                        }

                    }

                }

            }

            if (ny !== 0) {

                if (ny > 0) {

                    if (iy < tileData.length - 1) {

                        touchingTile = tileData[ iy + 1 ][ ix ];

                        if (!tilesAllowed || _ut.indexOfValue(tilesAllowed, touchingTile) !== -1) {

                            touchingTiles.push(touchingTile);

                        }

                    }

                }
                else {

                    if (iy > 0) {

                        touchingTile = tileData[ iy - 1 ][ ix ];

                        if (!tilesAllowed || _ut.indexOfValue(tilesAllowed, touchingTile) !== -1) {

                            touchingTiles.push(touchingTile);

                        }

                    }

                }

            }

            return touchingTiles;

        };

        /**
         * Gets if a segment overlaps a tile edge.
         * <span class="alert alert-info"><strong>Tip:</strong> when converting tiles to shapes, is usually better to call {@link ig.utilstile.shapesFromCollisionMap}.</span>
         * @param {Number} vaA segment vertex a
         * @param {Number} vbA segment vertex b
         * @param {Vector2|Object} normalCompare facing normal of segment
         * @param {Object} tile shaped tile to compare segment to
         * @returns {Boolean|Object} no overlap = false, full overlap = true, partial overlap = object with area not overlapped
         **/
        ig.utilstile.getSegmentOverlapWithTile = function (vaA, vbA, normalCompare, tile) {

            var overlap = false;
            var shape = tile.shape;
            var vertices = shape.vertices;
            var segments = shape.segments;
            var i, il;
            var segmentPotential, normal, segment;

            // find overlapping segment, assuming no more than 1 overlap can occur in a tile

            for (i = 0, il = segments.length; i < il; i++) {

                segmentPotential = segments[ i ];
                normal = segmentPotential.normal;

                // for any overlap to occur, normals must be pointing in opposite directions

                if (normalCompare.x === -normal.x && normalCompare.y === -normal.y) {

                    segment = segmentPotential;
                    break;

                }

            }

            if (segment) {

                var vaB = vertices[ segment.a ];
                var vbB = vertices[ segment.b ];
                var xaA = vaA.x;
                var yaA = vaA.y;
                var xbA = vbA.x;
                var ybA = vbA.y;
                var xaB = vaB.x;
                var yaB = vaB.y;
                var xbB = vbB.x;
                var ybB = vbB.y;
                var xlA = xbA - xaA;
                var ylA = ybA - yaA;
                var lenA = Math.sqrt(xlA * xlA + ylA * ylA);
                var xnA = xlA / lenA;
                var ynA = ylA / lenA;
                var xlB = xaB - xbB;
                var ylB = yaB - ybB;
                var lenB = Math.sqrt(xlB * xlB + ylB * ylB);
                var xnB = xlB / lenB;
                var ynB = ylB / lenB;
                var cross = xnA * ynB - ynA * xnB;

                // if cross product = 0, lines are parallel
                // no need to check for collinearity

                if (cross === 0) {

                    var saebMin, saebMax, easbMin, easbMax, normal;
                    var minCompare, maxCompare, property;

                    // horizontal lines

                    if (xnA !== 0) {

                        saebMin = Math.min(xaA, xbB);
                        saebMax = Math.max(xaA, xbB);
                        easbMin = Math.min(xbA, xaB);
                        easbMax = Math.max(xbA, xaB);
                        normal = xnA;
                        minCompare = xaA;
                        maxCompare = xbA;
                        property = 'x';

                    }
                    // vertical lines
                    else {

                        saebMin = Math.min(yaA, ybB);
                        saebMax = Math.max(yaA, ybB);
                        easbMin = Math.min(ybA, yaB);
                        easbMax = Math.max(ybA, yaB);
                        normal = ynA;
                        minCompare = yaA;
                        maxCompare = ybA;
                        property = 'y';

                    }

                    // fully overlapping

                    if (saebMin === saebMax && easbMin === easbMax) {

                        overlap = true;

                    }
                    // partial or no overlap
                    else {

                        var overlappingBy = normal < 0 ? saebMin - easbMax : easbMin - saebMax;

                        // find edges outside partial overlap

                        if (overlappingBy > 0) {

                            // duplicate will be new edges instead of boolean

                            overlap = {
                                segmentA: { va: { x: vaA.x, y: vaA.y }, vb: { x: vbA.x, y: vbA.y } },
                                segmentB: { va: { x: vaB.x, y: vaB.y }, vb: { x: vbB.x, y: vbB.y } }
                            };

                            var min, max;
                            var wipeout = true;

                            if (normal < 0) {

                                min = saebMin === saebMax ? 0 : ( saebMin === minCompare ? SEGMENT_B : SEGMENT_A );
                                max = easbMin === easbMax ? 0 : ( easbMax === maxCompare ? SEGMENT_B : SEGMENT_A );

                                if (min === SEGMENT_A) {
                                    overlap.segmentA.vb[ property ] += overlappingBy;
                                    wipeout = false;
                                }
                                else if (min === SEGMENT_B) {
                                    overlap.segmentB.va[ property ] += overlappingBy;
                                }
                                if (max === SEGMENT_A) {
                                    overlap.segmentA.va[ property ] -= overlappingBy;
                                    wipeout = false;
                                }
                                else if (max === SEGMENT_B) {
                                    overlap.segmentB.vb[ property ] -= overlappingBy;
                                }

                                // other edge may be bigger and fully overlapping this one

                                if (wipeout === true) {
                                    overlap = true;
                                }

                            }
                            else {

                                min = saebMin === saebMax ? 0 : ( saebMin === minCompare ? SEGMENT_A : SEGMENT_B );
                                max = easbMin === easbMax ? 0 : ( easbMax === maxCompare ? SEGMENT_A : SEGMENT_B );

                                if (min === SEGMENT_A) {
                                    overlap.segmentA.vb[ property ] -= overlappingBy;
                                    wipeout = false;
                                }
                                else if (min === SEGMENT_B) {
                                    overlap.segmentB.va[ property ] -= overlappingBy;
                                }
                                if (max === SEGMENT_A) {
                                    overlap.segmentA.va[ property ] += overlappingBy;
                                    wipeout = false;
                                }
                                else if (max === SEGMENT_B) {
                                    overlap.segmentB.vb[ property ] += overlappingBy;
                                }

                                // other edge may be bigger and fully overlapping this one

                                if (wipeout === true) {
                                    overlap = true;
                                }

                            }

                        }

                    }

                }

            }

            return overlap;

        };

    });