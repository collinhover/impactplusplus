ig.module(
	'game.entities.spike'
)
.requires(
	'plusplus.core.config',
	'plusplus.abstractities.character',
	'plusplus.helpers.utils'
)
.defines(function(){
"use strict";

var _c = ig.CONFIG;
var _ut = ig.utils;
	
ig.EntitySpike = ig.global.EntitySpike = ig.Character.extend({
	
	size: {x: 16, y: 9},
	
	collides: ig.Entity.COLLIDES.PASSIVE,
	performance: _c.KINEMATIC,
	
	animSheet: new ig.AnimationSheet( 'media/spike.png', 16, 9 ),
	
	animSettings: {
		crawl: {
			frameTime: 0.08,
			sequence: [0,1,2]
		}
	},
	
	health: 10,
	
	deathSettings: {
		spawnCountMax: 3,
		spawnSettings: {
			animTileOffset: ig.EntityParticleColor.colorOffsets.RED
		}
	},
	
	_nearEdge: false,
	
	initTypes: function () {
		
		this.parent();
		
		_ut.addType(ig.EntityExtended, this, 'type', "DAMAGEABLE");
		_ut.addType(ig.EntityExtended, this, 'checkAgainst', "CHARACTER");
		
	},
	
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