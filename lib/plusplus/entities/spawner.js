 /**
 * Entity that spawns entities on activation.
 * @extends ig.EntityTrigger
 * @author Collin Hover - collinhover.com
 * @author Jesse Freeman
 **/
ig.module(
    'game.entities.spawner'
)
.requires(
	'game.entities.trigger'
)
.defines( function () { "use strict";

ig.global.EntitySpawner = ig.EntitySpawner = ig.EntityTrigger.extend( {
	
	// editor properties
	
	_wmBoxColor: 'rgba(255, 170, 66, 0.7)',
	
	size:{x:8, y:8},
	
	// duration in seconds over which to spawn
	// set to 0 for instant emit of entire count
	// set to -1 for endless emit
	
	duration: 1,
	
	// total number of entities to spawn over duration
	
	spawnCount: 1,
	
	// delay between spawns
	// -1 will cause spawner to find delay based on duration
	
	spawnDelay: -1,
	
	// whether to spawn randomly within this entity's bounds
	
	spawnRandomLocation: true,
	
	// whether to kill all spawned entities upon this entity's death
	
	spawnedDieWith: false,
	
	// do not modify
	
	spawning: false,
	durationTimer: null,
	nextSpawn: null,
	pool: [],
	instances: [],
	
	/**
	 * See ig.EntityExtended.
	 **/
	init: function() {
		
		this.parent.apply( this, arguments );
		
		this.durationTimer = new ig.Timer();
		this.nextSpawn = new ig.Timer();
		
	},
	
	/**
	 * See ig.EntityExtended.
	 **/
	activate: function( entity, trigger ) {
		
		if ( this.spawning !== true ) {
			
			this.spawning = true;
			
			// all instantly
			if ( this.duration === 0 ) {
				
				for ( var i = 0; i < this.spawnCount; i++ ) {
					
					this.spawnNext();
					
				}
				
			}
			// over duration
			else {
				
				// calculate delay if not endless and delay not set
				if ( this.spawnDelay < 0 && this.duration !== -1 ) {
					
					this.spawnDelay = this.duration / this.spawnCount;
					
				}
				
				this.durationTimer.set( this.duration );
				this.nextSpawn.set( 0 );
				
			}
			
		}
		
	},
	
	/**
	 * Spawns next instance of spawning entity if possible, with pooling by Jesse Freeman.
	 **/
	spawnNext: function () {
		
		var instance;
		var x, y;
		
		if ( this.spawnRandomLocation ) {
			
			x = Math.random().map( 0, 1, this.bounds.minX, this.bounds.maxX );
			y = Math.random().map( 0, 1, this.bounds.minY, this.bounds.maxY );
			
		}
		else {
			
			x = this.getCenterX();
			y = this.getCenterY();
			
		}
		
		var settings = this.getSpawnSettings();
		
		// attempt to use pool first
		
		if ( this.pool.length > 0 ) {
			
			instance = this.pool.pop();
			
			if ( instance ) {
				
				instance = ig.game.spawnEntity( instance, x, y, settings );
				
			}
			
		}
		// create new until reached instance count
		else if ( this.instances.length < this.spawnCount ) {
			
			instance = ig.game.spawnEntity( this.spawningEntity, x, y, settings );
			
			this.instances.push( instance );
			
		}
		
		return instance;
		
	},
	
	/**
	 * Creates a settings object for spawning.
	 **/
	getSpawnSettings: function ( settings ) {
		
		settings = settings || {};
		
		settings.spawner = this;
		
		if ( this.vel ) {
			
			settings.vel = this.vel;
			
		}
		
		return settings;
		
	},
	
	/**
	 * Adds an entity back into the spawning pool.
	 **/
	unspawn: function ( entity ) {
		
		// normally, entity will be automatically unspawned after killed and right before final removal
		// but if unspawned requested before killed, we should kill and wait for auto unspawn
		
		if ( !entity._killed ) {
			
			entity.kill();
			
		}
		else {
			
			this.pool.push( entity );
			
		}
		
	},
	
	complete: function () {
		
		this.spawning = false;
		
		// kill if not endless
		
		if ( this.duration > -1 ) {
			
			this.kill();
				
		}
		
		// do callback
		
		if ( this.onComplete ) {
			
			this.onComplete();
			
		}
		
	},
	
	/**
	 * See ig.EntityExtended.
	 **/
	kill: function() {
		
		this.parent.apply( this, arguments );
		
		// update all instances
		
		for ( var i = 0; i < this.instances.length; i++ ) {
			
			var instance = this.instances[ i ];
			
			// remove spawner from instance so it doesn't attempt to unspawn
			
			delete instance.spawner;
			
			// kill instance if needed
			
			if ( this.spawnedDieWith ) {
				
				instance.kill();
				
			}
		
		}
		
		this.instances.length = 0;
		
	},
	
	/**
	 * See ig.EntityExtended.
	 **/
	update: function(){
		
		this.parent.apply( this, arguments );
		
		if( this.spawning && ( this.duration === 0 || this.nextSpawn.delta() >= 0 ) ) {
			
			this.nextSpawn.set( this.spawnDelay );
			this.spawnNext();
			
			if ( this.durationTimer.delta() >= 0 ) {
				
				this.complete();
				
			}
			
		}
		
	}
	
});

});

