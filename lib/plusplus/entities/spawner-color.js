/**
 * Entity that creates colored particles randomly within its bounds when activated.
 * @extends ig.EntitySpawner
 * @author Collin Hover - collinhover.com
 **/
ig.module(
	'game.entities.spawner-color'
)
.requires(
	'game.entities.spawner-particle',
	'game.entities.particle-color'
)
.defines(function(){ "use strict";

ig.global.EntitySpawnerColor = ig.EntitySpawnerColor = ig.EntitySpawnerParticle.extend({
	
	spawningEntity: 'EntityParticleColor',
	
	/**
	 * See ig.Spawner
	 **/
	getSpawnSettings: function ( settings ) {
		
		settings = this.parent.apply( this, arguments );
		
		// attempt to set particle color
		
		if ( this.colorOffset ) {
			
			settings.colorOffset = this.colorOffset;
			
		}
		
		if ( this.colorRange ) {
			
			settings.colorRange = this.colorRange;
			
		}
		
		return settings;
		
	}
	
});

} );