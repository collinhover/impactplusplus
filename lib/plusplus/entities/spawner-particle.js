/**
 * Entity that creates particles randomly when activated.
 * @extends ig.EntitySpawner
 * @author Collin Hover - collinhover.com
 **/
ig.module(
	'game.entities.spawner-particle'
)
.requires(
	'game.entities.spawner'
)
.defines(function(){ "use strict";

ig.global.EntitySpawnerParticle = ig.EntitySpawnerParticle = ig.EntitySpawner.extend({
	
	spawnCount: 20,
	
	/**
	 * See ig.Spawner
	 **/
	getSpawnSettings: function ( settings ) {
		
		settings = this.parent.apply( this, arguments );
		
		// attempt to set particle life
		
		if ( this.lifetime ) {
			
			settings.lifetime = this.lifetime;
			
		}
		
		if ( this.fadetime ) {
			
			settings.fadetime = this.fadetime;
			
		}
		
		return settings;
		
	}
	
});

} );