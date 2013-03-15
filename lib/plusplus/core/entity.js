/**
 * Entity with extended capabilities.
 * @extends ig.Entity
 * @author Collin Hover - collinhover.com
 **/
ig.module( 
	'plusplus.core.entity'
)
.requires(
	'impact.entity',
	'plusplus.helpers.shared',
	'plusplus.helpers.utils',
	'plusplus.helpers.utilsmath',
	'plusplus.helpers.utilsscreen',
	'plusplus.helpers.utilsdraw',
	'plusplus.abilities.ability',
	'plusplus.physics.box2d'
)
.defines(function(){ "use strict";

var _s = ig.shared;
var _u = ig.utils;
var _um = ig.utilsmath;
var _us = ig.utilsscreen;
var _ud = ig.utilsdraw;
var _b2 = ig.Box2D;

ig.EntityExtended = ig.Entity.extend({
	
	// layer to exist on
	
	layerName: 'entities',
	
	angle: 0,
	
	// do not modify, handled by update
	
	visible: true,
	
	// do not modify, use MoveTo methods
	
	movingTo: false,
	movedTo: true,
	
	// how much light gets through entity
	
	diffuse: 1,
	
	// does entity cast shadow
	
	opaque: false,
	
	// does entity only cast shadows from edges
	
	hollow: false,
	
	// do not modify, used to record changes
	
	posLast: { x: 0, y: 0 },
	posDelta: { x: 0, y: 0 },
	angleLast: 0,
	angleDelta: 0,
	
	/**
	 * See ig.Entity
	 **/
	init: function () {
		
		this.utilVec2Cast1 = new _b2.Vec2();
		this.utilVec2Cast2 = new _b2.Vec2();
		this.utilVec2Cast3 = new _b2.Vec2();
		this.utilVec2Cast4 = new _b2.Vec2();
		
		this.utilVec2Project1 = new _b2.Vec2();
		this.utilVec2Project2 = new _b2.Vec2();
		this.utilVec2Project3 = new _b2.Vec2();
		this.utilVec2Project4 = new _b2.Vec2();
		
		this.parent.apply( this, arguments );
		
		// generate vertices from size
		
		if ( !this.vertices || this.vertices.length === 0 ) {
			
			var sizeX = this.getSizeX();
			var sizeY= this.getSizeY();
			
			this.vertices = [
				{ x: -sizeX * 0.5, y: -sizeY * 0.5 },
				{ x: sizeX * 0.5, y: -sizeY * 0.5 },
				{ x: sizeX * 0.5, y: sizeY * 0.5 },
				{ x: -sizeX * 0.5, y: sizeY * 0.5 }
			];
			
		}
		
		// abilities
		
		this.abilities = this.abilitiesOriginal = new ig.Ability( 'abilities', this );
		
		// record initial changes
		
		this.recordChanges( true );
		
	},
	
	/**
	 * @returns {Layer} layer this entity is on.
	 **/
	getLayer: function () {
		
		return ig.game.layers[ this.layerName ];
		
	},
	
	/**
	 * @returns {Object} entity's bounds.
	 **/
	getBounds: function () {
		
		var sizeX = this.getSizeX();
		var sizeY = this.getSizeY();
		
		if ( this.angle !== 0 ) {
			
			return _um.boundsOfPoints( this.verticesWorld );
			
		}
		else {
			
			return {
				minX: this.pos.x,
				minY: this.pos.y,
				maxX: this.pos.x + sizeX,
				maxY: this.pos.y + sizeY,
				width: sizeX,
				height: sizeY
			};
			
		}
		
	},
	
	/**
	 * @returns {Object} entity's bounds for drawing.
	 **/
	getBoundsDraw: function () {
		
		if ( this.angle !== 0 ) {
			
			return _um.boundsOfPoints( _um.projectPoints( this.vertices, this.pos.x - this.offset.x, this.pos.y - this.offset.y, 1, this.angle ) );
			
		}
		else {
			
			var sizeX = this.getSizeX();
			var sizeY = this.getSizeY();
			var minX = this.pos.x - this.offset.x;
			var minY = this.pos.y - this.offset.y;
			
			return {
				minX: minX,
				minY: minY,
				maxX: minX + sizeX,
				maxY: minY + sizeY,
				width: sizeX,
				height: sizeY
			};
			
		}
		
	},
	
	/**
	 * @returns {Array} vertices projected into world coordinates.
	 **/
	getVerticesWorld: function () {
		
		return _um.projectPoints( this.vertices, this.getCenterX(), this.getCenterY(), 1, this.angle );
		
	},
	
	/**
	 * @returns {Number} horizontal size.
	 **/
	getSizeX: function () {
		
		return this.size.x;
		
	},
	
	/**
	 * @returns {Number} vertical size.
	 **/
	getSizeY: function () {
		
		return this.size.y;
		
	},
	
	/**
	 * @returns {Number} horizontal center.
	 **/
	getCenterX: function () {
		
		return this.pos.x + this.getSizeX() * 0.5;
		
	},
	
	/**
	 * @returns {Number} vertical center.
	 **/
	getCenterY: function () {
		
		return this.pos.y + this.getSizeY() * 0.5;
		
	},
	
	/**
	 * @returns {Boolean} if is in screen.
	 **/
	getIsVisible: function () {
		
		return _us.getIsAABBInScreen( this.boundsDraw.minX, this.boundsDraw.minY, this.boundsDraw.width, this.boundsDraw.height );
		
	},
	
	/**
    * Fill context with the shadows projected by this polygon object from the origin point, constrained by the given bounds.
    * @param {CanvasRenderingContext2D} The canvas context onto which the shadows will be cast.
    * @param {Vec2} A vector that represents the origin for the casted shadows.
    * @param {Object} bounds of the casting area.
    **/
    cast: function ( light, context, origin, contextBounds ) {
		
		// cast no shadows if light is within these bounds and this is not hollow
		
		if ( !this.hollow && this.pointInside( origin ) ) {
			
			return;
			
		}
		
		var alpha = this.diffuse >= 1 || light.diffuse >= 1 ? 1 : this.diffuse * light.diffuse;
		var radius = ( contextBounds.width + contextBounds.height ) * 0.5;
		var verticesWorld = this.verticesWorld;
		var withinLight = false;
		var contourPool = [], contours = []
		var contour, contourVertices;
		var contourOther, contourOtherVertices;
		var oa, ob, oc, od, combined;
		var a = verticesWorld[ verticesWorld.length - 1 ], b, c, d;
		var i, il, j, jl, k, kl;
		
		// check each segment;
		
		for ( i = 0, il = verticesWorld.length; i < il; i++ ) {
			
			b = verticesWorld[ i ];
			
			// check if line is within contextBounds
			
			if ( _um.AABBIntersectsAABB(
					Math.min( a.x, b.x ), Math.min( a.y, b.y ), Math.max( a.x, b.x ), Math.max( a.y, b.y ),
					contextBounds.minX, contextBounds.minY, contextBounds.maxX, contextBounds.maxY
				) ) {
				
				withinLight = true;
				
				// check if line is facing away from origin
				// dot gives us angle domain between normal of A to B and vector pointing from origin to A 
				// dot > 0 = angle < 90, so line would be facing away
				
				var aToB = this.utilVec2Cast1.SetV( b ).Subtract( a );
				var normal = this.utilVec2Cast2.Set( aToB.y, -aToB.x );
				var originToA = this.utilVec2Cast3.SetV( a ).Subtract( origin );
				
				if ( _b2.Math.Dot( normal, originToA ) > 0 ) {
					
					var originToB = this.utilVec2Cast4.SetV( b ).Subtract( origin );
					
					// project a and b to edge of light and get shape
					
					contourPool.push( {
						vertices: this.project( light, context, origin, radius, a, b, originToA, originToB, aToB ),
						verticesActual: [ a, b ],
						verticesHollow: []
					} );
					
				}
				
			}
			
			a = b;
			
		}
		
		// process contours and combine any touching
		
		for ( i = 0, il = contourPool.length; i < il; i++ ) {
			
			contour = contourPool[ i ];
			contourVertices = contour.vertices;
			combined = false;
			
			a = contourVertices[ 0 ];
			b = contourVertices[ 1 ];
			c = contourVertices[ contourVertices.length - 2 ];
			d = contourVertices[ contourVertices.length - 1 ];
			
			// check every following contour for duplicate start or end
			
			for ( j = i + 1; j < il; j++ ) {
				
				contourOther = contourPool[ j ];
				contourOtherVertices = contourOther.vertices;
				oa = contourOtherVertices[ 0 ];
				ob = contourOtherVertices[ 1 ];
				oc = contourOtherVertices[ contourOtherVertices.length - 2 ];
				od = contourOtherVertices[ contourOtherVertices.length - 1 ];
				
				// discard b, and od, and join contours [ contourOther, contour ] with a at end
				if ( a.x === od.x && a.y === od.y && b.x === oc.x && b.y === oc.y ) {
					
					combined = true;
					
					contourPool[ j ] = {
						vertices: contourOtherVertices.slice( 0, -1 ).concat( contourVertices.slice( 2 ) ),
						verticesActual: contourOther.verticesActual.slice( 0, -1 ).concat( contour.verticesActual ),
						verticesHollow: contour.verticesHollow.concat( a, contourOther.verticesHollow )
					};
					
					break;
					
				}
				// discard d, oa, and ob and join contours [ contour, contourOther ]
				else if ( c.x === ob.x && c.y === ob.y && d.x === oa.x && d.y === oa.y ) {
					
					combined = true;
					
					contourPool[ j ] = {
						vertices: contourVertices.slice( 0, -1 ).concat( contourOtherVertices.slice( 2 ) ),
						verticesActual: contour.verticesActual.slice( 0, -1 ).concat( contourOther.verticesActual ),
						verticesHollow: contourOther.verticesHollow.concat( d, contour.verticesHollow )
					};
					
					break;
					
				}
				
			}
			
			if ( combined !== true ) {
				
				// compute contour bounds
				
				contour.bounds = _um.boundsOfPoints( contour.vertices );
				
				contours.push( contour );
				
			}
			
		}
		
		// fill in this shape if
		// check all contours and for any with a matching vertex, combine into one contour
		
		if ( this.hollow !== true && withinLight === true ) {
			
			var vertices = verticesWorld.slice( 0 );
			var bounds = this.bounds;
			
			var connections = {};
			var connection = [];
			var connected = false;
			
			// walk self vertices
			// check for any vertices in self that match contour's actual vertices
			// create connections between contours from vertices that do not match
			
			for ( i = 0, il = vertices.length; i < il; i++ ) {
				
				var vertex = vertices[ i ];
				var matched = false;
				
				for ( j = 0, jl = contours.length; j < jl; j++ ) {
					
					contour = contours[ j ];
					var contourVerticesActual = contour.verticesActual;
					
					for ( k = 0, kl = contourVerticesActual.length; k < kl; k++ ) {
						
						var vertexActual = contourVerticesActual[ k ];
						
						if ( vertex.x === vertexActual.x && vertex.y === vertexActual.y ) {
							
							matched = true;
							
							if ( connection ) {
								
								connections[ j === 0 ? jl - 1 : j - 1 ] = connection;
								connection = undefined;
								connected = true;
								
							}
							
							break;
							
						}
						
					}
					
					if ( matched === true ) {
						
						break;
						
					}
					
				}
				
				// not matched, put into last connection
				
				if ( matched === false ) {
					
					if ( !connection ) {
						
						connection = [];
						
					}
					
					connection.push( vertex );
					
				}
				
				
			}
			
			// handle last connection
			
			if ( connection ) {
				
				connections[ jl - 1 ] = connection !== connections[ jl - 1 ] ? connection.concat( connections[ jl - 1 ] || [] ) : connection;
				
			}
			
			// if at least one connection
			// combine all contours and connections
			
			if ( connected ) {
				
				var contourConnected = {
					vertices: []
				};
				
				for ( i = 0, il = contours.length; i < il; i++ ) {
					
					contour = contours[ i ];
					
					// add contour and connection
					
					contourConnected.vertices = contourConnected.vertices.concat( contour.vertices, connections[ i ] || [] );
					
				}
				
				contourConnected.bounds = _um.boundsOfPoints( contourConnected.vertices );
				
				contours = [ contourConnected ];
				
			}
			// no connections so just add self
			else {
				
				contours.push( {
					vertices: vertices,
					bounds: bounds
				} );
				
			}
			
		}
		// add all hollow vertices to end of contours
		else {
			
			for ( i = 0, il = contours.length; i < il; i++ ) {
				
				contour = contours[ i ];
				
				contour.vertices = contour.vertices.concat( contour.verticesHollow );
				
			}
			
		}
		
		// draw each contour
		
		for ( i = 0, il = contours.length; i < il; i++ ) {
			
			contour = contours[ i ];
			
			if ( light.pixelPerfect ) {
				
				_ud.pixelFillPolygon( context, contextBounds, contour.vertices, 1, 1, 1, alpha, true, contour.bounds );
				
			}
			else {
				
				_ud.fillPolygon( context, contour.vertices, -contextBounds.minX, -contextBounds.minY, 1, 1, 1, alpha, ig.system.scale );
				
			}
			
		}
		
    },
	
	/**
	* Projects an edge ( pair of points ) based on light.
	* @returns {Array} vertices of the shape cast by light from edge.
	**/
	project: function ( light, context, origin, radius, a, b, originToA, originToB, aToB ) {
		
		var m = this.utilVec2Project1; // m is the projected point of origin to [a, b]
		var t = _b2.Math.Dot( aToB, this.utilVec2Project2.SetV( originToA ).NegativeSelf() ) / aToB.LengthSquared();
		
		if ( t < 0 ) {
			
			m.SetV( a );
			
		}
		else if ( t > 1 ) {
			
			m.SetV( b );
			
		}
		else {
			
			m.SetV( a ).Add( this.utilVec2Project3.SetV( aToB ).Multiply( t ) );
			
		}
		
		var originToM = this.utilVec2Project4.SetV( m ).Subtract( origin );
		
		// normalize to radius
		
		originToM.Normalize();
		originToA.Normalize();
		originToB.Normalize();
		
		originToM.Multiply( radius );
		originToA.Multiply( radius );
		originToB.Multiply( radius );
		
		// project points
		
		var ap = new _b2.Vec2( a.x, a.y ).Add( originToA );
		var bp = new _b2.Vec2( b.x, b.y ).Add( originToB );
		
		// return in clockwise order, with intermediary points to ensure full cover
		// if t < 0, ap === oam, so ignore intermediary oam
		// if t > 1, bp === obm, so ignore intermediary obm
		
		if ( t < 0 ) {
			
			return [ a, ap,
				new _b2.Vec2( b.x, b.y ).Add( originToM ), // obm
				bp, b ];
			
		}
		else if ( t > 1 ) {
			
			return [ a, ap, 
				new _b2.Vec2( a.x, a.y ).Add( originToM ), // oam
				bp, b ];
			
		}
		else {
			
			return [ a, ap,
				new _b2.Vec2( a.x, a.y ).Add( originToM ), // oam
				new _b2.Vec2( b.x, b.y ).Add( originToM ), // obm
				bp, b ];
			
		}
		
	},
	
	/**
     * Determine if a point is inside this.
     * @param {Point} point to be checked.
     * @returns {Boolean} True if this contains the given point.
     **/
    pointInside: function ( point ) {
		
		return _um.pointInPolygon( point.x, point.y, this.verticesWorld );
		
    },
	
	/**
     * Start following an entity by matching its position exactly.
     * @param {Entity} entity to follow.
     * @param {Boolean} if true, follow at center of target entity.
     **/
	moveToEntity: function ( entity, center ) {
		
		if ( !this.movingTo || this.movingToEntity !== entity ) {
			
			this.movingTo = true;
			this.movedTo = false;
			this.movingToCenter = center;
			this.movingToEntity = entity;
			
		}
		
	},
	
	/**
	* Ends any moveTo in progress.
	**/
	moveToHere: function () {
		
		this.movingTo = this.movingToCenter = false;
		this.movedTo = true;
		this.movingToEntity = undefined;
		
	},
	
	/**
	* Updates any moveTo in progress.
	**/
	moveToUpdate: function () {
		
		if ( this.movingTo && this.movingToEntity && ( !this.movedTo || this.movingToEntity.changed ) ) {
			
			if ( this.movingToCenter ) {
				
				this.pos.x = this.movingToEntity.getCenterX();
				this.pos.y = this.movingToEntity.getCenterY();
				
			}
			else {
				
				this.pos.x = this.movingToEntity.pos.x;
				this.pos.y = this.movingToEntity.pos.y;
				
			}
			
			this.movedTo = true;
			
		}
		
	},
    
	/**
	 * Starts mimicking the abilities of a target.
	 * @param {Entity} entity to mimic.
	 **/
	mimic: function ( target ) {
		
		var me = this;
		
		if ( target instanceof ig.EntityExtended ) {
			
			this.unmimic();
			
			this.abilities = target.abilities.clone();
			this.abilities.fallback = this.abilitiesOriginal;
			
			this.abilities.forAll( function () {
				this.setEntity( me );
				this.setEntityOptions( target );
			} );
            
        }
		
	},
    
	/**
	 * Stops mimicry.
	 **/
    unmimic: function () {
        
		if ( this.abilities !== this.abilitiesOriginal ) {
			
			// clean up clone
			
			this.abilities.executeCleanup();
			
			// revert to original
			
			this.abilities = this.abilitiesOriginal;
			
		}
        
    },
	
	/**
	* Does cleanup on entity right before removed from game.
	**/
	cleanup: function () {
		
		this.unmimic();
		
		this.abilities.executeCleanup();
		
	},
	
	/**
	 * Records last transform.
	 **/
	recordLast: function () {
		
		this.posLast.x = this.pos.x;
		this.posLast.y = this.pos.y;
		this.angleLast = this.angle;
		
	},
	
	/**
	 * Records changes in transform.
     * @param {Boolean} if true, forces changed flag.
	 **/
	recordChanges: function ( force ) {
		
		var changed;
		
		this.posDelta.x = this.pos.x - this.posLast.x;
		this.posDelta.y = this.pos.y - this.posLast.y;
		this.angleDelta = this.angle - this.angleLast;
		
		if ( force
			|| !_um.almostEqual( this.posDelta.x, 0, _s.zeroPrecision )
			|| !_um.almostEqual( this.posDelta.y, 0, _s.zeroPrecision )
			|| !_um.almostEqual( this.angleDelta, 0, _s.zeroPrecision ) ) {
			
			this.changed = true;
			
			// do updates on change
			
			this.verticesWorld = this.getVerticesWorld();
			this.bounds = this.getBounds();
			this.boundsDraw = this.getBoundsDraw();
			
		}
		else {
			
			this.changed = false;
			
		}
		
		this.visible = this.getIsVisible();
		
	},
	
	/**
	 * Overrides ig.Entity's update as it is no longer needed. For movement/physics, see ig.EntityPhysics.
	 **/
	update: function () {
		
		this.recordLast();
		
		this.moveToUpdate();
		
		this.recordChanges();
		
	},
	
	/**
	 * See ig.Entity
	 **/
	draw: function () {
		
		if( this.currentAnim ) {
			// original entity draw uses ig.game._rscreen, which seems to cause drawing to jitter
			// ig.game.screen is much more accurate
			
			this.currentAnim.draw(
				this.pos.x - this.offset.x - ig.game.screen.x,
				this.pos.y - this.offset.y - ig.game.screen.y
			);
		}
		
	}
	
});
    
});