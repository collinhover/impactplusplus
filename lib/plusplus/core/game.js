/**
 * Game module with layers and physics handling.
 * Includes (modified) Impact Layers plugin by Amadeus - https://github.com/amadeus/impact-layers
 * @extends ig.Game
 * @author Collin Hover - collinhover.com
 **/
ig.module(
	'plusplus.core.game'
).requires(
	'impact.game',
	'impact.background-map',
	'impact.collision-map',
    'plusplus.helpers.shared',
    'plusplus.helpers.tweens',
	'plusplus.helpers.utils',
	'plusplus.helpers.utilsmath',
	'plusplus.helpers.utilsphysics',
    'plusplus.core.entity',
    'plusplus.physics.entity',
	'plusplus.physics.solid-shape',
	'plusplus.physics.edge-shape',
	'plusplus.physics.climbable-shape',
	'plusplus.physics.box2d',
	'plusplus.entities.light'
)
.defines(function(){'use strict';

var _s = ig.shared;
var _u = ig.utils;
var _um = ig.utilsmath;
var _up = ig.utilsphysics;
var _b2 = ig.Box2D;

ig.GamePhysics = ig.Game.extend({
	
	gravity: 100,
	
	lightsAlphaMax: 0.5,
    
	// deferred body destroy list
	
	_deferredDestroy: [],
    
	// default group of layers
	
	layerOrder: [],

	// all renderable layers
	
	layers: {},
	
	// default entities layer name
	
	layerEntitiesName: 'entities',
	
	// Layer removal queue
	
	_layerProperties : [],
	_layersToRemove  : [],
	_itemsToRemove   : [],

	/**
	 * Creates basic layers and adds resize event.
	 **/
	init: function(){
		
		// setup basic layers
		
		this.createLayer( 'backgroundMaps', {
			clearOnLoad: true,
			mapLayer: true,
			noUpdate: true
		} );
		
		this.createLayer( 'backgroundLights', {
			clearOnLoad: true,
			entityLayer: true,
			autoSort: this.autoSort,
			sortBy: this.sortBy,
			_doSortEntities: false
		} );
		
		this.createLayer( this.layerEntitiesName, {
			clearOnLoad: true,
			entityLayer: true,
			physicsLayer: true,
			autoSort: this.autoSort,
			sortBy: this.sortBy,
			_doSortEntities: false
		} );
		
		this.createLayer( 'foregroundLights', {
			clearOnLoad: true,
			entityLayer: true,
			autoSort: this.autoSort,
			sortBy: this.sortBy,
			_doSortEntities: false
		} );
		
		this.createLayer( 'foregroundMaps', {
			clearOnLoad: true,
			mapLayer: true,
			noUpdate: true
		} );
		
		// set entities items as original entities for compatibility
		
		this.entities = this.layers[ this.layerEntitiesName ];
		
		// resize canvas
		
		ig.global.addEventListener( 'resize', _u.debounce( this.resize.bind( this ), 500 ), false );
		this.resize();
		
	},
	
	/**
	 * Sets deferred properties of a layer.
	 * @param {String} name of layer.
	 * @param {Object} properties to change.
	 * @returns {Game} this for chaining.
	 **/
	setLayerProperties: function ( layerName, properties ) {
		
		this._layerProperties.push( [layerName, properties] );
		
		return this;
		
	},
	
	/**
	 * Sets sorting order of layers.
	 * @param {Array} layer order.
	 * @returns {Game} this for chaining.
	 **/
	setLayerSort: function ( order ) {
		
		this._layerOrder = ( order && order.length ) ? order : [];
		
		return this;
		
	},
	
	/**
	 * Creates a layer and adds it to the list.
	 * @param {String} name of layer.
	 * @param {Object} properties of layer.
	 * @returns {Game} this for chaining.
	 **/
	createLayer: function( name, properties ){
		
		var layer = this.layers[name] = ig.merge(this.layers[name] || {}, properties);
		
		layer.items = layer.items || [];
        layer.itemsPhysics = layer.itemsPhysics || [];
		layer.itemsOpaque = layer.itemsOpaque || [];
		layer.itemsLight = layer.itemsLight || [];
		
		this.layerOrder.push(name);
		
		return this;
		
	},
	
	/**
	 * Deferred removal of layer.
	 * @param {String} name of layer.
	 * @returns {Game} this for chaining.
	 **/
	removeLayer: function(name){
		
		this._layersToRemove.push(name);
		
		return this;
		
	},
	
	/**
	 * Adds an item to a layer.
	 * @param {Item} item to add.
	 * @param {String} name of layer.
	 * @returns {Game} this for chaining.
	 **/
	addItem: function ( item, layerName ) {
		
		layerName = layerName || item.layerName;
		
		// Throw a descriptive error if the layer doesn't exist
		
		var layer = this.layers[layerName];
		if (!layer) throw new Error('Attempting to add to a layer that doesn\'t exist: ' + layerName);

		// Always hold a reference to the item's layer, for easier removal
		
		item.layerName = layerName;
		
		// add to lists
		
		layer.items.push(item);
		
		if ( item.opaque && !( item instanceof ig.EntityLight ) ) {
			
			layer.itemsOpaque.push( item );
			
		}
		
		if ( item instanceof ig.EntityPhysics ) {
			
			layer.itemsPhysics.push( item );
			
		}
		else if ( item instanceof ig.EntityLight ) {
			
			layer.itemsLight.push( item );
			
		}
		
		return this;
	},
	
	/**
	 * Deferred removal of item.
	 * @param {Item} item to remove.
	 * @returns {Game} this for chaining.
	 **/
	removeItem: function(item) {
		
		this._itemsToRemove = this._itemsToRemove.concat(item);
		
		return this;
		
	},
	
	/**
	 * Sort of entities, sorting all layers if no layer name passed.
	 * @param {Name} (optional) layer name.
	 * @returns {Game} this for chaining.
	 **/
	sortEntities: function( layerName ) {
		
		if ( typeof layerName === 'string' ) {
			
			this.sortEntitiesOnLayer( layerName );
			
		}
		else {
			
			for ( var i = 0, il = this.layerOrder.length; i < il; i++ ) {
				
				this.sortEntitiesOnLayer( this.layerOrder[ i ] );
				
			}
			
		}
		
		return this;
		
	},
	
	/**
	 * Sort of entities on a specific layer.
	 * @param {Name} layer name.
	 * @returns {Game} this for chaining.
	 **/
	sortEntitiesOnLayer: function( layerName ) {
		
		var layer = this.layers[ layerName || this.layerEntitiesName ];
		
		if ( layer ) {
			
			layer.items.sort(layer.sortBy);
			
		}
		
		return this;
		
	},
	
	/**
	 * Deferred sort of entities, sorting all layers if no layer name passed.
	 * @param {Name} (optional) layer name.
	 * @returns {Game} this for chaining.
	 **/
	sortEntitiesDeferred: function ( layerName ) {
		
		if ( typeof layerName === 'string' ) {
			
			this.sortEntitiesOnLayerDeferred( layerName );
			
		}
		else {
			
			for ( var i = 0, il = this.layerOrder.length; i < il; i++ ) {
				
				this.sortEntitiesOnLayerDeferred( this.layerOrder[ i ] );
				
			}
			
		}
		
		return this;
		
	},
	
	/**
	 * Deferred sort of entities on a specific layer.
	 * @param {Name} layer name.
	 * @returns {Game} this for chaining.
	 **/
	sortEntitiesOnLayerDeferred: function ( layerName ) {
		
		layerName = layerName || this.layerEntitiesName;
		
		if ( layer ) {
			
			this.layer[ layerName ]._doSortEntities = true;
			
		}
		
		return this;
		
	},
	
	/**
	 * Update entities in layer.
	 * @param {Name} layer name.
	 * @returns {Game} this for chaining.
	 **/
	updateEntities: function( layerName ) {
		
		var entities = this.layers[ layerName || this.layerEntitiesName ].items;
		var i, il, entity;
		
		for (i = 0, il = entities.length; i < il; i++ ) {
			
			entity = entities[ i ];
			
			if ( !entity._killed ) {
				entity.update();
			}
			
		}
		
		return this;
		
	},
    
    // no need to check entities, handled by physics
	checkEntities: function() {},
	
	/**
	 * Gets all entities of a type.
	 * @param {Type} (optional, default = all ) entity type.
	 * @param {String} ( optional, default = entity layer ) layer name to search.
	 * @returns {Array} all found entities.
	 **/
	getEntitiesByType: function( type, layerName ) {

		var items = this.layers[ layerName || this.layerEntitiesName ].items;
		
		if ( typeof type === 'undefined' ) {
			
			return items;
			
		}
		else {
			
			var matching = [];
			var entityClass = typeof( type ) === 'string' ? ig.global[ type ] : type;
			
			for ( var i = 0, il = items.length; i < il; i++ ) {
				
				var item = items[ i ];
				
				if ( !item._killed && item instanceof entityClass ) {
					
					matching.push( item );
					
				}
				
			}
			
			return matching;
			
		}
		
	},
	
	/**
	 * Gets a map by matching name.
	 * @param {String} map name to search.
	 * @returns {Map} Map if found, else undefined.
	 **/
	getMapByName: function( name ) {
		
		var i, il, j, jl, items, layer;
		
		if (name === 'collision') {
			
			return this.collisionMap;
			
		}
		
		for ( i = 0, il = this.layerOrder.length; i < il; i++ ) {
			
			layer = this.layers[ this.layerOrder[ i ] ];
			items = layer.items;

			if ( layer.mapLayer ) {

				for ( j = 0, jl = items.length; j < jl; j++) {
					
					var item = items[ j ];
					
					if( item.name === name) {
						
						return item;
						
					}
					
				}
				
			}
			
		}
		
	},
	
	/**
	 * Loads a level.
	 * @param {Object} level data.
	 * @returns {Game} this for chaining.
	 **/
	loadLevel: function(data) {
        
		var ent, ld, newMap, layer, layerName, i, il, j, jl, items;
        
		this.screen = {
			x: 0,
			y: 0
		};
        
		// handle layers
        
		for ( i = 0, il = this.layerOrder.length; i < il; i++) {
			
			layerName = this.layerOrder[ i ];
			layer = this.layers[layerName];
            
			if (layer.clearOnLoad) {
				layer.items = [];
			}
            
            if ( layer.entityLayer ) {
                
				if ( layer.physicsLayer ) {
					
					// new world first as newly spawned entities may need physics bodies
					
					layer.world = new _b2.World( new _b2.Vec2( 0, this.gravity * _b2.SCALE ), true );
					
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
								
								var index = _u.indexOfProperties( entity.contactingOneWay, [ 'fixture', 'bodyOneWay' ], [ fixture, bodyOneWay ] );
								
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
										var x = b2X / _b2.SCALE;
										var y = b2Y / _b2.SCALE;
										
										// compare location of contact to near edge 10% of entity relative to facing
										
										if ( ( facingY !== 0 && _um.almostEqual( y, ( facingY < 0 ? entity.bounds.maxY : entity.bounds.minY ), entity.size.y * _s.oneSidedSlopPct ) )
											|| ( facingX !== 0 && _um.almostEqual( x, ( facingX < 0 ? entity.bounds.maxX : entity.bounds.minX ), entity.size.x * _s.oneSidedSlopPct ) ) ) {
											
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
								
								var index = _u.indexOfProperties( entity.contactingOneWay, [ 'fixture', 'bodyOneWay' ], [ fixture, bodyOneWay ] );
								
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
							
							if ( _u.indexOfValue( a.typesPassThrough, b.type ) !== -1 || _u.indexOfValue( b.typesPassThrough, a.type ) !== -1 ) {
								
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
								
								var index = _u.indexOfProperties( entity.contactingOneWay, [ 'fixture', 'bodyOneWay' ], [ fixture, bodyOneWay ] );
								
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
            
		}
        
		// entities
		
        this.namedEntities = {};
        
		for (i = 0, il = data.entities.length; i < il; i++ ) {
            
			ent = data.entities[ i ];
			this.spawnEntity(ent.type, ent.x, ent.y, ent.settings);
            
		}

		// maps
		
		this.collisionMap = ig.CollisionMap.staticNoCollision;
        
		for (i = 0; i < data.layer.length; i++ ) {
			ld = data.layer[i];
            
			if(ld.name === 'collision') {
                
				this.collisionMap = new ig.CollisionMap( ld.tilesize, ld.data );
                
			}
            else {
                
				newMap = new ig.BackgroundMap(ld.tilesize, ld.data, ld.tilesetName);
				newMap.anims = this.backgroundAnims[ld.tilesetName] || {};
				newMap.repeat = ld.repeat;
				newMap.distance = ld.distance;
				newMap.foreground = !!ld.foreground;
				newMap.preRender = !!ld.preRender;
				newMap.name = ld.name;
                
				// No layer provided, which means we guesstimate
				if (!newMap.layerName && newMap.foreground) {
					newMap.layerName = 'foregroundMaps';
				}
				else if (!newMap.layerName) {
					newMap.layerName = 'backgroundMaps';
				}
                
				this.addItem(newMap);
                
			}
		}
        
		this.sortEntities();
        
		// convert collision map to physics data
		
		this.shapesPhysics = _up.shapesFromCollisionMap( this.collisionMap );
		
		// edge shapes
        
        for( var i = 0, il = this.shapesPhysics.edges.length; i < il; i++ ) {
            
            var shape = this.shapesPhysics.edges[ i ];
			
			// shape conversion gives vertices in clockwise order
			// for edges we need to reverse vertex order ( for proper shadows and others )
			
			shape.settings.vertices.reverse();
            
            this.spawnEntity( ig.EntityEdgeShape, shape.x, shape.y, shape.settings );
            
        }
		
		// solid shapes
        
        for( var i = 0, il = this.shapesPhysics.solids.length; i < il; i++ ) {
            
            var shape = this.shapesPhysics.solids[ i ];
            
            this.spawnEntity( ig.EntitySolidShape, shape.x, shape.y, shape.settings );
            
        }
		
		// climbable shapes
		
        for( var i = 0, il = this.shapesPhysics.climbables.length; i < il; i++ ) {
            
            var shape = this.shapesPhysics.climbables[ i ];
            
            this.spawnEntity( ig.EntityClimbableShape, shape.x, shape.y, shape.settings );
            
        }
		
		// set all layer items ready

		for ( i = 0, il = this.layerOrder.length; i < il; i++) {
			
			layerName = this.layerOrder[ i ];
			layer = this.layers[layerName];
			items = layer.items;

			if ( layer.entityLayer ) {
                
				for ( j = 0, jl = items.length; j < jl; j++) {
					items[ j ].ready();
				}
                
			}
		}
		
		// record changed
		
		this.changedEntities = true;
		
		return this;
        
	},
	
	/**
	 * Spawns an entity of type.
	 * @param {Type} entity type.
	 * @param {Number} x position.
	 * @param {Number} y position.
	 * @param {Object} settings for entity.
	 * @returns {Entity} created entity.
	 **/
	spawnEntity: function( type, x, y, settings ) {
		
		//
		
		var EntityClass = typeof type === 'string' ? ig[type] || ig.global[type] : type;
		
		if ( !EntityClass ) {
			throw new Error( "Can't spawn entity of type: " + type);
		}
		// if type is original entity, swap with extended entity
		// this is done to ensure stability
		else if ( type === 'Entity' ) {
			EntityClass = ig.EntityExtended;
		}
		
		var ent = new (EntityClass)(x, y, settings || {});
		
		// Push entity into appropriate layer
		
		this.addItem( ent );
		
		if ( ent.name ) this.namedEntities[ent.name] = ent;
        
        // can't forget physics
		
		if ( ent instanceof ig.EntityPhysics ) {
			
			this.addEntityPhysics( ent );
			
		}
		
		return ent;
		
	},
    
	/**
	 * Removes an entity.
	 * @param {Entity} entity.
	 **/
	removeEntity: function ( ent ) {
		
		this.removeItem( ent );
		
		if ( ent.name ) delete this.namedEntities[ent.name];
		
        // can't forget physics
		
		if ( ent instanceof ig.EntityPhysics ) {
			
			this.removeEntityPhysics( ent );
			
		}
		
		ent._killed = true;
		ent.type = ig.Entity.TYPE.NONE;
		ent.checkAgainst = ig.Entity.TYPE.NONE;
		ent.collides = ig.Entity.COLLIDES.NEVER;
		
		return this;
		
	},

	/**
	 * Create entity's physics body.
	 * @param {Entity} entity.
	 **/
	addEntityPhysics: function ( ent ) {
		
		if ( !ent.body ) {
			
			ent.createBody();
			
		}
		
		return this;
		
	},
    
    /**
	 * Deferred removal of entity's physics objects.
	 * @param {Entity} entity.
	 **/
	removeEntityPhysics: function ( ent ) {
		
		_u.arrayCautiousAdd( this._deferredDestroy, ent );
		
		return this;
		
	},

    /**
	 * Updates all layers and items (entities), loads deferred, and removes deferred.
	 **/
	update: function(){
		
		var i, il, j, jl;
		var layerName, layer;
		var items, item;
		var index, tileset, anims;

		// Set any deferred layer properties
		if ( this._layerProperties.length > 0 ) {
			
			for( i = 0, il = this._layerProperties.length; i < il; i++ ) {
				layer = this._layerProperties[ i ];
				ig.merge( this.layers[ layer[0] ], layer[1] );
			}
			
			this._layerProperties = [];
			
		}

		// Remove all deferred layers
		if ( this._layersToRemove.length > 0 ) {
			
			for( i = 0, il = this._layersToRemove.length; i < il; i++ ) {
				layerName = this._layersToRemove[ i ];
				layer = this.layers[layerName];
				if (!layer) continue;
				if (layer.clean) {
					this._itemsToRemove = this._itemsToRemove.concat(layer.items);
				}
				delete this.layers[layerName];
			}
			
			this._layersToRemove = [];
			
		}

		// Remove all queued items
		if ( this._itemsToRemove.length > 0 ) {
			
			this.changedEntities = true;
			
			for( i = 0, il = this._itemsToRemove.length; i < il; i++ ) {
				
				item = this._itemsToRemove[ i ];
				layer = this.layers[ item.layerName ];
				
				if (item.cleanup) item.cleanup();
				
				// remove from item lists
				
				if ( layer ) {
					
					_u.arrayCautiousRemove( layer.items, item );
					
					if ( item.opaque ) {
						
						_u.arrayCautiousRemove( layer.itemsOpaque, item );
						
					}
					
					if ( item instanceof ig.EntityPhysics ) {
						
						_u.arrayCautiousRemove( layer.itemsPhysics, item );
						
					}
					else if ( item instanceof ig.EntityLight ) {
						
						_u.arrayCautiousRemove( layer.itemsLight, item );
						
					}
					
				}
				
			}
			
			this._itemsToRemove = [];
			
		}
		
		// deferred removal of destroyed bodies
		if ( this._deferredDestroy.length > 0 ) {
			
			for( i = 0, il = this._deferredDestroy.length; i < il; i++ ) {
				this._deferredDestroy[i].destroyPhysicsInstantly();
			}
			
			this._deferredDestroy = [];
			
		}

		// Update new layer order
		if (this._layerOrder) {
			
			this.layerOrder = this._layerOrder;
			this._layerOrder = null;
			
		}

		// load new level
		if(this._levelToLoad) {
			
			this.loadLevel(this._levelToLoad);
			this._levelToLoad = null;
			
		}
		
		// gather all entities from entity layers into game.entities for compatibility
		
		if ( this.changedEntities !== false ) {
			
			this.changedEntities = false;
			this.entities = [];
			
			for ( i = 0, il = this.layerOrder.length; i < il; i++) {
				
				layerName = this.layerOrder[ i ];
				layer = this.layers[layerName];
				items = layer.items;
				
				if ( layer.entityLayer ) {
					
					this.entities = this.entities.concat( items );
					
				}
				
			}
			
		}
        
		// update tweens
		
		ig.tweens.update();
		
		// execute update and associated functions for all applicable layers
		
        for ( i = 0, il = this.layerOrder.length; i < il; i++) {
            
			layerName = this.layerOrder[ i ];
			layer = this.layers[layerName];
			items = layer.items;
            
			if ( layer.noUpdate ) continue;
			
			if ( layer.entityLayer ) {
                
				if ( layer.physicsLayer ) {
					
					// allow physics entities to do a pre-world step update
					// this helps with things like applying anti-grav
					
					for( j = 0, jl = layer.itemsPhysics.length; j < jl; j++ ) {
						var ent = layer.itemsPhysics[ j ];
						if( !ent._killed ) {
							ent.updatePreStep();
						}
					}
					
					// step layer world
					
					layer.world.Step( ig.system.tick, 5, 5 );
					layer.world.ClearForces();
					
				}
                
                if (layer._doSortEntities || layer.autoSort) {
                    items.sort(layer.sortBy || this.sortBy);
                    layer._doSortEntities = false;
                }
                
			}
            
            // update items
			
			layer.itemsChanged = false;
			layer.itemsUpdated = [];
            
			for (j = 0, jl = items.length; j < jl; j++) {
				
				item = items[ j ];
				
				item.update();
				
				layer.itemsUpdated[ j ] = item;
				layer.itemsChanged |= item.changed;
				
			}
            
		}

		// Update background animations
		for (tileset in this.backgroundAnims) {
			anims = this.backgroundAnims[tileset];
			for (x in anims) {
				anims[x].update();
			}
		}
		
	},

    /**
	 * Draws all items (entities).
	 **/
	draw: function(){
		
		// clear screen
		
		if ( this.clearColor ) {
			ig.system.clear( this.clearColor );
		}
		
		// This is a bit of a circle jerk. Non-physics Entities reference game._rscreen
		// instead of game.screen when drawing themselfs in order to be
		// "synchronized" to the rounded(?) screen position
		this._rscreen.x = ig.system.getDrawPos( this.screen.x ) / ig.system.scale;
		this._rscreen.y = ig.system.getDrawPos( this.screen.y ) / ig.system.scale;
		
		// draw all layers
		
		var i, il, j, jl, layerName, layer, items;
		
		for ( i = 0, il = this.layerOrder.length; i < il; i++ ) {
			
			layerName = this.layerOrder[ i ];
			layer = this.layers[ layerName ];
			
			if ( layer.noDraw ) continue;
			
			items = layer.noUpdate ? layer.items : layer.itemsUpdated;
			
			for ( j = 0, jl = items.length; j < jl; j++ ) {
				
				items[ j ].draw();
				
			}
			
		}
		
	},
	
    /**
	 * Draws all entities (items) on a layer
	 * @param {String} layer name.
	 **/
	drawEntities: function( layerName ) {
		
		var entities, i, il;

		layerName = layerName || this.layerEntitiesName;
		entities = this.layers[ layerName ].items;

		for (i = 0, il = entities.length; i < il; i++) {
			entities[i].draw();
		}
		
	},
	
    /**
	 * Resize the canvas based on the window.
	 **/
	resize: function () {
		
		ig.system.resize( ig.global.innerWidth * _s.canvasWidthPct * ( 1 / _s.scale ), ig.global.innerHeight * _s.canvasHeightPct * ( 1 / _s.scale ), _s.scale );
		
	}
	
});

ig.BackgroundMap.inject( {

	// added .setScreenPos to the draw method to make the game-wide drawing method much simpler
	draw: function(){
		this.setScreenPos( ig.game.screen.x, ig.game.screen.y );
		if(!this.tiles.loaded || !this.enabled) return;
		if(this.preRender) this.drawPreRendered();
		else this.drawTiled();
	}

} );

/**
 * Additions to default Slope Tile definition.
 * - added half tiles
 * - TODO: added ladder tiles
 * See collision-map for more info.
 **/

var H = 1/2;
var N = 1/3;
var M = 2/3;
var P = 1/4;
var Q = 3/4;
var R = 11/64;
var S = 53/64;
var SOLID = true;
	
var dtd = ig.CollisionMap.defaultTileDef;

// half solid horizontal
dtd[ 56 ] = [ 0, H, 1, H, SOLID ];
dtd[ 67 ] = [ 1, H, 0, H, SOLID ];

// half solid vertical
dtd[ 78 ] = [ H, 0, H, 1, SOLID ];
dtd[ 89 ] = [ H, 1, H, 0, SOLID ];

// 15 NE
dtd[ 71 ] = [ 0, H, 1, R, SOLID ];
dtd[ 72 ] = [ 0, R, H, 0, SOLID ];
dtd[ 61 ] = [ H, 1, 1, S, SOLID ];
dtd[ 62 ] = [ 0, S, 1, H, SOLID ];

// 22 NE
dtd[ 69 ] = [ 0, H, 1, 0, SOLID ];
dtd[ 59 ] = [ 0, 1, 1, H, SOLID ];

// 45 NE
dtd[ 68 ] = [ 0, H, H, 0, SOLID ];
dtd[ 57 ] = [ H, 1, 1, H, SOLID ];

// 67 NE
dtd[ 87 ] = [ 0, H, P, 0, SOLID ];
dtd[ 76 ] = [ P, 1, Q, 0, SOLID ];
dtd[ 65 ] = [ Q, 1, 1, H, SOLID ];

// 75 NE
dtd[ 142 ] = [ 0, H, P, 0, SOLID ];
dtd[ 131 ] = [ P, 1, H, 0, SOLID ];
dtd[ 120 ] = [ H, 1, Q, 0, SOLID ];
dtd[ 109 ] = [ Q, 1, 1, H, SOLID ];

// 15 SE
dtd[ 104 ] = [ 0, H, 1, S, SOLID ];
dtd[ 105 ] = [ 0, S, H, 1, SOLID ];
dtd[ 116 ] = [ H, 0, 1, R, SOLID ];
dtd[ 117 ] = [ 0, R, 1, H, SOLID ];

// 22 SE
dtd[ 102 ] = [ 0, H, 1, 1, SOLID ];
dtd[ 114 ] = [ 0, 0, 1, H, SOLID ];

// 45 SE
dtd[ 101 ] = [ 0, H, H, 1, SOLID ];
dtd[ 112 ] = [ H, 0, 1, H, SOLID ];

// 67 SE
dtd[ 66 ] = [ 0, H, P, 1, SOLID ];
dtd[ 77 ] = [ P, 0, Q, 1, SOLID ];
dtd[ 88 ] = [ Q, 0, 1, H, SOLID ];

// 75 SE
dtd[ 110 ] = [ 0, H, R, 1, SOLID ];
dtd[ 121 ] = [ R, 0, H, 1, SOLID ];
dtd[ 132 ] = [ H, 0, S, 1, SOLID ];
dtd[ 143 ] = [ S, 0, 1, H, SOLID ];

// 15 NW
dtd[ 95 ] = [ 1, H, 0, R, SOLID ];
dtd[ 94 ] = [ 1, R, H, 0, SOLID ];
dtd[ 83 ] = [ H, 1, 0, S, SOLID ];
dtd[ 82 ] = [ 1, S, 0, H, SOLID ];

// 22 NW
dtd[ 92 ] = [ 1, H, 0, 0, SOLID ];
dtd[ 80 ] = [ 1, 1, 0, H, SOLID ];

// 45 NW
dtd[ 90 ] = [ 1, H, H, 0, SOLID ];
dtd[ 79 ] = [ H, 1, 0, H, SOLID ];

// 67 NW
dtd[ 85 ] = [ 1, H, Q, 0, SOLID ];
dtd[ 74 ] = [ Q, 1, P, 0, SOLID ];
dtd[ 63 ] = [ P, 1, 0, H, SOLID ];

// 75 NW
dtd[ 140 ] = [ 1, H, S, 0, SOLID ];
dtd[ 129 ] = [ S, 1, H, 0, SOLID ];
dtd[ 118 ] = [ H, 1, R, 0, SOLID ];
dtd[ 107 ] = [ R, 1, 0, H, SOLID ];

// 15 SW
dtd[ 128 ] = [ 1, H, 0, S, SOLID ];
dtd[ 127 ] = [ 1, S, H, 1, SOLID ];
dtd[ 138 ] = [ H, 0, 0, R, SOLID ];
dtd[ 137 ] = [ 1, R, 0, H, SOLID ];

// 22 SW
dtd[ 125 ] = [ 1, H, 0, 1, SOLID ];
dtd[ 135 ] = [ 1, 0, 0, H, SOLID ];

// 45 SW
dtd[ 123 ] = [ 1, H, H, 1, SOLID ];
dtd[ 134 ] = [ H, 0, 0, H, SOLID ];

// 67 SW
dtd[ 64 ] = [ 1, H, Q, 1, SOLID ];
dtd[ 75 ] = [ Q, 0, P, 1, SOLID ];
dtd[ 86 ] = [ P, 0, 0, H, SOLID ];

// 75 SW
dtd[ 108 ] = [ 1, H, S, 1, SOLID ];
dtd[ 119 ] = [ S, 0, H, 1, SOLID ];
dtd[ 130 ] = [ H, 0, R, 1, SOLID ];
dtd[ 141 ] = [ R, 0, 0, H, SOLID ];

});
