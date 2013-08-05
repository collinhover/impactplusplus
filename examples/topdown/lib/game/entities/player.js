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
		
		size: {x: 16, y: 16},
		offset: {x: 0, y: 0},
        direction: 'right',

		health: 10,
		
		animSheet: new ig.AnimationSheet( _c.PATH_TO_MEDIA + 'player.png', 16, 16 ),
		
		// animations the Impact++ way
		
		animSettings: {
			moveX: {
				frameTime: 0.1,
				sequence: [3,4,5]
			},
			moveUp: {
				frameTime: 0.1,
				sequence: [6,7,8]
			},
			moveDown: {
				frameTime: 0.1,
				sequence: [0,1,2]
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
			this.shoot = new ig.GrenadeLauncher( this );
			
			this.abilities.addDescendants( [ this.glow, this.shoot ]);
			
		},
		
		// use this method to change an entity internally
		
		updateChanges: function() {

            // quick & dirty direction check, y prioritizes over x as animations are also handled in this manner for diagonal movement.

            if (this.vel.y < 0) {

                this.direction = 'up';

            }
            else if (this.vel.y > 0) {

                this.direction = 'down';

            }
            else if (this.vel.x < 0) {

                this.direction = 'left';

            }
            else if (this.vel.x > 0) {

                this.direction = 'right';

            }

			// check if shooting

			if (ig.input.pressed('shoot')) {

                // set the offset according to direction

                var xOff;
                var yOff;

                switch (this.direction) {
                    case 'up':
                        xOff = this.bounds.minX + this.bounds.width * 0.5;
                        yOff = this.bounds.minY;
                        break;
                    case 'down':
                        xOff = this.bounds.minX + this.bounds.width * 0.5;
                        yOff = this.bounds.maxY;
                        break;
                    case 'left':
                        xOff = this.bounds.minX;
                        yOff = this.bounds.minY + this.bounds.height * 0.5;
                        break;
                    case 'right':
                        xOff = this.bounds.maxX;
                        yOff = this.bounds.minY + this.bounds.height * 0.5;
                        break;
                }
				this.shoot.execute( { x: xOff, y: yOff } );

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

		friction: { x: 5, y: 5 },

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
		relativeVelPctY: 1,

		// use this method to add types for checks
		// since we are using bitwise flags
		// we can take advantage of the fact that they can be added
		
		initTypes: function () {

			this.parent();

			_ut.addType(ig.Ability, this, 'type', "SPAMMABLE");

		}
		
	} );

});