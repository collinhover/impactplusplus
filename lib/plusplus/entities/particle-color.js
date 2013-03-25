/**
 * Entity particle colored.
 * @extends ig.EntityParticle
 * @author Collin Hover - collinhover.com
 * @author Jesse Freeman
 **/
ig.module(
	'game.entities.particle-color'
)
.requires(
	'game.entities.particle',
	'game.helpers.utilsvector2'
)
.defines(function(){ "use strict";

var _utv2 = ig.utilsvector2;

ig.global.EntityParticleColor = ig.EntityParticleColor = ig.EntityParticle.extend({
	
	// base particle sprite sheet courtesy of Jesse Freeman
	
	animSheet: new ig.AnimationSheet( 'media/particles.png', 2, 2 ),
	size: _utv2.vector( 2, 2 ),
	
	vel:  _utv2.vector( 50, 50 ),
	
	// where to start color in particle sheet
	
	colorOffset: 0,
	
	// how many colors to pick from offset
	
	colorRange: 7,
		
	init: function() {
		
		this.parent.apply( this, arguments );
		
		var colorFrame = Math.round( Math.random() * this.colorRange ) + ( this.colorOffset * ( this.colorRange + 1 ) );
		
		this.addAnim( 'idle', 0.2, [ colorFrame ] );
		
	}
	
} );

ig.EntityParticleColor.colorOffsets = {
	RED: 0,
	YELLOW: 4,
	GREEN: 8,
	BLUE: 12,
	PURPLE: 16,
	BROWN: 20,
	GREY: 24,
	WHITE: 28
};

} );