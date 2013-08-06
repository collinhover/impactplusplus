/**
 * Game module with layers and physics handling.
 * Includes (modified) Impact Layers plugin by Amadeus - https://github.com/amadeus/impact-layers
 * @extends ig.GameExtended
 * @author Collin Hover - collinhover.com
 **/
ig.module(
	'plusplus.physics.game'
).requires(
    'plusplus.core.shared',
    'plusplus.core.game',
	'plusplus.helpers.utils',
	'plusplus.helpers.utilsmath',
	'plusplus.helpers.utilstile',
	'plusplus.core.camera',
    'plusplus.core.entity',
    'plusplus.shapes.shape-physics-solid',
    'plusplus.shapes.shape-physics-edge',
    'plusplus.shapes.shape-physics-climbable',
    'plusplus.physics.entity',
	'plusplus.physics.box2d',
	'plusplus.physics.debug'
)
.defines(function(){'use strict';

var _s = ig.shared;
var _ut = ig.utils;
var _utm = ig.utilsmath;
var _utt = ig.utilstile;
var _b2 = ig.Box2D;

ig.GamePhysics = ig.GameExtended.extend({
	
	gravity: 100,
	
	// get all edge shapes for physics
	
	shapesPasses: [
		{
			retainBoundaryOuter: false
		}
	],
	
	/**
	 * Loads a level.
	 * @param {Object} level data.
	 * @returns {Game} this for chaining.
	 **/
	loadLevel: function(data) {
        
		var layer, layerName;
		var i, il;
        
		// add physics world to physics layers
        
		for ( i = 0, il = this.layerOrder.length; i < il; i++) {
			
			layerName = this.layerOrder[ i ];
			layer = this.layers[layerName];
            
			if ( layer.physicsLayer ) {
				
				// new world first as newly spawned entities may need physics bodies
				
				layer.world = new _b2.World( new _b2.Vec2( 0, this.gravity * _s.SCALE_PHYSICS ), true );
				
				if ( _s.debug ) {
					
					layer.debugPhysics = new ig.DebugPhysics( layer.world );
					
				}
				
				// create impact collision listener
				
				var listener = new _b2.ContactListener();
				
				listener.BeginContact = function( contact ){
					
					var fixtureA = contact.GetFixtureA();
					var fixtureB = contact.GetFixtureB();
					var bodyA = fixtureA.GetBody();
					var bodyB = fixtureB.GetBody();
					var a = bodyA.GetUserData();
					var b = bodyB.GetUserData();
					
					if ( a instanceof ig.EntityPhysics && b instanceof ig.EntityPhysics ) {
						
						// check pass through
						
						if ( !contact.IsEnabled() ) {
							
							return;
							
						}
						
						// start one-way platforms check
						// collision is not between a sensor and only one of colliding bodies is one-way
						
						var manifold = contact.GetManifold();
						var contactRecord, contactRecordA, contactRecordB;
						var fixtureOneWay, bodyOneWay, entityOneWay;
						var fixture, body, entity;
						
						if ( a.oneWay ) {
							
							entityOneWay = a;
							bodyOneWay = bodyA;
							fixtureOneWay = fixtureA;
							
							entity = b;
							body = bodyB;
							fixture = fixtureB;
							
						}
						else if ( b.oneWay ) {
							
							entityOneWay = b;
							bodyOneWay = bodyB;
							fixtureOneWay = fixtureB;
							
							entity = a;
							body = bodyA;
							fixture = fixtureA;
							
						}
						
						if ( bodyOneWay
							&& ( bodyA.GetType() === _b2.Body.b2_dynamicBody || bodyB.GetType() === _b2.Body.b2_dynamicBody )
							&& !( fixtureA.IsSensor() || fixtureB.IsSensor() )
							&& !( a.oneWay && b.oneWay ) ) {
							
							// keep a record of one-way collision
							
							var index = _ut.indexOfProperties( entity.contactingOneWay, [ 'fixture', 'bodyOneWay' ], [ fixture, bodyOneWay ] );
							
							if ( index === -1 ) {
								
								contactRecord = {
									enabled: false,
									fixture: fixture,
									body: body,
									entity: entity,
									fixtureOneWay: fixtureOneWay,
									bodyOneWay: bodyOneWay,
									entityOneWay: entityOneWay,
									contact: contact
								};
									
								var worldManifold = new _b2.WorldManifold();
								contact.GetWorldManifold( worldManifold );
								
								var oneWayFacing = entityOneWay.oneWayFacing;
								var normal = worldManifold.m_normal;
								
								// compare direction of normal and one way facing
								// dot product tells us angle domain
								// dot > 0 = angle less than 90, normal and facing are in similar directions
								
								if( _b2.Math.Dot( normal, oneWayFacing ) > 0 ) {
									
									var facingX = oneWayFacing.x;
									var facingY = oneWayFacing.y;
									
									var point = worldManifold.m_points[ 0 ];
									var b2X = point.x;
									var b2Y = point.y;
									var x = b2X / _s.SCALE_PHYSICS;
									var y = b2Y / _s.SCALE_PHYSICS;
									
									// compare location of contact to near edge 10% of entity relative to facing
									
									if ( ( facingY !== 0 && _utm.almostEqual( y, ( facingY < 0 ? entity.bounds.maxY : entity.bounds.minY ), entity.size.y * _s.SLOP_PCT_ONE_SIDED ) )
										|| ( facingX !== 0 && _utm.almostEqual( x, ( facingX < 0 ? entity.bounds.maxX : entity.bounds.minX ), entity.size.x * _s.SLOP_PCT_ONE_SIDED ) ) ) {
										
										contactRecord.enabled = true;
										
									}
									
								}
								
								entity.contactingOneWay.push( contactRecord );
								
							}
							else {
								
								contactRecord = entity.contactingOneWay[ index ];
								
							}
							
							contact.SetEnabled( contactRecord.enabled );
							
							if ( contactRecord.enabled ) {
								
								entity.collidingWithOneWay++;
								
								// store contact record so we can pass to entity
								
								if ( bodyOneWay === bodyB ) {
									
									contactRecordA = contactRecord;
									
								}
								else {
									
									contactRecordB = contactRecord;
									
								}
								
							}
							
						}
						
						// handle contacts
						
						a.beginContact( b, manifold, fixtureA, fixtureB, contactRecordA );
						b.beginContact( a, manifold, fixtureB, fixtureA, contactRecordB );
						
					}
					
				};
				
				listener.EndContact = function( contact ){
					
					var fixtureA = contact.GetFixtureA();
					var fixtureB = contact.GetFixtureB();
					var bodyA = fixtureA.GetBody();
					var bodyB = fixtureB.GetBody();
					var a = bodyA.GetUserData();
					var b = bodyB.GetUserData();
					
					if ( a instanceof ig.EntityPhysics && b instanceof ig.EntityPhysics ) {
						
						// check pass through
						
						if ( !contact.IsEnabled() ) {
							
							return;
							
						}
						
						// end one-way platforms check
						// collision is not between a sensor and only one of colliding bodies is one-way
						
						var manifold = contact.GetManifold();
						var contactRecord, contactRecordA, contactRecordB;
						var bodyOneWay;
						var fixture, entity;
						
						if ( a.oneWay ) {
							
							bodyOneWay = bodyA;
							entity = b;
							fixture = fixtureB;
							
						}
						else if ( b.oneWay ) {
							
							bodyOneWay = bodyB;
							entity = a;
							fixture = fixtureA;
							
						}
						
						if ( bodyOneWay
							&& ( bodyA.GetType() === _b2.Body.b2_dynamicBody || bodyB.GetType() === _b2.Body.b2_dynamicBody )
							&& !( fixtureA.IsSensor() || fixtureB.IsSensor() )
							&& !( a.oneWay && b.oneWay ) ) {
							
							// clean one-way record contact
							
							var index = _ut.indexOfProperties( entity.contactingOneWay, [ 'fixture', 'bodyOneWay' ], [ fixture, bodyOneWay ] );
							
							if ( index !== -1 ) {
								
								var contactRecord = entity.contactingOneWay[ index ];
								
								// store contact record so we can pass to entity
								
								if ( bodyOneWay === bodyB ) {
									
									contactRecordA = contactRecord;
									
								}
								else {
									
									contactRecordB = contactRecord;
									
								}
								
								entity.contactingOneWay.splice( index, 1 );
								
							}
							
						}
						
						// handle contacts
						
						a.endContact( b, manifold, fixtureA, fixtureB, contactRecordA );
						b.endContact( a, manifold, fixtureB, fixtureA, contactRecordB );
						
						// decrease colliding with one way after contacts handled
						
						if ( contactRecordA && contactRecordA.enabled ) {
							a.collidingWithOneWay = Math.max( 0, a.collidingWithOneWay - 1 );
						}
						if ( contactRecordB && contactRecordB.enabled ) {
							b.collidingWithOneWay = Math.max( 0, b.collidingWithOneWay - 1 );
						}
						
					}
					
				};
				
				listener.PreSolve = function ( contact, oldManifold ) {
					
					var fixtureA = contact.GetFixtureA();
					var fixtureB = contact.GetFixtureB();
					var bodyA = fixtureA.GetBody();
					var bodyB = fixtureB.GetBody();
					var a = bodyA.GetUserData();
					var b = bodyB.GetUserData();
					
					if ( a instanceof ig.EntityPhysics && b instanceof ig.EntityPhysics ) {
						
						// check pass through
						
						if ( _ut.indexOfValue( a.typesPassThrough, b.type ) !== -1 || _ut.indexOfValue( b.typesPassThrough, a.type ) !== -1 ) {
							
							contact.SetEnabled( false );
							
							return;
							
						}
						
						// continued one-way platforms check
						// collision is not between a sensor and only one of colliding bodies is one-way
						
						var bodyOneWay;
						var fixture, entity;
						
						if ( a.oneWay ) {
							
							bodyOneWay = bodyA;
							entity = b;
							fixture = fixtureB;
							
						}
						else if ( b.oneWay ) {
							
							bodyOneWay = bodyB;
							entity = a;
							fixture = fixtureA;
							
						}
						
						if ( bodyOneWay
							&& ( bodyA.GetType() === _b2.Body.b2_dynamicBody || bodyB.GetType() === _b2.Body.b2_dynamicBody )
							&& !( fixtureA.IsSensor() || fixtureB.IsSensor() )
							&& !( a.oneWay && b.oneWay ) ) {
							
							// use record of one-way collision to enable/disable contact
							
							var index = _ut.indexOfProperties( entity.contactingOneWay, [ 'fixture', 'bodyOneWay' ], [ fixture, bodyOneWay ] );
							
							if ( index !== -1 ) {
								
								contact.SetEnabled( entity.contactingOneWay[ index ].enabled );
								
							}
							
						}
						
					}
					
				};
		
				// attach to listener physics world
				
				layer.world.SetContactListener( listener );
				
			}
            
		}
		
		this.parent.apply( this, arguments );
        
	},
	
	createShapes: function () {
		
		var i, il, j, jl;
		var options, shapes;
		
		for ( i = 0, il = this.shapesPasses.length; i < il; i++ ) {
			
			options = this.shapesPasses[ i ];
			shapes = _utt.shapesFromCollisionMap( this.collisionMap, options );
			
			// edge shapes
			
			for( j = 0, jl = shapes.edges.length; j < jl; j++ ) {
				
				var shape = shapes.edges[ j ];
				
				this.spawnEntity( ig.EntityShapePhysicsEdge, shape.x, shape.y, shape.settings );
				
			}
			
			// one-way shapes
			
			for( j = 0, jl = shapes.oneWays.length; j < jl; j++ ) {
				
				var shape = shapes.oneWays[ j ];
				
				this.spawnEntity( ig.EntityShapePhysicsSolid, shape.x, shape.y, shape.settings );
				
			}
			
			// climbable shapes
			
			for( j = 0, jl = shapes.climbables.length; j < jl; j++ ) {
				
				var shape = shapes.climbables[ j ];
				
				this.spawnEntity( ig.EntityShapePhysicsClimbable, shape.x, shape.y, shape.settings );
				
			}
			
		}
		
	},
	
	/**
	 * See ig.GameExtended
	 **/
	createLayer: function( name, properties ){
		
		var layer = this.parent.apply( this, arguments );
		
        layer.itemsPhysics = layer.itemsPhysics || [];
		
		return layer;
		
	},
	
	/**
	 * See ig.GameExtended.
	 **/
	addDeferredItems: function () {
		
		var items = this.itemsToAdd.slice( 0 );
		
		this.parent.apply( this, arguments );
		
		for( var i = 0, il = items.length; i < il; i++ ) {
			
			var data = items[ i ];
			var item = data.item;
			var layer = this.layers[ item.layerName ];
			
			if ( item instanceof ig.EntityPhysics ) {
				
				layer.itemsPhysics.push( item );
				
			}
			
		}
		
	},
	
	/**
	 * See ig.GameExtended.
	 **/
	removeDeferredItems: function () {
		
		for( var i = 0, il = this.itemsToRemove.length; i < il; i++ ) {
			
			var data = this.itemsToRemove[ i ];
			var item = data.item
			var layer = this.layers[ data.layerName || item.layerName ];
			
			if ( layer ) {
				
				if ( item instanceof ig.EntityPhysics ) {
					
					_ut.arrayCautiousRemove( layer.itemsPhysics, item );
					
				}
				
			}
			
		}
		
		this.parent.apply( this, arguments );
		
	},
	
    /**
	 * Override original check to step layer physics world.
	 **/
	checkEntities: function ( layer ) {

		if ( layer && layer.physicsLayer ) {
			
			// allow physics entities to do a pre-world step update
			// this helps with things like applying anti-grav
			
			for( var j = 0, jl = layer.itemsPhysics.length; j < jl; j++ ) {
				var ent = layer.itemsPhysics[ j ];
				if( !ent._killed ) {
					ent.updatePreStep();
				}
			}
			
			// step layer world
			
			layer.world.Step( ig.system.tick, 5, 5 );
			layer.world.ClearForces();
			
		}
		
	},
	
    /**
	 * Draws all items (entities).
	 **/
	draw: function(){
		
		var i, il, layerName, layer;
		
		this.parent.apply( this, arguments );
		
		if ( _s.debug ) {
			
			for ( i = 0, il = this.layerOrder.length; i < il; i++ ) {
				
				layerName = this.layerOrder[ i ];
				layer = this.layers[ layerName ];
				
				if ( layer.debugPhysics ) {
					
					layer.debugPhysics.draw();
					
				}
				
			}
			
		}
		
	}
	
});

});
