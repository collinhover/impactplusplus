/**
 * Entity that creates debris randomly within its bounds when activated.
 * @extends ig.EntitySpawnerParticle
 * @author Collin Hover - collinhover.com
 **/
ig.module(
	'plusplus.entities.spawner-debris'
)
.requires(
	'plusplus.entities.spawner-particle',
	'plusplus.entities.particle-debris'
)
.defines(function(){ "use strict";

ig.global.EntitySpawnerDebris = ig.EntitySpawnerDebris = ig.EntitySpawnerParticle.extend({
	
	spawningEntity: 'EntityParticleDebris'
	
});

} );