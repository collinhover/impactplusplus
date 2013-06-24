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
	// require the projectile for the grenade
	'plusplus.abstractities.projectile',
	// and an explosion for fun
	'plusplus.entities.explosion',
	// require the shoot ability
	'plusplus.abilities.ability-shoot',
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
		
		size: {x: 8, y:14},
		offset: {x: 4, y: 2},
		
		health: 10,
		
		animSheet: new ig.AnimationSheet( _c.PATH_TO_MEDIA + 'player.png', 16, 16 ),	
		
		// animations the Impact++ way
		
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
				frameTime: 1, 
				sequence: [9]
			},
			fall: {
				frameTime: 0.4, 
				sequence: [6,7]
			}
		},
		
		// settings for glow
		
		glowSettings: {
			// these directly correlate
			// to ig.Entity light properties
			light: {
				// the light should move with player
				performance: _c.DYNAMIC,
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
			this.shoot = new ig.GrenadeLauncher( this );
			
			this.abilities.addDescendants( [ this.glow, this.shoot ]);
			
		},
		
		// use this method to change an entity internally
		
		updateChanges: function() {
			
			// check if shooting
			
			if (ig.input.pressed('shoot')) {

				this.shoot.execute( { x: this.flip ? this.bounds.minX : this.bounds.maxX, y: this.bounds.minY + this.bounds.height * 0.5 } );

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

	/**
	 * Projectile for player shoot ability that explodes. This should probably have its own module!
	 **/
	ig.EntitySlimeGrenade = ig.global.EntitySlimeGrenade = ig.Projectile.extend({
		
		// lite collides to get knocked around
		
		collides: ig.Entity.COLLIDES.LITE,
		
		size: {x: 4, y: 4},
		
		offset: {x: 2, y: 2},
			
		animSheet: new ig.AnimationSheet( _c.PATH_TO_MEDIA + 'slime-grenade.png', 8, 8 ),
		
		// animations the Impact++ way
		
		animSettings: {
			idle: {
				frameTime: 0.2,
				sequence: [0,1]
			}
		},
		
		damage: 10,
		
		// 2 second fuse!
		
		lifeDuration: 2,
		
		// less gravity
		
		gravityFactor: 0.5,
		
		// low friction
		
		friction: { x: 5, y: 0 },
		
		die: function () {
			
			if ( !this.dieingSilently ) {
				
				// EXPLOSIONS!
				
				ig.game.spawnEntity(ig.EntityExplosion, this.pos.x, this.pos.y, {
                    entity: this,
					spawnCountMax: 10,
					spawnSettings: {
						animTileOffset: ig.EntityParticleColor.colorOffsets.YELLOW
					}
                });
				
			}
			
			this.parent();
			
		}
		
	});
	
	/**
	 * Ability for shooting grenades. This should probably have its own module!
	 **/
	ig.GrenadeLauncher = ig.AbilityShoot.extend( {
	
		// this ability spawns a slime grenade
		
		spawningEntity: ig.EntitySlimeGrenade,
		
		// velocity towards offset direction
		
		offsetVelX: 200,
		offsetVelY: 200,
		
		// velocity relative to the entity using the ability
		// this helps for running and gunning
		
		relativeVelPctX: 1,
		relativeVelPctY: 0.5,
		
		// use this method to add types for checks
		// since we are using bitwise flags
		// we can take advantage of the fact that they can be added
		
		initTypes: function () {

			this.parent();

			_ut.addType(ig.Ability, this, 'type', "SPAMMABLE");

		}
		
	} );

});