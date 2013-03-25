/**
 * Entity that acts as a death for another entity. This allows us to remove the original entity immediately but still show death.
 * @extends ig.EntityExtended
 * @author Collin Hover - collinhover.com
 **/
ig.module(
	'game.entities.death'
)
.requires(
	'game.core.entity',
	'game.entities.spawner-color',
	'game.helpers.utilsvector2'
)
.defines(function(){ "use strict";

var _utv2 = ig.utilsvector2;

ig.global.EntityDeath = ig.EntityDeath = ig.EntityExtended.extend( {
	
	/**
	 * See ig.EntityExtended
	 **/
	init: function () {
		
		this.parent.apply( this, arguments );
		
		// copy some of entity properties
		
		_utv2.copy( this.offset, this.entity.offset );
		
	},
	
	/**
	 * See ig.EntityExtended
	 **/
	ready: function () {
		
		this.parent.apply( this, arguments );
		
		// play death animation
		
		if ( this.entity.anims && this.entity.anims.death ) {
			
			this.currentAnim = this.entity.anims.death;
			this.currentAnim.oneComplete = this.activate.bind( this );
			this.currentAnim.gotoFrame( 0 );
			
		}
		// has no death animation, skip to activate
		else {
			
			this.activate();
			
		}
		
	},
	
	activate: function () {
		
		// explode
		
		if ( this.entity.explodingDeath ) {
			
			var settings = {
				size: this.entity.size,
				offset: this.entity.offset, 
				duration: 0
			};
			
			if ( this.entity.explodeCount ) {
				
				settings.spawnCount = this.entity.explodeCount;
				
			}
			
			if ( this.entity.explodeVel ) {
				
				settings.vel = this.entity.explodeVel;
				
			}
			
			if ( this.entity.explodeColorOffset ) {
				
				settings.colorOffset = this.entity.explodeColorOffset;
				
			}
			
			var explosion = ig.game.spawnEntity( ig.EntitySpawnerColor, this.entity.pos.x, this.entity.pos.y, settings );
			
			explosion.activate();
			
		}
		
		// kill
		
		this.kill();
		
	}
	
} );

} );