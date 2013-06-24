/**
 * Simple spiky character that moves around a platform.
 */
ig.module(
	'game.entities.spike'
)
.requires(
    // note that anything in abstractities
    // is an abstract entity that needs to be extended
	'plusplus.abstractities.character',
	// if you want to use the config
    // don't forget to require it
    'plusplus.core.config',
	// and some utils
	'plusplus.helpers.utils'
)
.defines(function(){
	"use strict";

	var _c = ig.CONFIG;
	var _ut = ig.utils;
		
	ig.EntitySpike = ig.global.EntitySpike = ig.Character.extend({
		
		size: {x: 16, y: 9},
		
		// passive collide to get knocked around
		
		collides: ig.Entity.COLLIDES.PASSIVE,
		
		// full physics performance
		
		performance: _c.KINEMATIC,
		
		animSheet: new ig.AnimationSheet( 'media/spike.png', 16, 9 ),
		
		// animations the Impact++ way
		
		animSettings: {
			crawl: {
				frameTime: 0.08,
				sequence: [0,1,2]
			}
		},
		
		health: 10,
		
		// explode with a few red particles when killed
		
		deathSettings: {
			spawnCountMax: 3,
			spawnSettings: {
				animTileOffset: ig.EntityParticleColor.colorOffsets.RED
			}
		},
		
		_nearEdge: false,
		
		// use this method to add types for checks
		// since we are using bitwise flags
		// we can take advantage of the fact that they can be added
		
		initTypes: function () {
			
			this.parent();
			
			_ut.addType(ig.EntityExtended, this, 'type', "DAMAGEABLE");
			_ut.addType(ig.EntityExtended, this, 'checkAgainst', "CHARACTER");
			
		},
		
		// use this method to change an entity internally
		
		updateChanges: function() {
			
			// flip when near an edge
			
			var offset = ig.game.collisionMap.tilesize + this.vel.x * ig.system.tick + this.bounds.width * 0.5;
			var changed;
			
			if( !ig.game.collisionMap.getTile(
				( this.flip ? this.bounds.minX - offset : this.bounds.maxX + offset ),
				this.bounds.maxY + 1 )
			) {
				
				if ( !this._nearEdge ) {
					
					this.flip = !this.flip;
					
				}
				
				this._nearEdge = true;
				
			}
			else {
				
				this._nearEdge = false
				
			}
			
			var moveMod;
			
			if ( this._nearEdge ) {
				
				moveMod = 1;
				
			}
			else {
				
				moveMod = Math.random() * 0.25;
				
			}
			
			if ( moveMod <= 0.05 ) {
				
				this.moveToStop();
				
			}
			else if ( this.flip ) {
				
				this.moveToLeft( moveMod );
				
			}
			else {
				
				this.moveToRight( moveMod );
				
			}
			
			this.parent();
			
		},
		
		
		handleMovementTrace: function( res ) {
			
			this.parent( res );
			
			// flip when hitting a wall
			
			if( res.collision.x ) {
				
				this.flip = !this.flip;
				
			}
			
			
		},	
		
		check: function( entity ) {
			
			this.parent(entity);
			
			entity.receiveDamage( 10, this );
			
		}
		
	});

});