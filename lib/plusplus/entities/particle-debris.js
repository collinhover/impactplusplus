/**
 * Entity particle debris.
 * @extends ig.EntityParticle
 * @author Collin Hover - collinhover.com
 * @author Dominic Szablewski
 **/
ig.module(
	'game.entities.particle-debris'
)
.requires(
	'game.entities.particle',
	'game.helpers.utilsvector2'
)
.defines(function(){ "use strict";

var _utv2 = ig.utilsvector2;

ig.global.EntityParticleDebris = ig.EntityParticleDebris = ig.EntityParticle.extend({
	
	collides: ig.Entity.COLLIDES.LITE,
	
	animSheet: new ig.AnimationSheet( 'media/debris.png', 4, 4 ),
	size: _utv2.vector( 4, 4 ),
	
	vel:  _utv2.vector( 60, 10 ),
	
	lifetime: 5,
		
	init: function() {
		
		this.addAnim( 'idle', 5, [ 0,1,2,3,4,5,6,7,8,9,10,11,12,13,14 ] );	
		
		this.parent.apply( this, arguments );
		
	}
	
} );

} );