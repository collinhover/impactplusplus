/**
 * Simple torch that gives off a glow.
 */
ig.module(
	'game.entities.torch'
)
.requires(
    // note that anything in abstractities
    // is an abstract entity that needs to be extended
	'plusplus.abstractities.character',
	// require the glow ability
	// lets see some lights!
	'plusplus.abilities.glow',
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
		
	ig.EntityTorch = ig.global.EntityTorch = ig.Character.extend({
		
		size: {x: 8, y: 8},
		
		// torches don't need to collide
		
		collides: ig.Entity.COLLIDES.NONE,
		
		// torches don't move or update
		
		performance: _c.STATIC,
		
		animSheet: new ig.AnimationSheet( 'media/torch.png', 8, 8 ),
		
		// animations the Impact++ way
		
		animSettings: {
			idle: {
				frameTime: 1,
				sequence: [0]
			},
			on: {
				frameTime: 0.1,
				sequence: [1,2]
			}
		},
		
		// torches never die
		
		invulnerable: true,
		
		// settings for glow
		
		glowSettings: {
			sizeMod: 12,
			// these directly correlate
			// to ig.Entity light properties
			light: {
				r: 1,
				g: 0.85,
				b: 0.7,
				// cast shadows only on static entities
				castsShadows: true
			}
		},
		
		// use this method to add properties
		// that need to be initialized one time
		// before the entity is added to the game
		
		initProperties: function () {
			
			this.parent();
			
			this.abilities.addDescendant( new ig.TorchGlow( this ) );
			
		}
		
	});
	
	/**
	 * Ability for glowing like a torch. This should probably have its own module!
	 **/
	ig.TorchGlow = ig.AbilityGlow.extend( {
		
		activate: function () {
			
			this.entity.animOverride( "on", { loop: true } );
			
			this.parent();
			
		},
		
		deactivate: function () {
			
			if ( this.entity.anims.on && this.entity.currentAnim === this.entity.anims.on ) {
				
				this.entity.animRelease();
			
			}
			
			this.parent();
			
		}
		
	} );

});