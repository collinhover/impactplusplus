/**
 * Static utilities for physics.
 * @author Collin Hover - collinhover.com
 **/
ig.module(
	'game.helpers.utilsphysics'
)
.requires(
    'impact.collision-map',
    'game.helpers.utils',
    'game.helpers.utilsmath',
	'game.physics.box2d'
)
.defines( function(){ "use strict";

var _u = ig.utils;
var _um = ig.utilsmath;
var _b2 = ig.Box2D;
var _up = ig.utilsphysics = {};

// static values used in conversions

var VELOCITY_TO_SPEED = 2.25;
var SEGMENT_A = 1;
var SEGMENT_B = 2;

// definition objects for tile to shape conversions

_up.defaultTileVerticesDef = {};
_up.defaultTileSegmentsDef = {};

/**
 * Converts between speed and velocity, useful for objects using a motorized joint.
 * @param {Number} velocity.
 * @param {Number} radius.
 * @returns {Number} converted.
 **/
_up.getSpeedFromVelocity = function ( velocity, radius ) {
	
	return VELOCITY_TO_SPEED * velocity / ( radius * _b2.SCALE * 2 );
	
};

_up.getVelocityFromSpeed = function ( speed, radius ) {
	
	return speed * ( radius * _b2.SCALE * 2 ) / VELOCITY_TO_SPEED;
	
};

/**
 * Converts plain objects with relative x and y to entity into b2Vec2.
 * @param {Array} vertices relative to entity.
 * @param {Number} half of entity size x to offset.
 * @param {Number} half of entity size x to offset.
 * @returns {Array} vertices relative to entity.
 **/
_up.getb2Vectors = function ( vertices, halfSizeX, halfSizeY ) {
	
	halfSizeX = halfSizeX || 0;
	halfSizeY = halfSizeY || 0;
	
	var b2vertices = [];
	
	for ( var i = 0; i < vertices.length; i++ ){
		
		var vertex = vertices[ i ];
		
		b2vertices[ i ] = new _b2.Vec2(
			( vertex.x - halfSizeX ) * _b2.SCALE,
			( vertex.y - halfSizeY ) * _b2.SCALE
		);
		
	}
	
	return b2vertices;
	
};

/**
* Executes a callback on each fixture in a body.
* @param {Object} Body object.
* @param {Function} Callback to call.
* @param {Object|Array} Arguments to pass to the callback.
**/
_up.forEachFixture = function ( body, callback, args ) {
	
	var fixture = body.GetFixtureList();
	while( fixture ) {
		callback.apply( fixture, args );
		var next = fixture.GetNext();
		fixture = fixture !== next && next;
	}
	
};

/**
* Extracts all physics shapes from an impact collision map.
* @param {CollisionMap} Map data object.
* @returns {Array} array of shapes.
**/
_up.shapesFromCollisionMap = function( map ) {
    
    var shapes = [];
    
    if ( map instanceof ig.CollisionMap ) {
		
		// copy data so we can clear spots we've already visited and used
		// data is edited as we go so we don't extract duplicates
		
        var data = ig.copy( map.data );
        
        // extract each tile shape from map
		
		var tilesize = map.tilesize;
		var width = map.width;
		var height = map.height;
		var solids = [];
		var vertices, scaledVertices, segments, segment;
		
		var ix, iy, x, y;
		var i, il, j, jl, tile, shape;
        
        for( iy = 0; iy < height; iy++ ) {
			
            for( ix = 0; ix < width; ix++ ) {
                
				shape = _up.shapeFromTile( map, ix, iy );
                
				tile = {
					ix: ix,
					iy: iy,
					x: ix * tilesize,
					y: iy * tilesize,
					shape: shape
				};
				
				// not empty
				
				if ( shape.vertices.length > 0 ) {
					
					// copy, absolutely position, and scale vertices
					
					scaledVertices = [];
					vertices = shape.vertices;
					segments = shape.segments;
					
					for ( i = 0, il = segments.length; i < il; i++ ) {
						
						segment = segments[ i ];
						
						var va = vertices[ segment.a ];
						scaledVertices[ segment.a ] = { x: tile.x + va.x * tilesize, y: tile.y + va.y * tilesize };
						
					}
					
					shape.vertices = scaledVertices;
					
					solids.push( tile );
                    
				}
				
				data[ iy ][ ix ] = tile;
                
            }
			
        }
		
		// check each solid tile and keep non-duplicate edge vertices
		
		vertices = [];
		
		for ( i = 0, il = solids.length; i < il; i++ ) {
			
			vertices = vertices.concat( _up.getNonDuplicateSegmentVertices( solids[ i ], data ) );
			
		}
		
		// vertices to shapes
		
		if ( vertices.length > 0 ) {
			
			// find each contour within vertices
			
			var vertexPool = vertices.slice( 0 );
			var contours = [];
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
			var stepped;
			
			// length > -2 because we need 1 extra loop for final segment/contour
			
			while ( vertexPool.length > -2 ) {
				
				stepped = false;
				
				// if we haven't looped around, try to step to next
				
				sva = contourVertices[ 0 ];
				svb = contourVertices[ 1 ];
				
				if ( contourVertices.length <= 2 || vb.x !== sva.x || vb.y !== sva.y ) {
					
					for ( i = 0, il = vertexPool.length; i < il; i += 2 ) {
						
						pva = vertexPool[ i ];
						pvb = vertexPool[ i + 1 ];
						
						if ( vb.x === pva.x && vb.y === pva.y ) {
							
							stepped = true;
							break;
							
						}
						
					}
					
				}
				
				// only add the second vector of each pair
				// add to start to keep vertices in clockwise order
				
				contourVertices.unshift( vb );
				
				// update contour min/max
				
				if ( vb.x < contour.minX ) contour.minX = vb.x;
				if ( vb.x > contour.maxX ) contour.maxX = vb.x;
				if ( vb.y < contour.minY ) contour.minY = vb.y;
				if ( vb.y > contour.maxY ) contour.maxY = vb.y;
				
				if ( stepped === true ) {
					
					vertexPool.splice( i, 2 );
					va = pva;
					vb = pvb;
					
				}
				else {
					
					contours.push( contour );
					
					if ( vertexPool.length > 0 ) {
						
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
			
			for ( i = 0, il = contours.length; i < il; i++ ) {
				
				contour = contours[ i ];
				contour.width = contour.maxX - contour.minX;
				contour.height = contour.maxY - contour.minY;
				
			}
			
			// sort contours by largest up
			
			contours.sort( function ( a, b ) {
				
				return ( b.width * b.width + b.height * b.height ) - ( a.width * a.width + a.height * a.height );
				
			} );
			
			// test each contour to find containing contours
			// if shape's AABB is fully contained by another shape, make chain ordered from smallest to largest
			
			var contourPool = contours.slice( 0 );
			var containerChains = [];
			var containerChain = [];
			var containingContour, contained;
			
			contour = contourPool.pop();
			
			while ( contourPool.length > -1 ) {
				
				contained = false;
				
				if ( contour ) {
					
					// search contours instead of contour pool so we can find all containers
					
					for( i = contours.length - 1; i > -1; i--) {
						
						containingContour = contours[ i ];
						
						if ( contour !== containingContour && _um.AABBContainedByAABB( contour.minX, contour.minY, contour.maxX, contour.maxY, containingContour.minX, containingContour.minY, containingContour.maxX, containingContour.maxY ) ) {
							
							contained = true;
							break;
							
						}
						
					}
					
					containerChain.push( contour );
					
				}
				
				if ( contained ) {
					
					contourPool.erase( containingContour );
					contour = containingContour;
					
				}
				else {
					
					if ( containerChain.length > 1 ) {
						
						containerChains.push( containerChain );
						
					}
					
					if ( contourPool.length > 0 ) {
						
						containerChain = [];
						
						contour = contourPool.pop();
						
					}
					else {
						
						break;
						
					}
					
				}
				
			}
			
			// check each container chain and discard last
			// generally, we know that the tiles have edges on both sides
			// so there should always be a container at the end of the chain that wraps the outside
			// we don't need these edges/vertices as it is unlikely the player will ever walk outside the map
			
			var contoursRemoved = [];
			
			for ( i = 0, il = containerChains.length; i < il; i++ ) {
				
				containerChain = containerChains[ i ];
				contour = containerChain[ containerChain.length - 1 ];
				
				// only try to remove if we haven't already removed it
				
				if ( _u.indexOfValue( contoursRemoved, contour ) === -1 ) {
					
					contoursRemoved.push( contour );
					contours.erase( contour );
					
				}
				
			}
			
			// finalize contours
			
			for ( i = 0, il = contours.length; i < il; i++ ) {
				
				contour = contours[ i ];
				contourVertices = contour.vertices;
				
				// find and remove all intermediary collinear vertices
				
				sva = contourVertices[ contourVertices.length - 1 ];
				
				for ( j = contourVertices.length - 2; j > 0; j-- ) {
					
					va = contourVertices[ j ];
					vb = contourVertices[ j - 1 ];
					
					if ( _um.pointsCW( sva, va, vb ) === 0 ) {
						
						contourVertices.splice( j, 1 );
						
					}
					else {
						
						sva = va;
						
					}
					
					va = vb;
					
				}
				
				// do one extra collinear check with first vertex as target for removal
				
				if ( _um.pointsCW( contourVertices[ j + 1 ], contourVertices[ j ], contourVertices[ contourVertices.length - 1 ] ) === 0 ) {
					
					contourVertices.splice( 0, 1 );
					
				}
				
				// make vertices relative
				
				var minX = contour.minX;
				var minY = contour.minY;
				var width = contour.width;
				var height = contour.height;
				
				for ( j = 0, jl = contourVertices.length; j < jl; j++ ) {
					
					va = contourVertices[ j ];
					va.x -= minX + width * 0.5;
					va.y -= minY + height * 0.5;
					
				}
				
				// create shape
				
				shapes.push( {
					x: minX,
					y: minY,
					settings: {
						size: {
							x: width,
							y: height
						},
						vertices: contourVertices
					}
				} );
				
			}
			
		}
		
    }
    
    return shapes;
    
};

/**
* Generates boolean for empty or, if solid, vertices and segments in clockwise order from a tile.
* @param {Object} Collision Map.
* @param {Number} x position.
* @param {Number} y Position.
* @returns {Object} Object with array of 0 to 5 vertices and array of 0 to 5 segments.
**/
_up.shapeFromTile = function ( map, ix, iy ) {
	
    var i, il;
	var tile = map.data[ iy ][ ix ];
	var vertices = _up.verticesFromTile( map, ix, iy );
	var segments;
	
	if ( vertices ) {
		
		// get or compute segments from tile
		
		if ( _up.defaultTileSegmentsDef[ tile ] ) {
			
			segments = _up.defaultTileSegmentsDef[ tile ];
			
		}
		else {
			
			_up.defaultTileSegmentsDef[ tile ] = segments = [];
			
			for ( i = 0, il = vertices.length; i < il; i++ ) {
				
				var va = vertices[ i ];
				var indexB = i === il - 1 ? 0 : i + 1;
				var vb = vertices[ indexB ];
				
				// store segment with pre-computed normal for later use
				// normal should be facing out and normalized between 0 and 1
				
				var dx = vb.x - va.x;
				var dy = vb.y - va.y;
				var l = Math.sqrt( dx * dx + dy * dy );
				var nx = dy / l;
				var ny = -dx / l;
				
				segments.push( { a: i, b: indexB, normal: { x: nx, y: ny } } );
				
			}
			
		}
		
	}
	
	return {
		vertices: vertices,
		segments: segments || []
	};
	
};

/**
* Generates boolean for empty or, if solid, vertices in clockwise order from a tile.
* This function makes some assumptions about tiles, such as being either 3, 4, or 5 sided, always having a corner, and being convex.
* @param {Object} Collision Map.
* @param {Number} x position.
* @param {Number} y Position.
* @returns {Array} Array of 0 to 5 vertices.
**/
_up.verticesFromTile = function ( map, ix, iy ) {
	
    var i, il;
	var tile = map.data[ iy ][ ix ];
	var vertices;
	
	// get or compute shape from tile
	
	if ( _up.defaultTileVerticesDef[ tile ] ) {
		
		vertices = _up.defaultTileVerticesDef[ tile ];
		
	}
	else {
		
		// solid square
		
		if ( tile === 1 ) {
			
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
			
			var def = map.tiledef[ tile ];
			
			if ( def ) {
				
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
				
				if ( Math.abs( fx ) < 1 && Math.abs( fy ) < 1 ) {
					
					var quadrantA = _um.pointQuadrant( ax, ay, 0.5, 0.5 );
					var quadrantB = _um.pointQuadrant( bx, by, 0.5, 0.5 );
					var quadrantC = _um.pointQuadrant( cx, cy, 0.5, 0.5 );
					
					if ( !( quadrantA & quadrantC ) && !( quadrantB & quadrantC ) ) {
						
						fiveSided = true;
						
					}
					
				}
				
				if ( fiveSided === true ) {
					
					// generate vertices in both directions from corner
					
					if ( cx !== cy ) {
						
						dax = cx;
						dby = cy;
						
						if ( cx == 1 ) {
							
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
						
						if ( cx == 1 ) {
							
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
					
					if ( cx !== cy ) {
						
						dax = cx;
						dby = cy;
						
						if ( cx == 1 ) {
							
							day = Math.max( ay, by );
							dbx = Math.min( ax, bx );
							
						}
						else {
							
							day = Math.min( ay, by );
							dbx = Math.max( ax, bx );
							
						}
						
					}
					else {
						
						day = cy;
						dbx = cx;
						
						if ( cx == 1 ) {
							
							dax = Math.min( ax, bx );
							dby = Math.min( ay, by );
							
						}
						else {
							
							dax = Math.max( ax, bx );
							dby = Math.max( ay, by );
							
						}
						
					}
					
					// da is duplicate of a
					
					if ( ( dax === ax && day === ay ) || ( dax === bx && day === by ) ) {
						
						// db is not duplicate of b
						
						if ( !( ( dbx === ax && dby === ay ) || ( dbx === bx && dby === by ) ) ) {
							
							vd = vertices[ 3 ] = { x: dbx, y: dby };
							
						}
						
					}
					else {
						
						vd = vertices[ 3 ] = { x: dax, y: day };
						
					}
					
				}
				
				vertices = _um.pointsToConvexHull( vertices );
				
			}
			
			// store so we don't compute again
			
			_up.defaultTileVerticesDef[ tile ] = vertices;
			
		}
		
	}
	
	return vertices;
	
};

/**
* Checks and returns all of a tile's non-duplicate segment vertices.
* @param {Object} Tile.
* @param {Array} Tiles data (2D array).
* @returns {Array} List of vertices, copied and scaled to tile.
**/
_up.getNonDuplicateSegmentVertices = function ( tile, tileData ) {
	
	var ix = tile.ix;
	var iy = tile.iy;
	var shape = tile.shape;
	var vertices = shape.vertices;
	var segments = shape.segments;
	var nonDuplicates = [];
	
	// add segment vertices in clockwise order while checking for duplicates
	
	var i, il;
	var j, jl;
	
	for ( i = 0, il = segments.length; i < il; i++ ) {
		
		var segment = segments[ i ];
		var va = vertices[ segment.a ];
		var vb = vertices[ segment.b ];
		var normal = segment.normal;
		var overlap = false;
		
		// if normal is axis aligned to x/y
		// compare segment to touching tiles from normal direction
		
		if ( ( normal.x === 0 && normal.y !== 0 ) || ( normal.x !== 0 && normal.y === 0 ) ) {
			
			var touchingTiles = _up.getTouchingTilesByNormal( tile, normal, tileData );
			
			// check each touching for overlap
			
			for ( j = 0, jl = touchingTiles.length; j < jl; j++ ) {
				
				var touchingTile = touchingTiles[ j ];
				
				if ( touchingTile.shape.vertices.length > 0 ) {
					
					overlap = _up.getSegmentOverlapWithTile( va, vb, normal, touchingTile );
					
					if ( overlap ) break;
					
				}
				
			}
		
		}
		
		// no overlap at all
		
		if ( overlap === false ) {
			
			nonDuplicates.push( va, vb );
			
		}
		// partial overlap found, use returned non-overlapping segment
		else if ( overlap.segmentA ) {
			
			nonDuplicates.push( overlap.segmentA.va, overlap.segmentA.vb );
			
		}
		
	}
	
	return nonDuplicates;
	
};

/**
 * @returns {Array} all tiles directly touching a tile based on normal direction.
 **/
_up.getTouchingTilesByNormal = function ( tile, normal, tileData ) {
	
	var ix = tile.ix;
	var iy = tile.iy;
	var nx = normal.x;
	var ny = normal.y;
	var touchingTiles = [];
	var row;
	
	if ( nx !== 0 ) {
		
		row = tileData[ iy ];
		
		if ( nx > 0 ) {
			
			if ( ix < row.length - 1 ) {
				
				touchingTiles.push( row[ ix + 1 ] );
				
			}
			
		}
		else {
			
			if ( ix > 0 ) {
				
				touchingTiles.push( row[ ix - 1 ] );
				
			}
			
		}
		
	}
	
	if ( ny !== 0 ) {
		
		if ( ny > 0 ) {
			
			if ( iy < tileData.length - 1 ) {
				
				touchingTiles.push( tileData[ iy + 1 ][ ix ] );
				
			}
			
		}
		else {
			
			if ( iy > 0 ) {
				
				touchingTiles.push( tileData[ iy - 1 ][ ix ] );
				
			}
			
		}
		
	}
	
	return touchingTiles;
	
};

/**
 * Gets if a segment overlaps a tile edge.
 * @returns {Boolean|Object} no overlap = false, full overlap = true, partial overlap = not overlapped area
 **/
_up.getSegmentOverlapWithTile = function ( vaA, vbA, normalCompare, tile ) {
	
	var overlap = false;
	var shape = tile.shape;
	var vertices = shape.vertices;
	var segments = shape.segments;
	var i, il;
	var segmentPotential, normal, segment;
	
	// find overlapping segment, assuming no more than 1 overlap can occur in a tile
	
	for ( i = 0, il = segments.length; i < il; i++ ) {
		
		segmentPotential = segments[ i ];
		normal = segmentPotential.normal;
		
		// for any overlap to occur, normals must be pointing in opposite directions
		
		if ( normalCompare.x === -normal.x && normalCompare.y === -normal.y ) {
			
			segment = segmentPotential;
			break;
			
		}
		
	}
	
	if ( segment ) {
		
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
		var lenA = Math.sqrt( xlA * xlA + ylA * ylA );
		var xnA = xlA / lenA;
		var ynA = ylA / lenA;
		var xlB = xaB - xbB;
		var ylB = yaB - ybB;
		var lenB = Math.sqrt( xlB * xlB + ylB * ylB );
		var xnB = xlB / lenB;
		var ynB = ylB / lenB;
		var cross = xnA * ynB - ynA * xnB;
		
		// if cross product = 0, lines are parallel
		// no need to check for collinearity
		
		if ( cross === 0 ) {
			
			var saebMin, saebMax, easbMin, easbMax, normal;
			var minCompare, maxCompare, property;
			
			// horizontal lines
			
			if ( xnA !== 0 ) {
				
				saebMin = Math.min( xaA, xbB );
				saebMax = Math.max( xaA, xbB );
				easbMin = Math.min( xbA, xaB );
				easbMax = Math.max( xbA, xaB );
				normal = xnA;
				minCompare = xaA;
				maxCompare = xbA;
				property = 'x';
				
			}
			// vertical lines
			else {
				
				saebMin = Math.min( yaA, ybB );
				saebMax = Math.max( yaA, ybB );
				easbMin = Math.min( ybA, yaB );
				easbMax = Math.max( ybA, yaB );
				normal = ynA;
				minCompare = yaA;
				maxCompare = ybA;
				property = 'y';
				
			}
			
			// fully overlapping
			
			if ( saebMin === saebMax && easbMin === easbMax ) {
				
				overlap = true;
				
			}
			// partial or no overlap
			else {
				
				var overlappingBy = normal < 0 ? saebMin - easbMax : easbMin - saebMax;
				
				// find edges outside partial overlap
				
				if ( overlappingBy > 0 ) {
					
					// duplicate will be new edges instead of boolean
					
					overlap = {
						segmentA: { va: { x: vaA.x, y: vaA.y }, vb: { x: vbA.x, y: vbA.y } },
						segmentB: { va: { x: vaB.x, y: vaB.y }, vb: { x: vbB.x, y: vbB.y } }
					};
					
					var min, max;
					var wipeout = true;
					
					if ( normal < 0 ) {
						
						min = saebMin === saebMax ? 0 : ( saebMin === minCompare ? SEGMENT_B : SEGMENT_A );
						max = easbMin === easbMax ? 0 : ( easbMax === maxCompare ? SEGMENT_B : SEGMENT_A );
						
						if ( min === SEGMENT_A ) {
							overlap.segmentA.vb[ property ] += overlappingBy;
							wipeout = false;
						}
						else if ( min === SEGMENT_B ) {
							overlap.segmentB.va[ property ] += overlappingBy;
						}
						if ( max === SEGMENT_A ) {
							overlap.segmentA.va[ property ] -= overlappingBy;
							wipeout = false;
						}
						else if ( max === SEGMENT_B ) {
							overlap.segmentB.vb[ property ] -= overlappingBy;
						}
						
						// other edge may be bigger and fully overlapping this one
						
						if ( wipeout === true ) {
							overlap = true;
						}
						
					}
					else {
						
						min = saebMin === saebMax ? 0 : ( saebMin === minCompare ? SEGMENT_A : SEGMENT_B );
						max = easbMin === easbMax ? 0 : ( easbMax === maxCompare ? SEGMENT_A : SEGMENT_B );
						
						if ( min === SEGMENT_A ) {
							overlap.segmentA.vb[ property ] -= overlappingBy;
							wipeout = false;
						}
						else if ( min === SEGMENT_B ) {
							overlap.segmentB.va[ property ] -= overlappingBy;
						}
						if ( max === SEGMENT_A ) {
							overlap.segmentA.va[ property ] += overlappingBy;
							wipeout = false;
						}
						else if ( max === SEGMENT_B ) {
							overlap.segmentB.vb[ property ] += overlappingBy;
						}
						
						// other edge may be bigger and fully overlapping this one
						
						if ( wipeout === true ) {
							overlap = true;
						}
						
					}
					
				}
				
			}
			
		}
		
	}
	
	return overlap;
	
};

} );