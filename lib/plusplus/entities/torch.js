ig.module(
	'plusplus.entities.torch'
)
.requires(
	'plusplus.core.entity',
	'plusplus.helpers.utils',
	'plusplus.entities.light',
	'plusplus.abilities.ability'
)
.defines(function(){ "use strict";

var _u = ig.utils;

ig.global.EntityTorch = ig.EntityTorch = ig.EntityExtended.extend( {
    
    size: { x: 8, y: 8 },
	
	animSheet: new ig.AnimationSheet( 'media/torch.png', 8, 8 ),
	
	lightR: 1,
	lightG: 1,
	lightB: 1,
	lightAlpha: 0.5,
	lightAlphaDuration: 125,
	lightRadiusMod: 10,
	
	init: function() {
		
		this.parent.apply( this, arguments );
		
		this.addAnim( 'dark', 1, [0] );
		this.addAnim( 'light', 0.2, [1,2] );
		
		this.abilities.addDescendants( [
			new ig.Ability( ig.Ability.TYPE.PRIMARY, this, {
				bindings: this.toggleGlow,
				bindingsCleanup: this.stopGlow
			} )
		] );
		
		this.abilities.execute();
		
	},
	
	toggleGlow: function ( entityOptions ) {
		
		// create new light as needed
		
		if ( !this.light ) {
			
			this.light = ig.game.spawnEntity( ig.EntityLight, this.getCenterX(), this.getCenterY(), {
				performance: ig.EntityLight.PERFORMANCE.DYNAMIC,
				radius: Math.max( this.getSizeX(), this.getSizeY() ) * 0.5 * entityOptions.lightRadiusMod,
				r: entityOptions.lightR,
				g: entityOptions.lightG,
				b: entityOptions.lightB,
				alpha: 0
			} );
			
			// light follows this automatically
			
			this.light.moveToEntity( this, true );
			
		}
		
		if ( this.glowing ) {
			
			entityOptions.stopGlow.apply( this, arguments );
			
		}
		else {
			
			this.glowing = true;
			
			// tween to target alpha
			
			this.lightTween = _u.tween(
				this.light,
				{ alpha: entityOptions.lightAlpha },
				{
					duration: entityOptions.lightAlphaDuration,
					tween: this.lightTween
				}
			);
			
			if ( this instanceof ig.EntityTorch ) {
				this.currentAnim = this.anims.light;
			}
			
		}
		
	},
	
	/**
	* Stops glowing and destroys light
	**/
	stopGlow: function ( entityOptions ) {
		
		var me = this;
		var light = this.light;
		
		// clean any properties added
		
		delete this.glowing;
		delete this.light;
		
		if ( light ) {
			
			// tween out and remove when complete
			
			var lightTween = _u.tween(
				light,
				{ alpha: 0 },
				{
					tween: this.lightTween,
					duration: entityOptions.lightAlphaDuration,
					onComplete: function () {
						
						ig.game.removeEntity( light );
						
						if ( me instanceof ig.EntityTorch ) {
							me.currentAnim = me.anims.dark;
						}
						
					}
				}
			);
			
		}
		
	},
	
	update: function () {
		
		this.parent();
		
		// glow if not glowing
		
		if ( Math.random() < 0.01 && ( !this.light || this.light.alpha === this.lightAlpha ) ) {
			
			this.abilities.getDescendantByName( ig.Ability.TYPE.PRIMARY ).execute();
			
		}
		
	}
    
} );

} );