/** 
 * Players might need some basic functionality
 * like input handling, camera following, etc
 * to take advantage of these extend ig.Player
 */
ig.module(
    'game.entities.player'
)
.requires(
    // note that anything in abstractities
    // is an abstract entity that needs to be extended
    'plusplus.abstractities.player',
	// require the shooting abilities
	'game.abilities.grenade-launcher',
	'game.abilities.laser-gun',
	// require the glow ability
	// lets see some lights!
	'plusplus.abilities.glow',
	// if you want to use the config
    // don't forget to require it
    'plusplus.core.config',
	// and some utils
	'plusplus.helpers.utils'
)
.defines(function () {
    "use strict";
	
	var _c = ig.CONFIG;
	var _ut = ig.utils;
	
    ig.EntityPlayer = ig.global.EntityPlayer = ig.Player.extend({
		
		size: _c.TOP_DOWN ? {x:8, y: 8} : {x: 8, y:14},
		offset: _c.TOP_DOWN ? {x:4, y: 4} :  {x: 4, y: 2},
		
		health: 10,
		
		animSheet: new ig.AnimationSheet( _c.PATH_TO_MEDIA + 'player.png', 16, 16 ),	
		
		// animations the Impact++ way
		// note that these animations are for
		// both side scrolling and top down mode
		// you will likely only need one or the other
		
		animInit: _c.TOP_DOWN ? "idle" : "moveX",
		
		animSettings: {
			idle: {
				frameTime: 1,
				sequence: [0]
			},
			run: {
				frameTime: 0.07, 
				sequence: [0,1,2,3,4,5]
			},
			jump: {
				frameTime: 0.1, 
				sequence: [8,9]
			},
			fall: {
				frameTime: 0.4, 
				sequence: [6,7]
			},
			moveX: {
				frameTime: 0.07, 
				sequence: [21,22,23,22]
			},
			moveY: {
				frameTime: 0.07, 
				sequence: [12,13,14,13]
			},
			moveDown: {
				frameTime: 0.07, 
				sequence: [12,13,14,13]
			},
			moveUp: {
				frameTime: 0.07, 
				sequence: [15,16,17,16]
			},
			shoot: {
				frameTime: 0.25, 
				sequence: [2]
			},
			shootX: {
				frameTime: 0.25, 
				sequence: [26]
			},
			shootY: {
				frameTime: 0.25, 
				sequence: [24]
			},
			shootDown: {
				frameTime: 0.25, 
				sequence: [24]
			},
			shootUp: {
				frameTime: 0.25, 
				sequence: [25]
			},
			death: {
				frameTime: 0.1, 
				sequence: [10,11]
			},
			deathX: {
				frameTime: 0.1, 
				sequence: [29]
			},
			deathY: {
				frameTime: 0.1, 
				sequence: [28]
			},
			deathDown: {
				frameTime: 0.1, 
				sequence: [28]
			},
			deathUp: {
				frameTime: 0.1, 
				sequence: [28]
			}
		},
		
		// settings for glow
		
		glowSettings: {
			// these directly correlate
			// to ig.Entity light properties
			light: {
				// the light should move with player
				performance: _c.MOVABLE,
				// cast shadows only on static entities
				castsShadows: true
			}
		},
		
		// use this method to add properties
		// that need to be initialized one time
		// before the entity is added to the game
		
		initProperties: function () {
			
			this.parent();
			
			this.glow = new ig.AbilityGlow( this );
			this.shoot = new ig.LaserGun( this );
			this.grenade = new ig.GrenadeLauncher( this );
			
			this.abilities.addDescendants( [
				this.glow, this.shoot, this.grenade
			]);
			
		},
		
		// use this method to change an entity internally
		
		updateChanges: function() {
				
			var shootX;
			var shootY;
			
			// check if shooting
			
			if (ig.input.pressed('shoot')) {
				
				if ( _c.TOP_DOWN ) {
					
					if ( this.facing.x !== 0 ) {
						
						shootX = this.facing.x > 0 ? this.pos.x + this.size.x : this.pos.x;
						
					}
					else {
						
						shootX = this.pos.x + this.size.x * 0.5;
						
					}
					
					if ( this.facing.y !== 0 ) {
						
						shootY = this.facing.y > 0 ? this.pos.y + this.size.y : this.pos.y;
						
					}
					else {
						
						shootY = this.pos.y + this.size.y * 0.5;
						
					}
					
				}
				else {
					
					shootX = this.flip.x ? this.pos.x : this.pos.x + this.size.x;
					shootY = this.pos.y + this.size.y * 0.5;
					
				}
				
				this.shoot.execute( {
					x: shootX,
					y: shootY
				} );

			}
			
			// check if grenading
			
			if (ig.input.pressed('grenade')) {
				
				if ( _c.TOP_DOWN ) {
					
					if ( this.facing.x !== 0 ) {
						
						shootX = this.facing.x > 0 ? this.pos.x + this.size.x : this.pos.x;
						
					}
					else {
						
						shootX = this.pos.x + this.size.x * 0.5;
						
					}
					
					if ( this.facing.y !== 0 ) {
						
						shootY = this.facing.y > 0 ? this.pos.y + this.size.y : this.pos.y;
						
					}
					else {
						
						shootY = this.pos.y + this.size.y * 0.5;
						
					}
					
				}
				else {
					
					shootX = this.flip.x ? this.pos.x : this.pos.x + this.size.x;
					shootY = this.pos.y + this.size.y * 0.5;
					
				}
				
				this.grenade.execute( {
					x: shootX,
					y: shootY
				} );

			}
			
			// swipe to jump
			
			if (ig.input.state('swipe')) {

				// find all inputs that are swiping

				var inputPoints = ig.input.getInputPoints([ 'swiping' ], [ true ]);

				for (var i = 0, il = inputPoints.length; i < il; i++) {

					var inputPoint = inputPoints[ i ];
					
					if (inputPoint.swipingUp) {

						this.jump();

					}

				}

			}
			
			this.parent();
			
		}
		
	});

});