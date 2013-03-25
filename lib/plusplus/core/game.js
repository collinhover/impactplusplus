/**
 * Game module.
 * Includes (modified) Impact Layers plugin by Amadeus - https://github.com/amadeus/impact-layers
 * @extends ig.Game
 * @author Collin Hover - collinhover.com
 **/
ig.module(
	'game.core.game'
).requires(
	'impact.game',
    'game.core.shared',
	'game.core.background-map',
	'game.core.collision-map',
	'game.core.animation',
	'game.core.camera',
    'game.core.entity',
	'game.helpers.utils',
	'game.helpers.utilstile',
	'game.shapes.shape-solid',
	'game.shapes.shape-edge',
	'game.shapes.shape-climbable',
    'game.extras.tweens',
	'game.entities.light'
)
.defines(function(){'use strict';

var _s = ig.shared;
var _ut = ig.utils;
var _utt = ig.utilstile;

ig.GameExtended = ig.Game.extend({
	
	gravity: 400,
    
	// camera for screen control
	
	camera: new ig.Camera(),
	
	// default group of layers
	
	layerOrder: [],

	// all renderable layers
	
	layers: {},
	
	// default entities layer name
	
	layerEntitiesName: 'entities',
	
	// do not modify
	
	lights: [],
	
	readyLevel: false,
	
	dirtyEntities: true,
	dirtyLights: true,
	
	changedEntities: false,
	changedLights: false,
	
	layerProperties: [],
	layersToRemove: [],
	
	itemsToAdd: [],
	itemsAttemptedToAddDuringDeferred: [],
	addingDeferred: false,
	
	itemsToRemove: [],
	itemsAttemptedToRemoveDuringDeferred: [],
	removingDeferred: false,

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
		
		// resize canvas
		
		ig.global.addEventListener( 'resize', _ut.debounce( this.resize.bind( this ), 500 ), false );
		this.resize();
		
	},
	
	/**
	 * Loads a level.
	 * @param {Object} level data.
	 **/
	loadLevel: function(data) {
        
		var ent, ld, newMap, layer, layerName;
		var i, il, j, jl, items;
		
		// reset
		
		this.camera.reset();
		this.readyLevel = false;
        
		// handle layers
        
		for ( i = 0, il = this.layerOrder.length; i < il; i++) {
			
			layerName = this.layerOrder[ i ];
			layer = this.layers[layerName];
            
			if (layer.clearOnLoad) {
				layer.items.length = 0;
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
            
			if( ld.name === 'collision' ) {
                
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
		
		// create shapes
		
		this.createShapes();
		
		// add all spawned entities immediately
		
		this.addDeferredItems();
		
		// get reference to player
		
		this.player = this.getEntitiesByType( ig.EntityPlayer )[0];
		
		// setup camera
		
		this.camera.follow( this.player );
		
		// level ready
		
		this.readyLevel = true;
		
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
		
		this.dirtyEntities = this.dirtyLights = true;
        
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
				
				this.spawnEntity( ig.EntityShapeEdge, shape.x, shape.y, shape.settings );
				
			}
			
			// one-way shapes
			
			for( j = 0, jl = shapes.oneWays.length; j < jl; j++ ) {
				
				var shape = shapes.oneWays[ j ];
				
				this.spawnEntity( ig.EntityShapeSolid, shape.x, shape.y, shape.settings );
				
			}
			
			// climbable shapes
			
			for( j = 0, jl = shapes.climbables.length; j < jl; j++ ) {
				
				var shape = shapes.climbables[ j ];
				
				this.spawnEntity( ig.EntityShapeClimbable, shape.x, shape.y, shape.settings );
				
			}
			
		}
		
	},
	
	/**
	 * Creates a layer and adds it to the list.
	 * @param {String} name of layer.
	 * @param {Object} properties of layer.
	 **/
	createLayer: function( name, properties ){
		
		var layer = this.layers[name] = ig.merge(this.layers[name] || {}, properties);
		
		layer.items = layer.items || [];
		layer.itemsOpaque = layer.itemsOpaque || [];
		layer.itemsLight = layer.itemsLight || [];
		
		this.layerOrder.push(name);
		
		return layer;
		
	},
	
	/**
	 * Deferred removal of layer.
	 * @param {String} name of layer.
	 **/
	removeLayer: function(name){
		
		this.layersToRemove.push(name);
		
	},
	
	/**
	 * Removes all deferred layers immediately.
	 * It is not recommended to call this function.
	 **/
	removeDeferredLayers: function () {
		
		if ( this.layersToRemove.length > 0 ) {
			
			for( var i = 0, il = this.layersToRemove.length; i < il; i++ ) {
				
				var layerName = this.layersToRemove[ i ];
				var layer = this.layers[layerName];
				
				if ( !layer ) continue;
				
				if ( layer.clean ) {
					
					this.itemsToRemove = this.itemsToRemove.concat(layer.items);
					
				}
				
				delete this.layers[layerName];
				
			}
			
			this.layersToRemove.length = 0;
			
		}
		
	},
	
	/**
	 * Sets deferred properties of a layer.
	 * @param {String} name of layer.
	 * @param {Object} properties to change.
	 **/
	setLayerProperties: function ( layerName, properties ) {
		
		this.layerProperties.push( [layerName, properties] );
		
	},
	
	/**
	 * Sets sorting order of layers.
	 * @param {Array} layer order.
	 **/
	setLayerSort: function ( order ) {
		
		this._layerOrder = ( order && order.length ) ? order : [];
		
	},
	
	/**
	 * Spawns an entity of type.
	 * @param {Type|Entity} entity type or an entity.
	 * @param {Number} x position.
	 * @param {Number} y position.
	 * @param {Object} settings for entity.
	 * @returns {Entity} created entity.
	 **/
	spawnEntity: function( type, x, y, settings ) {
		
		var EntityClass = typeof type === 'string' ? ig[type] || ig.global[type] : type;
		
		if ( !EntityClass ) {
			throw new Error( "Can't spawn entity of type: " + type);
		}
		// if type is original entity, swap with extended entity
		// this is done to ensure stability
		else if ( type === 'Entity' ) {
			EntityClass = ig.EntityExtended;
		}
		
		// in case EntityClass is an instance of an Entity already
		// this allows us to spawn entities that already exist
		
		var entity;
		
		if ( EntityClass instanceof ig.EntityExtended ) {
			
			// kill entity to be safe before we add again
			
			if ( !entity._killed ) {
				
				entity.kill();
				
			}
			
			entity.reset( x, y, settings );
			
		}
		else {
			
			entity = new (EntityClass)(x, y, settings || {});
			
		}
			
		// Push entity into appropriate layer
		
		this.addItem( entity );
		
		if ( entity.name ) this.namedEntities[ entity.name ] = entity;
		
		return entity;
		
	},
    
	/**
	 * Removes an entity.
	 * @param {Entity} entity.
	 **/
	removeEntity: function ( entity ) {
		
		this.removeItem( entity );
		
		if ( entity.name ) delete this.namedEntities[ entity.name ];
		
		entity._killed = true;
		entity.type = ig.Entity.TYPE.NONE;
		entity.checkAgainst = ig.Entity.TYPE.NONE;
		entity.collides = ig.Entity.COLLIDES.NEVER;
		
	},
	
	/**
	 * Deferred add of an item to a layer.
	 * @param {Item} item to add.
	 * @param {String} name of layer.
	 **/
	addItem: function ( item, layerName ) {
		
		var data = { item: item, layerName: layerName };
		
		// this seems silly but we need to watch for items during the deferred call
		
		if ( this.addingDeferred ) {
			
			this.itemsAttemptedToAddDuringDeferred.push( data );
			
		}
		else {
			
			this.itemsToAdd.push( data );
			
		}
		
	},
	
	/**
	 * Adds all deferred items immediately.
	 * It is not recommended to call this function.
	 **/
	addDeferredItems: function () {
		
		if ( this.itemsToAdd.length > 0 ) {
			
			this.addingDeferred = true;
			this.dirtyEntities = true;
			
			for( var i = 0, il = this.itemsToAdd.length; i < il; i++ ) {
				
				var data = this.itemsToAdd[ i ];
				var item = data.item;
				item.layerName = data.layerName || item.layerName;
				
				// check layer
				
				var layer = this.layers[ item.layerName ];
				if ( !layer ) throw new Error('Attempting to add to a layer that doesn\'t exist: ' + layerName);
				
				// add to lists
				
				layer.items.push(item);
				
				if ( item.opaque && !( item instanceof ig.EntityLight ) ) {
					
					layer.itemsOpaque.push( item );
					
				}
				
				if ( item instanceof ig.EntityLight ) {
					
					layer.itemsLight.push( item );
					
					this.dirtyLights = true;
					
				}
		
				// if spawning after level ready, trigger ready immediately
				
				if ( item.ready && this.readyLevel ) {
					
					item.ready();
				
				}
				
				
			}
			
			this.itemsToAdd.length = 0;
			this.addingDeferred = false;
			
			if ( this.itemsAttemptedToAddDuringDeferred.length > 0 ) {
				
				Array.prototype.push.apply( this.itemsToAdd, this.itemsAttemptedToAddDuringDeferred );
				this.itemsAttemptedToAddDuringDeferred.length = 0;
				
			}
			
		}
		
	},
	
	/**
	 * Deferred removal of item.
	 * @param {Item} item to remove.
	 * @param {String} name of layer to remove from. Use this if you need to swap items between layers.
	 **/
	removeItem: function( item, layerName ) {
		
		var data = { item: item, layerName: layerName };
		
		// this seems silly but we need to watch for items during the deferred call
		
		if ( this.removingDeferred ) {
			
			this.itemsAttemptedToRemoveDuringDeferred.push( data );
			
		}
		else {
			
			this.itemsToRemove.push( data );
			
		}
		
	},
	
	/**
	 * Removes all deferred items immediately.
	 * It is not recommended to call this function.
	 **/
	removeDeferredItems: function () {
		
		if ( this.itemsToRemove.length > 0 ) {
			
			this.removingDeferred = true;
			
			this.dirtyEntities = true;
			
			for( var i = 0, il = this.itemsToRemove.length; i < il; i++ ) {
				
				var data = this.itemsToRemove[ i ];
				var item = data.item
				var layer = this.layers[ data.layerName || item.layerName ];
				
				if ( item.cleanup ) {
					
					item.cleanup();
					
				}
				
				// remove from item lists
				
				if ( layer ) {
					
					_ut.arrayCautiousRemove( layer.items, item );
					
					if ( item.opaque ) {
						
						_ut.arrayCautiousRemove( layer.itemsOpaque, item );
						
					}
					
					if ( item instanceof ig.EntityLight ) {
						
						_ut.arrayCautiousRemove( layer.itemsLight, item );
						
						this.dirtyLights = true;
						
					}
					
				}
				
			}
			
			this.itemsToRemove.length = 0;
			this.removingDeferred = false;
			
			if ( this.itemsAttemptedToRemoveDuringDeferred.length > 0 ) {
				
				Array.prototype.push.apply( this.itemsToRemove, this.itemsAttemptedToRemoveDuringDeferred );
				this.itemsAttemptedToRemoveDuringDeferred.length = 0;
				
			}
			
		}
		
	},
	
	/**
	 * Sort of entities, sorting all layers if no layer name passed.
	 * @param {Name} (optional) layer name.
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
		
	},
	
	/**
	 * Sort of entities on a specific layer.
	 * @param {Name} layer name.
	 **/
	sortEntitiesOnLayer: function( layerName ) {
		
		var layer = this.layers[ layerName || this.layerEntitiesName ];
		
		if ( layer ) {
			
			layer.items.sort(layer.sortBy);
			
		}
		
	},
	
	/**
	 * Deferred sort of entities, sorting all layers if no layer name passed.
	 * @param {Name} (optional) layer name.
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
		
	},
	
	/**
	 * Deferred sort of entities on a specific layer.
	 * @param {Name} layer name.
	 **/
	sortEntitiesOnLayerDeferred: function ( layerName ) {
		
		layerName = layerName || this.layerEntitiesName;
		
		if ( layer ) {
			
			this.layer[ layerName ]._doSortEntities = true;
			
		}
		
	},
	
	/**
	 * Update entities in layer.
	 * @param {Name} layer name.
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
		
	},
	
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
	 * Updates all layers and items (entities), loads deferred, and removes deferred.
	 **/
	update: function(){
		
		var i, il, j, jl;
		var layerName, layer;
		var items, item;
		var index, tileset, anims;

		// Set any deferred layer properties
		if ( this.layerProperties.length > 0 ) {
			
			for( i = 0, il = this.layerProperties.length; i < il; i++ ) {
				layer = this.layerProperties[ i ];
				ig.merge( this.layers[ layer[0] ], layer[1] );
			}
			
			this.layerProperties.length = 0;
			
		}
		
		// handle deferred
		
		this.removeDeferredLayers();
		
		this.removeDeferredItems();
		
		this.addDeferredItems();
		
		// Update new layer order
		if (this._layerOrder) {
			
			this.layerOrder = this._layerOrder;
			delete this._layerOrder;
			
		}

		// load new level
		if ( this._levelToLoad ) {
			
			this.loadLevel( this._levelToLoad );
			delete this._levelToLoad;
			
		}
		
		// gather all entities and lights from entity layers into game.entities for compatibility
		
		if ( this.dirtyEntities !== false ) {
			
			this.entities.length = this.lights.length = 0;
			
			for ( i = 0, il = this.layerOrder.length; i < il; i++) {
				
				layerName = this.layerOrder[ i ];
				layer = this.layers[layerName];
				
				if ( layer.entityLayer ) {
					
					this.entities = this.entities.concat( layer.items );
					this.lights = this.lights.concat( layer.itemsLight );
					
				}
				
			}
			
		}
        
		// update tweens
		
		ig.tweens.update();
		
		// execute update and associated functions for all applicable layers
		
		this.changedEntities = this.changedLights = false;
		
        for ( i = 0, il = this.layerOrder.length; i < il; i++) {
            
			layerName = this.layerOrder[ i ];
			layer = this.layers[layerName];
			items = layer.items;
            
			if ( layer.noUpdate ) continue;
			
			if ( layer.entityLayer ) {
				
				// sort
                
                if (layer._doSortEntities || layer.autoSort) {
					
                    items.sort(layer.sortBy || this.sortBy);
                    layer._doSortEntities = false;
					
                }
				
				// check layer entities for collisions
				
				this.checkEntities( layer );
                
			}
            
            // update items
			
			layer.changed = false;
            
			for (j = 0, jl = items.length; j < jl; j++) {
				
				item = items[ j ];
				
				item.update();
				
				if ( item.changed ) {
					
					layer.changed = true;
					
					if ( item instanceof ig.EntityLight ) {
						
						this.changedLights = true;
						
					}
					
				}
				
			}
			
			this.changedEntities |= layer.changed;
            
		}

		// background animations
		
		for (tileset in this.backgroundAnims) {
			
			anims = this.backgroundAnims[tileset];
			
			for (x in anims) {
				
				anims[x].update();
				
			}
			
		}
		
		// camera
		
		this.camera.update();
		
		// clean
		
		this.dirtyEntities = this.dirtyLights = false;
		
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
			
			items = layer.items;
			
			for ( j = 0, jl = items.length; j < jl; j++ ) {
				
				items[ j ].draw();
				
			}
			
			if ( layer.debugPhysics ) {
				
				layer.debugPhysics.draw();
				
			}
			
		}
		
		// camera
		
		this.camera.draw();
		
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
		
		ig.system.resize( ig.global.innerWidth * _s.canvasWidthPct * ( 1 / _s.SCALE ), ig.global.innerHeight * _s.canvasHeightPct * ( 1 / _s.SCALE ), _s.SCALE );
		
		this.camera.resize();
		
	}
	
});

// override merge to handle true / false values converted to string by weltmeister

ig.merge = function( original, extended ) {
	for( var key in extended ) {
		var ext = extended[key];
		if(
			typeof(ext) != 'object' ||
			ext instanceof HTMLElement ||
			ext instanceof ig.Class
		) {
			
			// ugly, perhaps there is a better way?
			
			if ( typeof ext === 'string' ) {
				
				if ( ext === 'true' ) {
					
					ext = true;
					
				}
				else if ( ext === 'false' ) {
					
					ext = false;
					
				}
				
			}
			
			original[key] = ext;
		}
		else {
			if( !original[key] || typeof(original[key]) != 'object' ) {
				original[key] = (ext instanceof Array) ? [] : {};
			}
			ig.merge( original[key], ext );
		}
	}
	return original;
};

});
