/**
 * Non-physics Entity with extended capabilities.
 * @extends ig.Entity
 * @author Collin Hover - collinhover.com
 **/
ig.module( 
	'game.core.entity'
)
.requires(
	'impact.entity',
	'impact.collision-map',
	'game.core.shared',
	'game.helpers.utils',
	'game.helpers.utilsmath',
	'game.helpers.utilsvector2',
	'game.helpers.utilsintersection',
	'game.helpers.utilsscreen',
	'game.helpers.utilsdraw',
	'game.abilities.ability'
)
.defines(function(){ "use strict";

var _s = ig.shared;
var _ut = ig.utils;
var _utm = ig.utilsmath;
var _utv2 = ig.utilsvector2;
var _uti = ig.utilsintersection;
var _uts = ig.utilsscreen;
var _utd = ig.utilsdraw;

ig.EntityExtended = ig.Entity.extend({
	
	// layer to exist on
	
	layerName: 'entities',
	
	angle: 0,
	
	// how to treat entity for updates
	// static will only update animation
	// dynamic will check for changes without physics
	// kinematic will do complete update with physics
	
	performance: _s.STATIC,
	
	// does not update
	
	frozen: false,
	
	// how much light gets through entity
	
	diffuse: 1,
	
	// does entity cast shadow
	
	opaque: false,
	
	// does entity only cast shadows from edges
	
	hollow: false,
	
	// do not modify
	
	angleLast: 0,
	
	visible: true,
	
	changed: false,
	changedLast: false,
	
	moving: false,
	movingX: false,
	movingY: false,
	movingTo: false,
	movedTo: true,
	
	resetState: {},
	
	/**
	 * See ig.Entity
	 **/
	init: function () {
		
		this.id = ++ig.Entity._lastId;
		
		this.utilVec2Cast1 = _utv2.vector();
		this.utilVec2Cast2 = _utv2.vector();
		this.utilVec2Cast3 = _utv2.vector();
		this.utilVec2Cast4 = _utv2.vector();
		
		this.utilVec2Project1 = _utv2.vector();
		this.utilVec2Project2 = _utv2.vector();
		this.utilVec2Project3 = _utv2.vector();
		this.utilVec2Project4 = _utv2.vector();
		
		// reset
		
		this.reset.apply( this, arguments );
		
		// abilities
		
		this.abilities = this.abilitiesOriginal = new ig.Ability( 'abilities', this );
		
	},
	
	/**
	 * Resets an entity to last state.
	 **/
	reset: function ( x, y, settings ) {
		
		// settings
		
		if( settings.type ) {
			
			this.type = ig.Entity.addType( settings.type.toUpperCase() );
			delete settings.type;
			
		}
		
		if( settings.checkAgainst ) {
			
			this.checkAgainst = ig.Entity.addType( settings.checkAgainst.toUpperCase() );
			delete settings.checkAgainst;
			
		}
		
		ig.merge( this, this.resetState );
		ig.merge( this, settings );
		
		// set position if passed
		
		if ( _ut.isNumber( x ) ) {
			
			this.pos.x = x;
			
		}
		if ( _ut.isNumber( y ) ) {
			
			this.pos.y = y;
			
		}
		
		// generate vertices from size
		
		if ( !this.vertices || this.vertices.length === 0 ) {
			
			var sizeX = this.size.x;
			var sizeY = this.size.y;
			
			this.vertices = [
				_utv2.vector( -sizeX * 0.5, -sizeY * 0.5 ),
				_utv2.vector( sizeX * 0.5, -sizeY * 0.5 ),
				_utv2.vector( sizeX * 0.5, sizeY * 0.5 ),
				_utv2.vector( -sizeX * 0.5, sizeY * 0.5 )
			];
			
		}
		
		// types and checks
		
		this.updateTypes();
		
		// do one update to ensure static elements have all required properties
		
		this.recordLast();
		this.updateBounds();
		
	},
	
	/**
	 * Records the state of an entity for later reset. Does not record all properties.
	 **/
	updateResetState: function () {
		
		this.resetState.pos = _utv2.vector();
		_utv2.copy( this.resetState.pos, this.pos );
		
		this.resetState.health = this.health;
		
		this.resetState.type = this.type;
		this.resetState.checkAgainst = this.checkAgainst;
		this.resetState.collides = this.collides;
		
		this.resetState._killed = this._killed;
		
	},
	
	/*
	 * Adds this entity's types and checks upon init.
	 */
	updateTypes: function () {},
	
	/**
	 * See ig.Entity.
	 **/
	ready: function () {
		
		// initialize performance
		
		this.changePerformance();
		
		// update reset state
		
		this.updateResetState();
		
	},
	
	/**
	 * Sets this entity's performance level.
	 **/
	setPerformance: function ( level ) {
		
		this.performance = level;
		
		this.changePerformance();
		
	},
	
	/**
	 * Makes changes based on this entity's performance level.
	 * @returns {Boolean} whether changed or not.
	 **/
	changePerformance: function () {
		
		if ( this.performance !== this.performanceLast ) {
			
			this.performanceLast = this.performance;
			
			// dynamic
			if ( this.performance === _s.DYNAMIC ) {
				
				this.changePerformanceDynamic();
				
			}
			// kinematic
			else if ( this.performance === _s.KINEMATIC ) {
				
				this.changePerformanceKinematic();
				
			}
			// default to static
			else {
				
				this.changePerformanceStatic();
				
			}
			
			return true;
			
		}
		
		return false;
		
	},
	
	/**
	* Called when performance changed to static.
	**/
	changePerformanceStatic: function () {},
	
	/**
	* Called when performance changed to dynamic.
	**/
	changePerformanceDynamic: function () {},
	
	/**
	* Called when performance changed to kinematic.
	**/
	changePerformanceKinematic: function () {},
	
	/**
	 * @returns {Layer} layer this entity is on.
	 **/
	getLayer: function () {
		
		return ig.game.layers[ this.layerName ];
		
	},
	
	/**
	 * @returns {Object} entity's bounds.
	 * Instead of calling this, use entity.bounds, which is calculated whenever entity changes.
	 **/
	getBounds: function () {
		
		if ( this.angle !== 0 ) {
			
			return _uti.boundsOfPoints(
				_utv2.projectPoints( 
					this.vertices, 
					this.getCenterX(), this.getCenterY(),
					1, 1,
					this.angle
				)
			);
			
		}
		else {
			
			var sizeX = this.size.x;
			var sizeY = this.size.y;
			
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
	 * @returns {Object} entity's bounds for drawing, unscaled.
	 * Instead of calling this, use entity.boundsDraw, which is calculated whenever entity changes.
	 **/
	getBoundsDraw: function () {
		
		if ( this.angle !== 0 ) {
			
			return _uti.boundsOfPoints( this.verticesWorld );
			
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
	 * Instead of calling this, use entity.verticesWorld, which is calculated whenever entity changes.
	 **/
	getVerticesWorld: function () {
		
		return _utv2.projectPoints( 
				this.vertices, 
				this.getCenterX(), this.getCenterY(),
				this.getSizeX() / this.size.x, this.getSizeY() / this.size.y,
				this.angle
			);
		
	},
	
	/**
	 * @returns {Number} horizontal size, offset included.
	 **/
	getSizeX: function () {
		
		return this.size.x + this.offset.x * 2;
		
	},
	
	/**
	 * @returns {Number} vertical size, offset included.
	 **/
	getSizeY: function () {
		
		return this.size.y + this.offset.y * 2;
		
	},
	
	/**
	 * @returns {Number} horizontal center.
	 **/
	getCenterX: function () {
		
		return this.pos.x + this.getSizeX() * 0.5 - this.offset.x;
		
	},
	
	/**
	 * @returns {Number} vertical center.
	 **/
	getCenterY: function () {
		
		return this.pos.y + this.getSizeY() * 0.5 - this.offset.y;
		
	},
	
	/**
	 * @returns {Boolean} if is in screen.
	 **/
	getIsVisible: function () {
		
		return _uts.getIsAABBInScreen( this.boundsDraw.minX, this.boundsDraw.minY, this.boundsDraw.width, this.boundsDraw.height );
		
	},
	
	/**
	 * @returns {Boolean} if touches other
	 * This overrides original touches as in certain instances it would not work correctly.
	 **/
	/*touches: function( other ) {
		
		return _uti.AABBIntersectsAABBBounds( this.bounds, other.bounds );
		
	},*/
	
	/**
     * Determine if a point is inside this.
     * @param {Point} point to be checked.
     * @returns {Boolean} True if this contains the given point.
     **/
    pointInside: function ( point ) {
		
		return _uti.pointInPolygon( point.x, point.y, this.verticesWorld );
		
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
			
			if ( _uti.AABBIntersectsAABB(
					Math.min( a.x, b.x ), Math.min( a.y, b.y ), Math.max( a.x, b.x ), Math.max( a.y, b.y ),
					contextBounds.minX, contextBounds.minY, contextBounds.maxX, contextBounds.maxY
				) ) {
				
				withinLight = true;
				
				// check if line is facing away from origin
				// dot gives us angle domain between normal of A to B and vector pointing from origin to A 
				// dot > 0 = angle < 90, so line would be facing away
				
				var aToB = _utv2.copy( this.utilVec2Cast1, b );
				_utv2.subtract( aToB, a );
				var normal = _utv2.set( this.utilVec2Cast2, aToB.y, -aToB.x );
				var originToA = _utv2.copy( this.utilVec2Cast3, a );
				_utv2.subtract( originToA, origin );
				
				if ( _utv2.dot( normal, originToA ) > 0 ) {
					
					var originToB = _utv2.copy( this.utilVec2Cast4, b );
					_utv2.subtract( originToB, origin );
					
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
				if ( _utv2.equal( a, od ) && _utv2.equal( b, oc ) ) {
					
					combined = true;
					
					contourPool[ j ] = {
						vertices: contourOtherVertices.slice( 0, -1 ).concat( contourVertices.slice( 2 ) ),
						verticesActual: contourOther.verticesActual.slice( 0, -1 ).concat( contour.verticesActual ),
						verticesHollow: contour.verticesHollow.concat( a, contourOther.verticesHollow )
					};
					
					break;
					
				}
				// discard d, oa, and ob and join contours [ contour, contourOther ]
				else if ( _utv2.equal( c, ob ) && _utv2.equal( d, oa ) ) {
					
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
				
				contour.bounds = _uti.boundsOfPoints( contour.vertices );
				
				contours.push( contour );
				
			}
			
		}
		
		// fill in this shape
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
				
				contourConnected.bounds = _uti.boundsOfPoints( contourConnected.vertices );
				
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
				
				_utd.pixelFillPolygon( context, contextBounds, contour.vertices, 1, 1, 1, alpha, true, contour.bounds );
				
			}
			else {
				
				_utd.fillPolygon( context, contour.vertices, -contextBounds.minX, -contextBounds.minY, 1, 1, 1, alpha, ig.system.scale );
				
			}
			
		}
		
    },
	
	/**
	* Projects an edge ( pair of points ) based on light.
	* @returns {Array} vertices of the shape cast by light from edge.
	**/
	project: function ( light, context, origin, radius, a, b, originToA, originToB, aToB ) {
		
		var originToAB = this.utilVec2Project1; // projected point of origin to [a, b]
		var invOriginToA = _utv2.copy( this.utilVec2Project2, originToA );
		_utv2.inverse( invOriginToA );
		
		var t = _utv2.dot( aToB, invOriginToA ) / _utv2.lengthSquared( aToB );
		
		if ( t < 0 ) {
			
			_utv2.copy( originToAB, a );
			
		}
		else if ( t > 1 ) {
			
			_utv2.copy( originToAB, b );
			
		}
		else {
			
			_utv2.copy( originToAB, a );
			
			var n = _utv2.copy( this.utilVec2Project3, aToB );
			_utv2.multiplyScalar( n, t )
			_utv2.add( originToAB, n );
			
		}
		
		var originToM = _utv2.copy( this.utilVec2Project4, originToAB );
		_utv2.subtract( originToM, origin );
		
		// normalize to radius
		
		_utv2.normalize( originToM );
		_utv2.multiplyScalar( originToM, radius );
		
		_utv2.normalize( originToA );
		_utv2.multiplyScalar( originToA, radius );
		
		_utv2.normalize( originToB );
		_utv2.multiplyScalar( originToB, radius );
		
		// project points
		
		var ap = _utv2.clone( a );
		_utv2.add( ap, originToA );
		
		var bp = _utv2.clone( b );
		_utv2.add( bp, originToB );
		
		// return in clockwise order, with intermediary points to ensure full cover
		// if t < 0, ap === oam, so ignore intermediary oam
		// if t > 1, bp === obm, so ignore intermediary obm
		
		var oam, obm;
		
		if ( t < 0 ) {
			
			obm = _utv2.clone( b );
			_utv2.add( obm, originToM );
			
			return [ a, ap, obm, bp, b ];
			
		}
		else if ( t > 1 ) {
			
			oam = _utv2.clone( a );
			_utv2.add( oam, originToM );
			
			return [ a, ap, oam, bp, b ];
			
		}
		else {
			
			oam = _utv2.clone( a );
			_utv2.add( oam, originToM );
			
			obm = _utv2.clone( b );
			_utv2.add( obm, originToM );
			
			return [ a, ap, oam, obm, bp, b ];
			
		}
		
	},
	
	/**
	 * Do some activated behavior.
	 * @param {Entity} entity causing trigger.
	 * @param {Trigger} trigger calling activation.
	 **/
	activate: function ( target, trigger ) {},
	
	/**
     * Start following an entity by matching its position exactly.
     * @param {Entity} entity to follow.
     * @param {Boolean} if true, follow at center of target entity.
     **/
	moveToEntity: function ( entity, center ) {
		
		// in order to match an entity's position this entity must not be kinematic
		
		if ( this.movingToEntity !== entity && this.performance !== _s.KINEMATIC ) {
			
			this.moveToHere();
			
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
	* See ig.EntityExtended.
	**/
	receiveDamage: function( amount, from, unblockable ) {
		
		// TODO: check if invulnerable
		
		this.parent.apply( this, arguments );
		
	},
	
	/**
	* Does cleanup on entity right before removed from game.
	**/
	cleanup: function () {
		
		// abilities
		
		this.unmimic();
		
		this.abilities.executeCleanup();
		
		// return to spawner if exists
		
		if ( this.spawner ) {
			
			this.spawner.unspawn( this );
			
		}
		
	},
	
	/**
	 * Updates entity.
	 **/
	update: function () {
		
		if ( !this.frozen ) {
			
			if ( this.performance !== _s.STATIC ) {
				
				this.recordLast();
				
				this.updateChanges.apply( this, arguments );
				
				if ( this.performance === _s.KINEMATIC ) {
					
					// velocity
					
					this.vel.y += ig.game.gravity * ig.system.tick * this.gravityFactor;
					
					this.updateVelocity.apply( this, arguments );
					
					// movement & collision
					
					var mx = this.vel.x * ig.system.tick;
					var my = this.vel.y * ig.system.tick;
					var res = ig.game.collisionMap.trace( this.pos.x, this.pos.y, mx, my, this.size.x, this.size.y );
					this.handleMovementTrace( res );
					
				}
				
				this.recordChanges.apply( this, arguments );
				
			}
			else {
				
				this.visible = this.getIsVisible();
				
				if ( this.changedLast ) {
					
					this.changedLast = true;
					this.changed = false;
					
				}
				
			}
			
			this.updateCleanup.apply( this, arguments );
			
			this.changedLast = this.changed;
			
		}
		
	},
	
	/**
	 * Records last transform.
	 **/
	recordLast: function () {
		
		_utv2.copy( this.last, this.pos );
		this.angleLast = this.angle;
		
	},
	
	/**
	 * Records limited changes in transform.
     * @param {Boolean} if true, forces changed flag.
	 **/
	recordChanges: function ( force ) {
		
		if ( force
			|| !_utm.almostEqual( this.pos.x - this.last.x, 0, _s.PRECISION_ZERO )
			|| !_utm.almostEqual( this.pos.y - this.last.y, 0, _s.PRECISION_ZERO )
			|| !_utm.almostEqual( this.angle - this.angleLast, 0, _s.PRECISION_ZERO ) ) {
			
			this.changed = true;
			
			this.movingX = this.vel.x !== 0;
			this.movingY = this.vel.y !== 0;
			this.moving = this.movingX || this.movingY;
			
			this.updateBounds();
			
		}
		else {
			
			this.changed = this.moving = this.movingX = this.movingY = false;
			
		}
		
	},
	
	/**
	 * Updates bounds and visibility.
	 **/
	updateBounds: function () {
		
		this.verticesWorld = this.getVerticesWorld();
		
		this.bounds = this.getBounds();
		this.boundsDraw = this.getBoundsDraw();
		
		this.visible = this.getIsVisible();
		
	},
	
	/**
	 * Changes entity.
	 **/
	updateChanges: function () {
		
		this.moveToUpdate();
		
	},
	
	/**
	 * Updates velocity based on acceleration and friction.
	 **/
	updateVelocity: function () {
		
		this.vel.x = this.getNewVelocity( this.vel.x, this.accel.x, this.friction.x, this.maxVel.x );
		this.vel.y = this.getNewVelocity( this.vel.y, this.accel.y, this.friction.y, this.maxVel.y );
		
	},
	
	/**
	 * Complete update.
	 **/
	updateCleanup: function () {
		
		// animation
		
		if( this.currentAnim ) {
			this.currentAnim.update();
		}
		
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

// stable type expansion system

ig.Entity._lastType = 4;

/**
 * Gets a type by name, and if does not exists, creates it.
 **/
ig.Entity.getType = function ( name ) {
	
	var type = ig.Entity.TYPE[ name ];
	
	if ( ig.Entity.TYPE.hasOwnProperty( name ) !== true ) {
		
		ig.Entity.TYPE[ name ] = type = ig.Entity._lastType;
		
		// these types are bitwise flags
		// multiply last type by 2 each time to avoid false positives
		
		ig.Entity._lastType *= 2;
		
	}
	
	return type;
	
};

/**
 * Adds a type by name to a property of an entity.
 **/
ig.Entity.addType = function ( entity, name, property ) {
	
	if ( typeof name === 'string' ) {
		
		if ( !_ut.isNumber( entity[ property ] ) ) {
			
			property = "type";
			
		}
		
		entity[ property ] |= ig.Entity.getType( name.toUpperCase() );
		
	}
	
};

/**
 * Convenience method for adding types to check against.
 * See ig.Entity.addType.
 **/
ig.Entity.addCheckAgainst = function ( entity, name ) {
	
	ig.Entity.addType( entity, name, "checkAgainst" );
	
};

});