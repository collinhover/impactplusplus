/** 
 * Ghost is used to demo complex pathfinding.
 */
ig.module(
    'game.entities.ghost'
)
.requires(
    // note that anything in abstractities
    // is an abstract entity that needs to be extended
    'plusplus.abstractities.creature',
	// a melee ability
    'plusplus.abilities.melee',
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
	
    ig.EntityGhost = ig.global.EntityGhost = ig.Creature.extend({
		
		size: {x: 12, y: 12},
		offset: {x: 2, y: 2},
		
		// we are a ghost
		// ghosts don't collide
		
		collides: ig.EntityExtended.COLLIDES.NEVER,
		
		// animations the Impact++ way
		
		animSheet: new ig.AnimationSheet( _c.PATH_TO_MEDIA + 'ghost.png', 16, 16 ),	
		
		animInit: "idle",
		
		animSettings: {
			idle: {
				frameTime: 1, 
				sequence: [0]
			},
			move: {
				frameTime: 1, 
				sequence: [0]
			},
			melee: {
				frameTime: 0.1, 
				sequence: [3,3,3,2,1]
			}
		},
		
		// for the ghost we expect specific animations
		// so that we don't have to write every direction
		// into the animSettings
		
		animsExpected: [
			"idle",
			"move",
			"melee"
		],
		
		// don't flip y
		
		canFlipX: true,
		canFlipY: false,
		
		// ghost isn't affected by gravity
		
		gravityFactor: 0,
		
		// lets slow it downnnnnnn
		
		maxVelGrounded: { x: 25, y: 25 },
		maxVelUngrounded: { x: 25, y: 25 },
		frictionGrounded: { x: 800, y: 800 },
		frictionUngrounded: { x: 800, y: 800 },
		speed: { x: 100, y: 100 },
		
		// can't jump and climb
		
		canJump: false,
		canClimb: false,
		
		// can't be hurt or killed
		// except by instagib areas
		
		invulnerable: true,
		
		// after ghost has killed player
		// he likes to wander in all directions
		
		canWanderX: true,
		canWanderY: true,
		
		// instead of switching wander direction
		// when hitting a wall, lets switch at random also
		
		wanderSwitchChance: 0.005,
		wanderSwitchChanceStopped: 0.015,
		
		// don't wander too far away from tether
		
		tetherDistance: 50,
		
		// don't notice prey too far away
		
		reactionDistance: 75,
		
		// but once we've got the scent
		// follow prey beyond reaction distance
		
        moveToPreySettings: {
            searchDistance: 150
        },
		
		// use this method to add types for checks
		// since we are using bitwise flags
		// we can take advantage of the fact that they can be added
		
		initTypes: function () {
			
			this.parent();
			
			// ghosts are in enemy group and will not collide with or hurt other enemies
			
            _ut.addType(ig.EntityExtended, this, 'group', "ENEMY", "GROUP");
			
			// ghosts seeks friend group
			
			_ut.addType(ig.EntityExtended, this, 'preyGroup', "FRIEND", "GROUP");
			
		},
		
		// use this method to add properties
		// that need to be initialized one time
		// before the entity is added to the game
		
		initProperties: function () {

			this.parent();

			this.melee = new ig.AbilityMelee( this, {
				// target will be provided by attack method
				canFindTarget: false,
				// one shot kill player
				damage: 10,
				// shorter range than melee default
				// about half of character width
				rangeX: this.size.x * 0.5
			} );
			
			this.abilities.addDescendants( [
				this.melee
			]);
			
		},
		
		// when creatures are pursuing prey
		// they will try to attack
		
		attack : function( entity ){
		
			this.melee.setEntityTarget(entity);
			
			if ( this.melee.entityTarget ) {

				var closeEnough = this.melee.closeEnough();
				
				this.melee.activate();

				return closeEnough;
				
			}
			else {
				
				// the original attack method does a basic distance check
				
				return this.parent();
				
			}

		}
		
	});

});