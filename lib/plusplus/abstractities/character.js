ig.module(
        'plusplus.abstractities.character'
    )
    .requires(
        'plusplus.core.config',
        'plusplus.core.timer',
        'plusplus.core.entity',
        'plusplus.core.hierarchy',
        'plusplus.entities.explosion',
        'plusplus.helpers.utils',
        'plusplus.helpers.utilsmath',
        'plusplus.helpers.utilsintersection',
        'plusplus.helpers.utilsvector2',
        'plusplus.helpers.tweens',
        'plusplus.helpers.pathfinding'
    )
    .defines(function () {
        "use strict";

        var _c = ig.CONFIG;
        var _ut = ig.utils;
        var _utm = ig.utilsmath;
        var _uti = ig.utilsintersection;
        var _utv2 = ig.utilsvector2;
        var _pf = ig.pathfinding;

        /**
         * Base character entity.
         * <br>- includes handling for actions such as move, jump, climb, and use abilities
         * <br>- automatically tries to swap animations based on state via {@link ig.Character#updateCurrentAnim}
         * <br>- fixes entity movement on slopes
         * <span class="alert alert-error"><strong>IMPORTANT:</strong> this is an abstract entity that should be extended.</span>
         * @class
         * @extends ig.EntityExtended
         * @memeberof ig
         * @author Collin Hover - collinhover.com
		 * @example
		 * // by default, the abstract character looks for a set of animations
		 * // to use as the current animation based on various properties
         * // the set is controlled by the "animsExpected" property
         * character.animsExpected = [ "idle", "move", "stairs", "climb", "jump", "fall" ];
         * // this behavior can be skipped using the "animAutomatic" property
         * character.animAutomatic = false;
         * // the actual animation switching is done in the updateCurrentAnim method
         * // for example, when the character is moving
         * // the animation is automatically set to move
		 * if ( character.moving )
		 *      character.currentAnim = character.anims[ character.getDirectionalAnimName( "move" ) ];
		 * // note here the directional animation name
		 * // animations in Impact++ are directional and based on flip and facing
		 * // so if an entity can flip X and Y
		 * // you should have animations for both X and Y
		 * // i.e. "moveX" and "moveY"
		 * // if an entity cannot flip X and Y
		 * // you should have animations for Up, Down, Left, and Right
		 * // i.e. "moveUp", "moveDown", "moveLeft", "moveRight"
		 * if ( character.jumping = true;
		 *      character.currentAnim = character.anims[ character.getDirectionalAnimName( "jump" ) ];
		 * if ( character.falling )
		 *      character.currentAnim = character.anims[ character.getDirectionalAnimName( "fall" ) ];
		 * if ( character.climbing )
		 *      character.currentAnim = character.anims[ character.getDirectionalAnimName( "climb" ) ];
		 * if ( character.climbing && character.withinStairs )
		 *      character.currentAnim = character.anims[ character.getDirectionalAnimName( "stairs" ) ];
		 * // and if all else fails, characters will default to idle
		 * character.currentAnim = character.anims[ character.getDirectionalAnimName( "idle" ) ];
         **/
        ig.Character = ig.EntityExtended.extend(/**@lends ig.Character.prototype */{

            /**
             * Character performance should be movable.
             * <br>- set to dynamic to take advantage of run, jump, and climb
             * @default movable
             * @override
             */
            performance: ig.EntityExtended.PERFORMANCE.MOVABLE,

            /**
             * @default
             * @override
             */
            targetable: true,

            /**
             * Whether character is allowed to set own {@link ig.EntityExtended#currentAnim} automatically based on current state.
             * @type Boolean
             * @see ig.CONFIG.CHARACTER.ANIM_AUTOMATIC
             */
            animAutomatic: _c.CHARACTER.ANIM_AUTOMATIC,

            /**
             * List of names of animations this entity is expected to have.
             * <span class="alert"><strong>IMPORTANT:</strong> when any animation in this list is not present, it will be filled by a placeholder animation!</span>
             * @type Array
             */
            animsExpected: [
                "idle",
                "move",
                "stairs",
                "climb",
                "jump",
                "fall"
            ],

            /**
             * Character base size should be effective size accounting for offset.
             * @type Vector2|Object
             * @see ig.CONFIG.CHARACTER.SIZE_EFFECTIVE_X
             * @see ig.CONFIG.CHARACTER.SIZE_EFFECTIVE_Y
             */
            size: {x: _c.CHARACTER.SIZE_EFFECTIVE_X, y: _c.CHARACTER.SIZE_EFFECTIVE_Y},

            /**
             * Character base offset.
             * @type Vector2|Object
             * @see ig.CONFIG.CHARACTER.SIZE_OFFSET_X
             * @see ig.CONFIG.CHARACTER.SIZE_OFFSET_Y
             */
            offset: {x: _c.CHARACTER.SIZE_OFFSET_X, y: _c.CHARACTER.SIZE_OFFSET_Y},

            /**
             * Max velocity while in air.
             * @type Vector2
             * @see ig.CONFIG.CHARACTER.MAX_VEL_UNGROUNDED_X
             * @see ig.CONFIG.CHARACTER.MAX_VEL_UNGROUNDED_Y
             */
            maxVelUngrounded: {x: _c.CHARACTER.MAX_VEL_UNGROUNDED_X, y: _c.CHARACTER.MAX_VEL_UNGROUNDED_Y},

            /**
             * Max velocity while on ground.
             * @type Vector2
             * @see ig.CONFIG.CHARACTER.MAX_VEL_GROUNDED_X
             * @see ig.CONFIG.CHARACTER.MAX_VEL_GROUNDED_Y
             */
            maxVelGrounded: {x: _c.CHARACTER.MAX_VEL_GROUNDED_X, y: _c.CHARACTER.MAX_VEL_GROUNDED_Y},

            /**
             * Max velocity while climbing.
             * @type Vector2
             * @see ig.CONFIG.CHARACTER.MAX_VEL_CLIMBING_X
             * @see ig.CONFIG.CHARACTER.MAX_VEL_CLIMBING_Y
             */
            maxVelClimbing: {x: _c.CHARACTER.MAX_VEL_CLIMBING_X, y: _c.CHARACTER.MAX_VEL_CLIMBING_Y},

            /**
             * Friction while in air.
             * @type Vector2
             * @see ig.CONFIG.CHARACTER.FRICTION_UNGROUNDED_X
             * @see ig.CONFIG.CHARACTER.FRICTION_UNGROUNDED_Y
             */
            frictionUngrounded: {x: _c.CHARACTER.FRICTION_UNGROUNDED_X, y: _c.CHARACTER.FRICTION_UNGROUNDED_Y},

            /**
             * Friction while on ground.
             * @type Vector2
             * @see ig.CONFIG.CHARACTER.FRICTION_GROUNDED_X
             * @see ig.CONFIG.CHARACTER.FRICTION_GROUNDED_Y
             */
            frictionGrounded: {x: _c.CHARACTER.FRICTION_GROUNDED_X, y: _c.CHARACTER.FRICTION_GROUNDED_Y},

            /**
             * Movement speed to be applied to acceleration.
             * @type Vector2
             * @see ig.CONFIG.CHARACTER.SPEED_X
             * @see ig.CONFIG.CHARACTER.SPEED_Y
             */
            speed: {x: _c.CHARACTER.SPEED_X, y: _c.CHARACTER.SPEED_Y},

            /**
             * Whether character is able to jump.
             * @type Boolean
             * @default
             */
            canJump: _c.CHARACTER.CAN_JUMP && !_c.TOP_DOWN,

            /**
             * Number of update steps to apply jump force.
             * @type Number
             * @see ig.CONFIG.CHARACTER.JUMP_STEPS
             * @example
             * // jump is short
             * character.jumpSteps = 1;
             * // jump is long
             * character.jumpSteps = 10;
             */
            jumpSteps: _c.CHARACTER.JUMP_STEPS,

            /**
             * Speed modifier to apply on each jump step.
             * @type Number
             * @see ig.CONFIG.CHARACTER.JUMP_FORCE
             * @example
             * // jump is slow and not very high
             * character.jumpForce = 1;
             * // jump is faster and higher
             * character.jumpForce = 10;
             */
            jumpForce: _c.CHARACTER.JUMP_FORCE,

            /**
             * Amount of acceleration control while in air.
             * @type Number
             * @see ig.CONFIG.CHARACTER.JUMP_CONTROL
             * @example
             * // no control of direction while in air
             * character.jumpControl = 0;
             * // full control of direction while in air
             * character.jumpControl = 1;
             */
            jumpControl: _c.CHARACTER.JUMP_CONTROL,

            /**
             * Whether character is able to climb.
             * @type Boolean
             * @default
             */
            canClimb: _c.CHARACTER.CAN_CLIMB && !_c.TOP_DOWN,

            /**
             * Amount of acceleration control while climbing.
             * @type Number
             * @see ig.CONFIG.CHARACTER.CLIMBING_CONTROL
             * @example
             * // no control of direction while climbing
             * character.climbingControl = 0;
             * // full control of direction while climbing
             * character.climbingControl = 1;
             */
            climbingControl: _c.CHARACTER.CLIMBING_CONTROL,

            /**
             * Whether character is moving from another entity.
             * @type Boolean
             * @default
             * @readonly
             */
            movingFrom: false,

            /**
             * Whether character tried to move but stopped because movement was unsafe.
             * <span class="alert alert-info"><strong>Tip:</strong> this is only set while pathfinding!</span>
             * @type Boolean
             * @default
             * @readonly
             */
            moveToUnsafe: false,

            /**
             * Whether character is able to pathfind.
             * @type Boolean
             * @see ig.CONFIG.CHARACTER.CAN_PATHFIND
             */
            canPathfind: _c.CHARACTER.CAN_PATHFIND,

            /**
             * Path for pathfinding.
             * @type Array
             * @see ig.pathfinding
             */
            path: [],

            /**
             * Delay in seconds between pathfinding.
             * @type Number
             * @see ig.CONFIG.CHARACTER.PATHFINDING_DELAY
             */
            pathfindingDelay: _c.CHARACTER.PATHFINDING_DELAY,

            /**
             * Delay in seconds between pathfinding when following a path.
             * @type Number
             * @see ig.CONFIG.CHARACTER.PATHFINDING_UPDATE_DELAY
             */
            pathfindingUpdateDelay: _c.CHARACTER.PATHFINDING_UPDATE_DELAY,

            /**
             * Delay in seconds between pathfinding when following a path.
             * @type Number
             * @see ig.CONFIG.CHARACTER.PATHFINDING_UPDATE_DELAY
             */
            pathfindingSimpleDelay: _c.CHARACTER.PATHFINDING_SIMPLE_DELAY,

            /**
             * Pathing update timer.
             * <br>- created on first pathfind
             * @type ig.Timer
             */
            pathingTimer: null,

            /**
             * Whether character thinks it may be stuck while following a path.
             * @type Boolean
             * @default
             * @readonly
             */
            stuck: false,

            /**
             * Delay in seconds, after first becoming stuck, when character will throw path away.
             * @type Number
             * @see ig.CONFIG.CHARACTER.STUCK_DELAY
             */
            stuckDelay: _c.CHARACTER.STUCK_DELAY,

            /**
             * Stuck delay timer.
             * <br>- created on first pathfind
             * @type ig.Timer
             */
            stuckTimer: null,

            /**
             * @override
             * @default
             */
            health: _c.CHARACTER.HEALTH,

            /**
             * @override
             * @default
             */
            healthMax: _c.CHARACTER.HEALTH,

            /**
             * Energy statistic, by default used in abilities.
             * @type Number
             * @see ig.CONFIG.CHARACTER.ENERGY
             */
            energy: _c.CHARACTER.ENERGY,

            /**
             * Maximum energy statistic.
             * @type Number
             * @see ig.CONFIG.CHARACTER.ENERGY
             */
            energyMax: _c.CHARACTER.ENERGY,

            /**
             * Time in seconds between taking damage.
             * <br>- automatically makes character invulnerable for delay length after taking damage
             * @type Number
             * @default
             */
            damageDelay: 0,

            /**
             * Timer for damage delay.
             * <br>- created on init
             * @type ig.Timer
             * @default
             */
            damageTimer: null,

            /**
             * Number of times to pulse alpha while temporarily invulnerable.
             * @type Number
             * @default
             */
            temporaryInvulnerabilityPulses: 2,

            /**
             * Temporary invulnerability pulse alpha.
             * @type Number
             * @default
             */
            temporaryInvulnerabilityAlpha: 0.5,

            /**
             * Whether character regenerates stats.
             * @type Boolean
             * @default
             */
            regen: false,

            /**
             * Time in seconds between regeneration ticks.
             * @type Number
             * @default
             */
            regenDelay: 0,

            /**
             * Timer for regeneration ticks.
             * <br>- created on init
             * @type ig.Timer
             * @default
             */
            regenTimer: null,

            /**
             * Amount of health to regenerate per tick.
             * @type Number
             * @see ig.CONFIG.CHARACTER.REGEN_RATE_HEALTH
             */
            regenRateHealth: _c.CHARACTER.REGEN_RATE_HEALTH,

            /**
             * Whether to treat health regen as a percentage of max.
             * @type Boolean
             * @default
             */
            regenAsPctHealth: false,

            /**
             * Amount of energy to regenerate per tick.
             * @type Number
             * @see ig.CONFIG.CHARACTER.REGEN_RATE_ENERGY
             */
            regenRateEnergy: _c.CHARACTER.REGEN_RATE_ENERGY,

            /**
             * Whether to treat energy regen as a percentage of max.
             * @type Boolean
             * @default
             */
            regenAsPctEnergy: false,

            /**
             * Whether character can regenerate the health statistic.
             * <br>- use to block regeneration dynamically
             * @type Boolean
             * @default
             */
            regenHealth: true,

            /**
             * Whether character can regenerate the energy statistic.
             * <br>- use to block regeneration dynamically
             * @type Boolean
             * @default
             */
            regenEnergy: true,

            /**
             * How high of a mimic power is needed to mimic this character's abilities.
             * @type Number
             * @default 0
             * @see ig.CONFIG.RANKS_MAP
             */
            mimicLevel: _c.RANKS_MAP.NONE,

            /**
             * Whether characters should have a particle explosion when damaged
             * <br>- explosions are created through an {@link ig.EntityExplosion}
             * @type Boolean
             * @see ig.CONFIG.CHARACTER.EXPLODING_DAMAGE
             */
            explodingDamage: _c.CHARACTER.EXPLODING_DAMAGE,

            /**
             * Settings for particle explosion when damaged.
             * <br>- settings exactly map to those of an {@link ig.EntityExplosion}
             * @type Object
             * @default white particles
             */
            damageSettings: {
                spawnCountMax: _c.CHARACTER.EXPLODING_DAMAGE_PARTICLE_COUNT,
                spawnSettings: {
                    animTileOffset: ig.EntityParticleColor.colorOffsets.WHITE
                }
            },

            /**
             * Characters should have a particle explosion when killed.
             * <br>- explosions are created through an {@link ig.EntityExplosion}
             * @type Boolean
             * @see ig.CONFIG.CHARACTER.EXPLODING_DEATH
             */
            explodingDeath: _c.CHARACTER.EXPLODING_DEATH,

            /**
             * Settings for particle explosion when killed.
             * <br>- settings exactly map to those of an {@link ig.EntityExplosion}
             * @type Object
             * @default white particles
             */
            deathSettings: {
                spawnCountMax: _c.CHARACTER.EXPLODING_DEATH_PARTICLE_COUNT,
                spawnSettings: {
                    animTileOffset: ig.EntityParticleColor.colorOffsets.WHITE
                }
            },

            /**
             * Abilities collection that character starts with.
             * <br>- created on init
             * @type ig.Hierarchy
             */
            abilities: null,

            /**
             * Reference to abilities collection that character starts with, {@link ig.Character#abilities}.
             * <br>- references on init
             * @type ig.Hierarchy
             */
            abilitiesOriginal: null,

            /**
             * @override
             * @see ig.CONFIG.CHARACTER.SLOPE_STICKING
             */
            slopeSticking: _c.CHARACTER.SLOPE_STICKING,

            /**
             * Whether character has not been grounded for a duration above {@link ig.Character.ungroundedForAndFallingThreshold}.
             * @type Boolean
             * @default
             * @readonly
             */
            falling: false,

            /**
             * Duration since character was grounded.
             * @type Number
             * @default
             * @readonly
             */
            ungroundedFor: 0,

            /**
             * Duration after character leaves ground during which they can still jump.
             * <br>- this is intended to help players with slower reaction time
             * <br>- this does not allow another jump while jumping
             * @type Number
             * @see ig.CONFIG.CHARACTER.UNGROUNDED_FOR_THRESHOLD
             */
            ungroundedForThreshold: _c.CHARACTER.UNGROUNDED_FOR_THRESHOLD,

            /**
             * Duration after character leaves ground to start playing fall animation.
             * @type Number
             * @see ig.CONFIG.CHARACTER.UNGROUNDED_FOR_AND_FALLING_THRESHOLD
             */
            ungroundedForAndFallingThreshold: _c.CHARACTER.UNGROUNDED_FOR_AND_FALLING_THRESHOLD,

            /**
             * Whether character is intersecting a climbable entity.
             * @type Boolean
             * @default
             * @readonly
             */
            withinClimbables: false,

            /**
             * Whether character is intersecting a climbable entity above its feet (i.e. inside body).
             * @type Boolean
             * @default
             * @readonly
             */
            withinClimbablesAbove: false,

            /**
             * Whether character is intersecting a climbable stairs entity.
             * @type Boolean
             * @default
             * @readonly
             */
            withinStairs: false,

            /**
             * Whether character is intersecting a one-way entity.
             * @type Boolean
             * @default
             * @readonly
             */
            withinOneWay: false,

            /**
             * Whether character is jumping.
             * <br>- to check if character is not on ground, use {@link ig.Character#grounded}.
             * @type Boolean
             * @default
             * @readonly
             */
            jumping: false,

            /**
             * Whether character is in initial, ascending portion of jump.
             * @type Boolean
             * @default
             * @readonly
             */
            jumpAscend: false,

            /**
             * Whether character is climbing.
             * @type Boolean
             * @default
             * @readonly
             */
            climbing: false,

            /**
             * Whether character needs new path for pathfinding.
             * @type Boolean
             * @default
             */
            needsNewPath: false,

            // internal properties, do not modify

            _jumpPushing: false,
            _jumpWhileClimbing: false,

            _climbingIntentDown: false,
            _climbingIntentUp: false,

            _cleanIntentDown: false,
            _cleanIntentUp: false,

            _temporarilyInvulnerable: false,
            _temporarilyInvulnerablePulsing: false,

            _positionsPathfinding: {
                from: { x: 0.1, y: 0.1 },
                target: { x: 0.1, y: 0.1 }
            },
            _boundsPathfollow: {},

            /**
             * Initializes Character types.
             * <br>- adds {@link ig.EntityExtended.TYPE.CHARACTER} to {@link ig.EntityExtended#type}
             * @override
             */
            initTypes: function () {

                this.parent();

                _ut.addType(ig.EntityExtended, this, 'type', "CHARACTER");

            },

            /**
             * Initializes character properties.
             * <br>- creates timers for things such as regen and damage delay
             * <br>- creates ability collection
             * @override
             */
            initProperties: function () {

                this.parent();

                // timers

                this.regenTimer = new ig.Timer();
                this.damageTimer = new ig.Timer();
                this.pathingTimer = new ig.Timer();
                this.stuckTimer = new ig.Timer();

                // abilities

                this.abilities = this.abilitiesOriginal = new ig.Hierarchy();

            },

            /**
             * Resets character movement, velocity, and flip.
             * @override
             **/
            resetExtras: function () {

                this.parent();

                // stats

                this.energyMax = this.energy;

                // movement

                this.moveToStop();
                this.applyAntiVelocity();
				
				// check all expected animations so we don't have to check while in game
				
				if ( this.animAutomatic && this.animsExpected.length > 0 && !this._animsPlaceheld ) {
					
					this._animsPlaceheld = true;
					
					this.placeholdAnims();
					
				}

            },
			
			/**
			 * Ensures all expected animations are present so checks don't have to be made at runtime.
			 * <span class="alert"><strong>IMPORTANT:</strong> when an expected animation is missing, it is placeholded by the init anim or the current anim. This is not a smart fix!</span>
			 **/
			placeholdAnims: function () {

                var anims = this.anims;
                var animInitPlaceholder;

                if (this.animInit instanceof ig.Animation ) {

                    animInitPlaceholder = animInit;

                }
                else if (this.animInit && anims[ this.animInit ]) {

                    animInitPlaceholder = anims[ this.animInit ];

                }
                else {

                    animInitPlaceholder = anims[ 'idle' ] || this.currentAnim;

                }

                for ( var i = 0, il = this.animsExpected.length; i < il; i++ ) {

                    var animName = this.animsExpected[ i ];
                    var animPlaceholder = anims[ animName ] || animInitPlaceholder;

                    if ( animPlaceholder ) {

                        if ( !anims[ animName + "X" ] ) {

                            anims[ animName + "X" ] = animPlaceholder;

                        }

                        if ( !anims[ animName + "Right" ] ) {

                            anims[ animName + "Right" ] = anims[ animName + "X" ];

                        }

                        if ( !anims[ animName + "Left" ] ) {

                            anims[ animName + "Left" ] = anims[ animName + "X" ];

                        }

                        if ( !anims[ animName + "Y" ] ) {

                            anims[ animName + "Y" ] = animPlaceholder;

                        }

                        if ( !anims[ animName + "Down" ] ) {

                            anims[ animName + "Down" ] = anims[ animName + "Y" ];

                        }

                        if ( !anims[ animName + "Up" ] ) {

                            anims[ animName + "Up" ] = anims[ animName + "Y" ];

                        }

                    }

                }
				
			},

            /**
             * @override
             */
            recordResetState: function () {

                this.parent();

                this.resetState.controllable = this.controllable;

                this.resetState.energy = this.energy;

            },

            /**
             * Called by game when character added to game world.
             * <br>- restores all stats to full
             * <br>- adds temporary invulnerability
             * @override
             **/
            ready: function () {

                // set this as entity for all abilities
                // this ensures that abilities activate properly
                // when a character has been removed from and then added back into game

                var me = this;

                this.abilities.forAllDescendants( function () {

                    this.setEntity( me );

                } );

                // lock down

                this.temporaryInvulnerability();
                this.removeControl();

                this.parent();

            },

            /**
             * Called when character spawned.
             * @override
             **/
            spawn: function () {

                this.parent();

                if ( this.resetState.controllable ) {

                    this.addControl();

                }

            },

            /**
             * Removes control from character.
             * @override
             **/
            removeControl: function () {

                this.parent();

                this.moveToStop();
                this.jumpEnd();
                this.climbEnd();

            },

            /**
             * @override
             **/
            pause: function () {

                this.parent();

                this.regenTimer.pause();
                this.damageTimer.pause();
                this.pathingTimer.pause();
                this.stuckTimer.pause();

                this.abilities.pause();

            },

            /**
             * @override
             **/
            unpause: function () {

                this.parent();

                this.regenTimer.unpause();
                this.damageTimer.unpause();
                this.pathingTimer.unpause();
                this.stuckTimer.unpause();

                this.abilities.unpause();

            },

            /**
             * @override
             */
            setGrounded: function ( withoutVelocity ) {

                if ( _c.TOP_DOWN ) {

                    this.standing = this.grounded = true;
                    this.falling = false;

                }
                else {

                    this.standing = this.grounded = this.hasGravity;
                    this.falling = false;

                    if ( !this.climbing && !withoutVelocity ) {

                        // force to max velocity so we stick to ground
                        // because characters switch max velocities
                        // this max velocity should always be the grounded max

                        if ( this.slopeSticking && this.hasGravity ) {

                            this.vel.y = this.maxVelGrounded.y;

                        }
                        else {

                            this.vel.y = 0;

                        }

                    }

                }

            },

            /**
             * @override
             */
            setUngrounded: function () {

                if ( !_c.TOP_DOWN ) {

                    this.grounded = this.standing = this.falling = false;

                }

            },

            /**
             * Move to an entity or position using pathfinding when dynamic or the original method when not.
             * @override
             * @example
             * // if a character's performance is DYNAMIC
             * myCharacter.performance = ig.EntityExtended.PERFORMANCE.DYNAMIC;
             * // and the character can pathfind
             * myCharacter.canPathfind = true;
             * // this method will use pathfinding
             * // and not the original method
             * // which also means the settings change
             * // settings is still a plain object
             * settings = {};
             * // we can only search for paths
             * // that keep us within range of our target
             * // this also helps improve performance
             * settings.searchDistance = 100;
             * // if not doing simple pathfinding
             * // we can avoid other entities
             * settings.avoidEntities = true;
             * // but sometimes, all we care about is not going off an edge into the air
             * // so if we never want to fall off the edge of a platform
             * settings.avoidUngrounded = true;
             * // to do simple pathfinding
             * // or move towards target 1 node at a time
             * // this has much better performance
             * // but it is far less accurate and cannot avoid obstacles
             * // i.e. it is stupid (sometimes)
             * settings.simple = true;
             * // normally a character will do its best to treat slopes as safe
             * // but if you want to force it to avoid walking on slopes
             * // (note this only works on simple pathfinding)
             * settings.avoidSlopes = true;
             * // a character can often figure out
             * // when the next node in the path is not safe
             * // ex: a climbing area when the character cannot climb
             * // if we don't care and want to try to follow the path anyway
             * // (note this only works on simple pathfinding)
             * settings.unsafe = true;
             * // in most cases, the first node in the path is removed
             * // which fixes many silly pathfinding behaviors
             * // but if you want to keep it
             * settings.alwaysKeepFirst = true;
             **/
            moveTo: function (item, settings) {

                var startedMoving = this.parent( item, settings );

                if ( startedMoving ) {

                    this.needsNewPath = true;

                    if ( this.pathingTimer ) {

                        this.pathingTimer.set( 0 );

                    }

                }

                return startedMoving;

            },

            /**
             * Moves character away from entity or position instead of towards.
             * <br>- this method hooks into the moveTo method and adds some extra properties
             * @param {ig.EntityExtended} entity entity to move away from
             * @param {Object} [settings] settings object
             * @returns {Boolean} whether a new move from has been started
             * @see ig.Character#moveTo
             **/
            moveFrom: function (item, settings) {

                var startedMoving = this.moveTo( item, settings );

                if ( startedMoving ) {

                    this.movingFrom = true;

                }
				
                return startedMoving;

            },

            /**
             * @override
             **/
            moveToUpdate: function () {

                // dynamic characters move to entity differently

                if ( this.performance === ig.EntityExtended.PERFORMANCE.DYNAMIC ) {

                    if ( this.movingTo ) {

                        // pathfind

                        if ( this.canPathfind ) {

                            this.needsNewPath = this.movingTo.changed || this.changed || this.moveToUnsafe || this.needsNewPath;

                            if ( !this.movedTo || this.needsNewPath ) {

                                this.findMoveToPath();

                                this.moveToPath();

                            }

                        }
                        // turn to face entity
                        else {

                            this.lookAt( this.movingTo );

                        }

                    }

                }
                // non-dynamic may move to by default method
                else {

                    this.parent();

                }

            },

            /**
             * Gets and processes a path from this character to an entity.
             * @param {Object} [settings] settings for finding path
             * @see ig.Character#moveTo
             */
            findMoveToPath: function ( settings ) {

                // update path if delay reached since last path was found
                // and any of the entities invoved in the pathing changed
                // or we just don't have a path yet

                if ( this.pathingTimer.delta() >= 0 && ( this.path.length === 0 || this.needsNewPath ) ) {

                    this.needsNewPath = this.movedTo = this.moveToUnsafe = false;

                    // handle settings

                    settings = settings || this.movingToSettings;

                    var simple;
                    var avoidEntities;
                    var unsafe;
                    var avoidSlopes;
                    var searchDistance;
                    var alwaysKeepFirst;

                    if ( settings ) {

                        simple = settings.simple;
                        avoidEntities = settings.avoidEntities;
                        unsafe = settings.unsafe;
                        avoidSlopes = settings.avoidSlopes;
                        searchDistance = settings.searchDistance;
                        alwaysKeepFirst = settings.alwaysKeepFirst;

                    }

                    // find a path

                    if ( simple ) {

                        var from;
                        var target;

                        if ( this.movingTo instanceof ig.EntityExtended ) {

                            var positions = ig.pathfinding.getPositionPathfindingEntities( this, this.movingTo, this._positionsPathfinding );
                            from = positions.from;
                            target = positions.target;

                        }
                        else {

                            target = this.movingTo;
                            from = _pf.getPositionPathfindingPoint( this, this.movingTo.x, this.movingTo.y, this._positionsPathfinding.from );

                        }

                        var dX = target.x - from.x;
                        var dY = target.y - from.y;

                        // reverse directions when moving from

                        if ( this.movingFrom ) {

                            dX = -dX;
                            dY = -dY;

                        }

                        // make sure distance to move is more than 25% character size

                        if ( dX !== 0 ) {

                            if ( dX * dX < this.size.x * this.size.x * 0.25 ) {

                                dX = 0;

                            }
                            else {

                                dX = _utm.direction( dX );

                            }

                        }

                        if ( dY !== 0 ) {

                            if ( dY * dY < this.size.y * this.size.y * 0.25 ) {

                                dY = 0;

                            }
                            else {

                                dY = _utm.direction( dY );

                            }

                        }

                        // when gravity affects entity

                        if ( this.hasGravity ) {

                            // only allow vertical movement when 2x greater than horizontal distance

                            if ( dX !== 0 && dY !== 0 && dY * dY < dX * dX * 2 ) {

                                dY = 0;

                            }

                            // check slope and force y direction when has none

                            if ( !avoidSlopes ) {

                                var onSlope = _pf.getEntityOnSmoothSlope( this, dX );

                                if ( onSlope && dY === 0 ) {

                                    dY = _pf.getSlopeDirectionY( this, dX );

                                }

                            }

                        }

                        // get a simple path in direction
                        // when unsafe, don't bother trying to check if walkable

                        var node = unsafe || onSlope ? _pf.getNode( from.x, from.y, dX, dY ) : _pf.getWalkableNode( from.x, from.y, dX, dY, avoidEntities, this );

						if ( node ) {

                            this.path[ 0 ] = node;

                        }
                        else {

                            this.clearPath();
                            this.moveToUnsafe = true;
							
                        }

                        this.pathingTimer.set( this.pathfindingSimpleDelay );

                    }
                    // complex pathfinding
                    else {

                        // moving from

                        if ( this.movingFrom ) {

                            if ( this.movingTo instanceof ig.EntityExtended ) {

                                this.path = _pf.getPathAwayFromEntity( this, this.movingTo, avoidEntities, searchDistance );
								
                            }
                            else {

                                this.path = _pf.getPathAwayFromPoint( this, this.movingTo.x, this.movingTo.y, avoidEntities, searchDistance );

                            }

                        }
                        // moving to
                        else {

                            if ( this.movingTo instanceof ig.EntityExtended ) {

                                this.path = _pf.getPathToEntity( this, this.movingTo, avoidEntities, searchDistance );

                            }
                            else {

                                this.path = _pf.getPathToPoint( this, this.movingTo.x, this.movingTo.y, avoidEntities, searchDistance );

                            }

                        }

                        // use longer pathfinding delay when path not found

                        if ( this.path.length === 0 ) {

                            this.clearPath();
                            this.pathingTimer.set( this.pathfindingDelay )

                        }
                        else {

                            this.pathingTimer.set( this.pathfindingUpdateDelay );

                            if ( this.path.length > 1 && !alwaysKeepFirst ) {

                                // remove first node in path
                                // in almost all cases first node is redundant and/or problematic

                                var node = this.path[ this.path.length - 1 ];

                                if ( !node.corner || this._lastCornerNode === node ) {

                                    this.path.length--;
                                    return;

                                }

                                var nextNode = this.path[ this.path.length - 2 ];
								var x = this.pos.x + this.size.x * 0.5;
								var y = this.pos.y + this.size.y * 0.5;

                                // there is also no need for the first node to take us backwards

                                if ( ( node.x < x && nextNode.x > x )
                                    || ( node.x > x && nextNode.x < x )
                                    || ( node.y < y && nextNode.y > y )
                                    || ( node.y > y && nextNode.y < y ) ) {

                                    this.path.length--;

                                }

                                if ( this.path.length && this._lastNode !== this.path[ this.path.length - 1 ] ) {

                                    this._boundsPathfollow.ignoreCornerX = this._boundsPathfollow.ignoreCornerY = false;

                                }

                            }

                        }

                    }

                }

            },

            /**
             * Moves a character along a path.
             * @param {Array} [path=this.path] list of points to move to.
             * @param {Object} settings settings for moving along path
             * @see ig.Character#moveTo
             */
            moveToPath: function ( path, settings ) {

                path = path || this.path;

                if ( path ) {

                    // complete move when path is empty or it looks like we're stuck

                    if (path.length === 0 || ( this.stuck && this.stuckTimer.delta() >= 0 ) ) {

                        this.moveToComplete();

                    }
                    // follow path
                    else {

                        // stuck check

                        if ( !this.changed ) {

                            if ( !this.stuck ) {

                                this.stuckTimer.set( this.stuckDelay );
                                this.stuck = true;

                            }

                        }
                        else {

                            this.stuck = false;

                        }

                        // handle settings

                        settings = settings || this.movingToSettings;

                        var unsafe;
                        var avoidUngrounded;

                        if ( settings ) {

                            unsafe = settings.unsafe;
                            avoidUngrounded = settings.avoidUngrounded;

                        }

                        var length = path.length;
                        var node = this._lastNode = path[ length - 1 ];
                        var nodeX = node.x;
                        var nodeY = node.y;
                        var atNode;

                        var width = this.size.x;
                        var height = this.size.y;
                        var x = this.pos.x;
                        var y = this.pos.y;

                        var bounds = _pf.getBoundsPathfollowing( x, y, width, height, node, !this.hasGravity, this._boundsPathfollow );
                        var minX = Math.round( bounds.minX );
                        var maxX = Math.round( bounds.maxX );
                        var minY = Math.round( bounds.minY );
                        var maxY = Math.round( bounds.maxY );

                        // corners should check with min/max based on corner
                        if ( node.corner ) {

                            atNode = _uti.pointInAABB( nodeX, nodeY, minX, minY, maxX, maxY );

                        }
                        // if jumping and next node is in air, only check bounds horizontally
                        else if ( this.jumping && node.ungrounded && length > 1 ) {

                            atNode = x <= nodeX && x + width >= nodeX;

                        }
                        // path node normally only needs to be within this bounds
                        else {

                            atNode = _uti.pointInAABB( nodeX, nodeY, x, y, x + width, y + height );

                        }

                        // at the next node in path

                        if ( atNode ) {

                            if ( node.corner ) {

                                this._lastCornerNode = node;

                            }
                            else {

                                this._lastCornerNode = null;

                            }

                            this._boundsPathfollow.ignoreCornerX = this._boundsPathfollow.ignoreCornerY = false;

                            // at destination

                            if ( path.length === 1 ) {

                                return this.moveToComplete();

                            }
                            else {

                                // erase the last node

                                path.length--;

                                return this.moveToPath( path );

                            }

                        }

                        width = bounds.width;
                        height = bounds.height;

                        var cX = Math.round( minX + width * 0.5 );
                        var cY = Math.round( minY + height * 0.5 );

						if ( !this.hasGravity ) {

							// vertical movement

							if ( minY <= nodeY && maxY >= nodeY ) {

								this.moveToHereVertical();

							}
							else if (cY < nodeY) {

								this.moveToDown();

							}
							else if (cY > nodeY) {

								this.moveToUp();

							}

							// horizontal movement

							if ( minX <= nodeX && maxX >= nodeX ) {

								this.moveToHereHorizontal();

							}
							else if (cX < nodeX) {

								this.moveToRight();

							}
							else if (cX > nodeX) {

								this.moveToLeft();

							}

						}
						else {

                            var nodeNext;
                            var withinX = minX <= nodeX && maxX >= nodeX;

							// vertical movement

							if ( !this.jumping ) {

								if ( minY <= nodeY && maxY >= nodeY ) {

									this.moveToHereVertical();

								}
								else if (cY < nodeY) {

									if ( this.canClimb ) {

										this.climbDown();

									}

									if ( !this.climbing ) {

										this.moveToDown();

									}

								}
								else if (cY > nodeY){// && nodeY < y + height - node.size * 0.5 && ( withinX || !_pf.getEntityOnSmoothSlope( this, nodeX - cX, -1 ) ) ) {

									this.moveToUnsafe = !unsafe && node.ungrounded;

									// climb
									if ( this.withinClimbables && this.canClimb ) {

										this.moveToUnsafe = false;
										this.climbUp();
										
									}
									// jump
                                    else if ( this.canJump ) {

                                        this.moveToUnsafe = false;
                                        this.jump();

                                    }

								}

                                // even if we think it is safe (above)
								// we need to look for unsafe pathing
                                // by checking if entity is on ground but node is not

								if ( !unsafe
                                    && ( node.ungrounded && ( !node.oneWay || node.oneWayFacing.y >= 0 ) ) && avoidUngrounded
                                    && ( this.grounded || this.climbing ) ) {

                                    // step down until safe ground is found
                                    // or an (unsafe) empty node is below

                                    nodeNext = node.neighborMap.bottom;

                                    while ( nodeNext ) {

                                        nodeNext = nodeNext.neighborMap.bottom;

                                        // safe ground

                                        if ( !nodeNext.walkable || ( nodeNext.oneWay && nodeNext.oneWayFacing.y < 0 ) ) {

                                            break;

                                        }
                                        // unsafe air
                                        else if ( nodeNext.y > this.pos.y + this.size.y ) {

                                            this.moveToUnsafe = true;
                                            break;

                                        }

                                    }

								}

							}

							// next node is unsafe so kill the path

							if ( this.moveToUnsafe ) {

								return this.moveToComplete();

							}

							// horizontal movement

							if ( withinX ) {

								this.moveToHereHorizontal();

								if ( this.jumping && ( !node.ungrounded || node.x === path[ 0 ].x ) ) {

									if (cX < nodeX) {

										this.moveToRight();

									}
									else if (cX > nodeX) {

										this.moveToLeft();

									}

								}

							}
							else if (cX < nodeX) {

								this.moveToRight();

							}
							else if (cX > nodeX) {

								this.moveToLeft();

							}

						}

					}

                }

            },

            /**
             * Clears path.
             */
            clearPath: function () {

                this.stuck = false;

                if ( this.path.length > 0 ) {

                    this.path.length = 0;

                }

            },

            /**
             * Accelerates character left at {@link ig.Character#speed}.
             * @param {Number} [mod] modifier to apply to speed.
             */
            moveToLeft: function (mod) {

                if (mod) {
                    this.accel.x = -this.speed.x * mod;
                }
                else {
                    this.accel.x = -this.speed.x;
                }
                this.flip.x = this.canFlipX;

                if( this.moving ){

                    if ( !this.movingY ) {

                        this.facing.y = 0;

                    }

                    this.facing.x = -1;

                }

            },

            /**
             * Accelerates character right at {@link ig.Character#speed}.
             * @param {Number} [mod] modifier to apply to speed.
             */
            moveToRight: function (mod) {

                if (mod) {
                    this.accel.x = this.speed.x * mod;
                }
                else {
                    this.accel.x = this.speed.x;
                }
                this.flip.x = false;

                if( this.moving ){

                    if ( !this.movingY ) {

                        this.facing.y = 0;

                    }

                    this.facing.x = 1;

                }

            },

            /**
             * Accelerates character up at {@link ig.Character#speed}.
             * @param {Number} [mod] modifier to apply to speed.
             */
            moveToUp: function (mod) {

                if (mod) {
                    this.accel.y = -this.speed.y * mod;
                }
                else {
                    this.accel.y = -this.speed.y;
                }
                this.flip.y = this.canFlipY;

				if ( this.moving && (_c.TOP_DOWN || this.canFlipY) ) {

					if ( !this.movingX ) {

						this.facing.x = 0;

					}

					this.facing.y = -1;

				}

            },

            /**
             * Accelerates character down at {@link ig.Character#speed}.
             * @param {Number} [mod] modifier to apply to speed.
             */
            moveToDown: function (mod) {

                if (mod) {
                    this.accel.y = this.speed.y * mod;
                }
                else {
                    this.accel.y = this.speed.y;
                }
                this.flip.y = false;

				if ( this.moving && (_c.TOP_DOWN || this.canFlipY) ) {

					if ( !this.movingX ) {

						this.facing.x = 0;

					}

					this.facing.y = 1;

				}

            },

            /**
             * Zeroes current horizontal acceleration.
             */
            moveToHereHorizontal: function () {

                this.accel.x = 0;

            },

            /**
             * Zeroes current vertical acceleration.
             */
            moveToHereVertical: function () {

                this.accel.y = 0;

            },

            /**
             * Zeroes all current acceleration and clears path.
             */
            moveToHere: function () {

                this.clearPath();

                this.moveToHereHorizontal();
                this.moveToHereVertical();

            },

            /**
             * @override
             **/
            moveToSequenceNext: function () {

                // moving to sequence

                if (this.movingToSequence) {

                    // another to move to

                    if (this.movingToSequence.length > 0) {

                        // check if moving from or moving to
                        // disable moving to temporarily so moveTo doesn't reset properties

                        if ( this.movingFrom ) {

                            this.movingTo = null;
                            this.movingFrom = false;

                            this.moveFrom(this.movingToSequence.shift(), this.movingToSettings);

                        }
                        else {

                            this.movingTo = null;

                            this.moveTo(this.movingToSequence.shift(), this.movingToSettings);

                        }

                    }
                    // none left, end sequence
                    else {

                        this.movingToSequence = undefined;
                        this.moveToComplete();
                        this.moveToStop();

                    }

                }

            },

            /**
             * @override
             **/
            moveToComplete: function () {

                // reset pathing timer so we find next path instantly

                if ( this.pathingTimer ) {

                    this.pathingTimer.set( 0 );

                }

                this.moveToHere();

                this.parent();

            },

            /**
             * @override
             */
            moveToStop: function () {

                this.moveToHere();

                this.movingFrom = false;

                this.parent();

            },

            /**
             * Characters stop moving to and pathfinding when managed.
             * @override
             */
            manageStart: function () {

                this.parent();

                this.moveToStop();

            },

            /**
             * Attempts to start jumping.
             **/
            jump: function () {

                if (this.canJump) {

                    if (this.climbing) {

                        this._jumpWhileClimbing = true;
                        this.climbEnd();

                    }

                    if (( this.grounded || ( this.canClimb && this.withinClimbables ) || this.ungroundedFor < this.ungroundedForThreshold ) && this.jumping !== true) {

                        this.jumping = this._jumpPushing = true;
                        this.jumpStepsRemaining = this.jumpSteps;

                    }

                }

            },

            /**
             * Updates jump in progress.
             **/
            jumpUpdate: function () {

                if (this.jumping === true) {

                    if ( this._jumpPushing ) {

                        this.jumpPush();

                    }

                    if (this.vel.y >= 0) {

                        this.jumpAscend = false;

                    }

                    if ( !this._jumpPushing && !this.jumpAscend && ( this.grounded || ( this._jumpWhileClimbing  && this.withinClimbables ) ) ) {

                        this.jumpEnd();

                    }

                }

            },

            /**
             * Does jump push for number of jump steps.
             **/
            jumpPush: function () {

                if (this.jumpStepsRemaining > 0) {

                    if (this.jumpStepsRemaining === this.jumpSteps) {

                        // zero out vertical velocity so jumping is always consistent, even after falling

                        this.setUngrounded();
                        this.applyAntiVelocityY();

                    }

                    this.jumpAscend = true;
                    this.jumpStepsRemaining--;

                    this.moveToUp(this.jumpForce);

                    if (this.jumpStepsRemaining <= 0) {

                        this._jumpPushing = false;
                        this.moveToHereVertical();

                    }

                }

            },

            /**
             * Stops any jump in progress.
             **/
            jumpEnd: function () {

                this.jumping = this._jumpPushing = false;
                this.jumpStepsRemaining = 0;

                if (this._jumpWhileClimbing) {

                    this._jumpWhileClimbing = false;

                    this.climb();

                }

            },

            /**
             * Attempts to start climbing.
             **/
            climb: function () {

                if (this.canClimb && this.withinClimbables) {

                    if (this.jumping) {

                        this.jumpEnd();

                    }

                    if (this.climbing !== true
                        && ( ( this._climbingIntentUp && this.withinClimbablesAbove )
                            || ( this._climbingIntentDown && !this.grounded ) ) ) {

                        this.setUngrounded();
                        this.climbing = true;

                        if (!this.jumping) {

                            this.applyAntiVelocityY();

                        }

                    }

                }

            },

            /**
             * Attempts to start climbing and climb up.
             **/
            climbUp: function () {

                this._climbingIntentUp = true;
                this._cleanIntentUp = false;

                this.climb();

                if (this.climbing) {

                    this.moveToUp();

                }

            },

            /**
             * Attempts to start climbing and climb down.
             **/
            climbDown: function () {

                this._climbingIntentDown = true;
                this._cleanIntentDown = false;

                this.climb();

                if (this.climbing) {

                    this.moveToDown();

                }

            },

            /**
             * Updates climb in progress.
             **/
            climbUpdate: function () {

                if (this.climbing) {

					this.applyAntiGravity();

                    if (!this.withinClimbables || ( this.grounded && this.vel.y >= 0 ) ) {

                        this.climbEnd();

                    }

                }

                if ( this._climbingIntentDown ) {

                    if ( this._cleanIntentDown ) {

                        this._cleanIntentDown = this._climbingIntentDown = false;

                    }
                    else {

                        this._cleanIntentDown = true;

                    }

                }

                if ( this._climbingIntentUp ) {

                    if ( this._cleanIntentUp ) {

                        this._cleanIntentUp = this._climbingIntentUp = false;

                    }
                    else {

                        this._cleanIntentUp = true;

                    }

                }

            },

            /**
             * Stops climb in progress.
             **/
            climbEnd: function () {

                if (this.climbing !== false) {

                    this.climbing = false;

                    if (!this.jumping && this.vel.y < 0) {

                        this.applyAntiVelocityY();

                    }

                }

            },

            /**
             * Receives damage.
             * <br>- optionally, creates explosion based on {@link ig.Character#explodingDamage}
             * <br>- optionally, becomes temporarily invulnerable based on {@link ig.Character#damageDelay}
             * @returns {Boolean} whether applied.
             * @override
             **/
            receiveDamage: function (amount, from, unblockable) {

                var applied = this.parent(amount, from, unblockable);

                // damage applied

                if (applied && !this._killed) {

                    // show damage being done

                    if (this.explodingDamage) {

                        this.explode();

                    }

                    // make temporarily invulnerable if damage applied from a blockable source

                    if (!unblockable) {

                        this.temporaryInvulnerability();

                    }

                }

                return applied;

            },

            /**
             * Creates particle explosion.
             * @param {Object} [settings] settings object for an {@link ig.EntityExplosion}.
             **/
            explode: function (settings) {

                ig.game.spawnEntity(ig.EntityExplosion, this.pos.x, this.pos.y, ig.merge({
                    size: { x: this.size.x, y: this.size.y }
                }, settings || this.damageSettings));

            },

            /**
             * Restore health amount.
             * @param {Number} amount amount to restore.
             * @param {ig.EntityExtended} [from] entity source.
             **/
            receiveHealing: function (amount, from) {

                this.health = Math.min(this.healthMax, this.health + amount);

            },

            /**
             * Drain energy amount.
             * @param {Number} amount amount of energy.
             * @param {ig.EntityExtended} [from] entity source.
             * @param {Boolean} [unblockable] whether drain is unblockable.
             * @returns {Boolean} whether applied.
             **/
            drainEnergy: function (amount, from, unblockable) {

                // check if invulnerable

                if (!this.invulnerable || unblockable) {

                    this.energy = Math.max(0, this.energy - amount);

                    return true;

                }

                // nothing happened

                return false;

            },

            /**
             * Restore energy amount.
             * @param {Number} amount amount to restore.
             * @param {ig.EntityExtended} [from] entity source.
             **/
            receiveEnergy: function (amount, from) {

                this.energy = Math.min(this.energyMax, this.energy + amount);

            },

            /**
             * Restores all stats to their max values.
             * @param {ig.EntityExtended} [from] entity source.
             **/
            restoreStats: function (from) {

                this.receiveHealing(this.healthMax - this.health, from);
                this.receiveEnergy(this.energyMax - this.energy, from);

            },

            /**
             * Restores stats at a steady rate.
             **/
            regenerate: function () {

                if (this.regenHealth) {

                    this.receiveHealing(this.regenRateHealth * ( this.regenAsPctHealth ? this.healthMax : 1 ), this);

                }

                if (this.regenEnergy) {

                    this.receiveEnergy(this.regenRateEnergy * ( this.regenAsPctEnergy ? this.energyMax : 1 ), this);

                }

            },

            /**
             * Makes character temporarily invulnerable.
             * @param {Number} [duration=ig.Character#damageDelay] duration in seconds of invulnerability
             **/
            temporaryInvulnerability: function ( duration ) {

                if ( typeof duration === 'undefined' ) {

                    duration = this.damageDelay;

                }

                if (!this.invulnerable && duration > 0) {

                    this.damageTimer.set(duration);
                    this.invulnerable = this._temporarilyInvulnerable = true;

                    // pulse alpha

                    if (this.alpha === 1 && this.temporaryInvulnerabilityAlpha < 1 && this.temporaryInvulnerabilityPulses > 0) {

                        this._temporarilyInvulnerablePulsing = true;

                        // tweens

                        var hide = this.tween({
                                alpha: this.temporaryInvulnerabilityAlpha
                            },
                            {
                                name: "invulnerableHide",
                                duration: duration * 1000 / ( this.temporaryInvulnerabilityPulses * 2 ),
                                noComplete: true,
                                stopped: true
                            });
                        var show = this.tween({
                                alpha: 1
                            },
                            {
                                name: "invulnerableShow",
                                duration: duration * 1000 / ( this.temporaryInvulnerabilityPulses * 2 ),
                                noComplete: true,
                                stopped: true
                            });

                        // chain in loop

                        hide.chain(show);
                        show.chain(hide);

                        hide.start();

                    }

                }

            },

            /**
             * Ends a temporary invulnerability in progress.
             **/
            temporaryInvulnerabilityEnd: function () {

                if (this._temporarilyInvulnerable) {

                    if (this._temporarilyInvulnerablePulsing) {

                        this.tweenEnd("invulnerableHide");
                        this.tweenEnd("invulnerableShow");

                        this._temporarilyInvulnerablePulsing = false;
                        this.alpha = 1;

                    }

                    this.invulnerable = this._temporarilyInvulnerable = false;

                }

            },

            /**
             * Kills character.
             * @override
             **/
            kill: function ( silent ) {

                // remove control

                this.controllable = false;

                this.parent( silent );

            },

            /**
             * Automatically called when character finished being killed.
             * <br>- removes invulnerability
             * <br>- explodes if has {@link ig.Character#explodingDeath} and not {@link ig.EntityExtended#dieingSilently}
             * @override
             **/
            die: function () {

                this.temporaryInvulnerabilityEnd();

                if (!this.dieingSilently && this.explodingDeath) {

                    this.explode(this.deathSettings);

                }

                this.parent();

            },

            /**
             * @override
             */
            cleanup: function () {

                this.moveToUnsafe = false;
                this._lastNode = this._lastCornerNode = null;

                this.parent();

            },

            /**
             * @override
             */
            cleanupCollision: function () {

                this.parent();

                this.withinOneWay = this.withinClimbables = this.withinClimbablesAbove = this.withinStairs = false;

            },

            /**
             * Intersects and checks intersected for various properties such as one-way and climbable.
             * @override
             **/
            intersectWith: function (entity) {

                this.parent();

                if ( entity.oneWay ) {

                    this.withinOneWay = true;

                }

                if ( entity.climbable ) {

                    this.withinClimbables = true;
                    this.withinStairs = entity.climbableStairs;

                    if ( entity.pos.y < Math.round( this.pos.y + this.size.y * 0.9 ) ) {

                        this.withinClimbablesAbove = true;

                    }

                }

            },

            /**
             * Checks if character is colliding with a one-way climbable entity.
             * @override
             **/
            getIsCollidingWithOneWay: function (entityOneWay) {

                var colliding = this.parent(entityOneWay);

                // don't collide when one way is climbable and we're trying to climb

                if (colliding && entityOneWay.climbable) {

                    if (this._climbingIntentDown && entityOneWay.oneWayFacing.y < 0) {

                        this.withinClimbables = true;
                        this.withinStairs = entityOneWay.climbableStairs;
                        this.grounded = false;
                        this.climbDown();
                        return false;

                    }
                    else if (this._climbingIntentUp && entityOneWay.oneWayFacing.y > 0) {

                        this.withinClimbables = this.withinClimbablesAbove = true;
                        this.withinStairs = entityOneWay.climbableStairs;
                        this.climbUp();
                        return false;

                    }

                }

                return colliding;

            },

            /**
             * Collides with another entity.
             * <br>- sets grounded if other entity is {@link ig.EntityExtended.COLLIDES.ACTIVE} or {@link ig.EntityExtended.COLLIDES.FIXED}
             * <br>- updates visible and animation if collision caused character to stop moving
             * @override
             **/
            collideWith: function (entity, dirX, dirY, nudge, vel, weak) {

                this.parent(entity, dirX, dirY, nudge, vel, weak);

                if ( !weak || this === weak ) {

                    // colliding vertical

                    if (dirY < 0 && this.jumping) {

                        this.jumpEnd();

                    }

                    // update visible, and in turn current animation, in case collision caused this to stop moving
                    // cant just update current animation as flip has to be handled in update visible

                    if ( this.changed ) {

                        this.updateVisible();

                    }

                }

            },

            /**
             * Changes character by updating various actions.
             * <br>- updates temporary invulnerability
             * <br>- regenerates stats
             * <br>- updates abilities
             * <br>- updates jump
             * <br>- updates climb
             * @override
             **/
            updateChanges: function () {

                this.parent();

                // attempt to end temporary invulnerability

                if (this._temporarilyInvulnerable && this.invulnerable && this.damageTimer.delta() >= 0) {

                    this.temporaryInvulnerabilityEnd();

                }

                // regen

                if (this.regen && this.regenTimer.delta() >= 0) {

                    this.regenTimer.set(this.regenDelay);

                    this.regenerate();

                }

                // abilities

                this.abilities.update();

                // jumping

                this.jumpUpdate();

                // climbing

                this.climbUpdate();

                // ungrounded

                if (this.hasGravity && !this.grounded && !this.climbing) {

                    this.ungroundedFor += ig.system.tick;

                    if ( this.ungroundedFor > this.ungroundedForAndFallingThreshold ) {

                        this.falling = true;

                    }

                }
                else {

                    this.ungroundedFor = 0;

                }

            },

            /**
             * Updates various velocities and frictions based on whether grounded, climbing, etc.
             * @override
             **/
            updateVelocity: function () {

                var control;

                // control and and max velocity

                if (this.climbing) {

                    _utv2.copy(this.maxVel, this.maxVelClimbing);
                    control = this.climbingControl;

                }
                else if (this.grounded) {

                    _utv2.copy(this.maxVel, this.maxVelGrounded);
                    control = 1;

                }
                else {

                    _utv2.copy(this.maxVel, this.maxVelUngrounded);
                    control = this.jumpControl;

                }

                // change friction based on standing instead of grounding for correct behavior

                if (this.standing || this.climbing) {

                    _utv2.copy(this.friction, this.frictionGrounded);

                }
                else {

                    _utv2.copy(this.friction, this.frictionUngrounded);

                }

                this.vel.x = this.getNewVelocity(this.vel.x, this.accel.x * control, this.friction.x, this.maxVel.x);
                this.vel.y = this.getNewVelocity(this.vel.y, this.accel.y * control, this.friction.y, this.maxVel.y);

            },

            /**
             * Updates visible and current animation via {@link ig.Character#updateCurrentAnim}.
             * @override
             **/
            updateVisible: function () {

                if ( this.animAutomatic && !this._killed ) {

                    this.updateCurrentAnim();

                }

                this.parent();

            },

            /**
             * Updates the current animation based on the status of the character.
             * <br>- tries to swap to climb animation when climbing
             * <br>- tries to swap to stairs animation when climbing stairs
             * <br>- tries to swap to jump animation when jumping
             * <br>- tries to swap to fall animation when in air but not jumping
             * <br>- tries to swap to moveX/Y/Left/Right/Up/Down animation when moving
             * <br>- defaults to idle animation
             * @returns {Boolean} whether using non-idle animation
             **/
            updateCurrentAnim: function () {

                var anims = this.anims;
				var anim;

                if (this.performance === ig.EntityExtended.PERFORMANCE.DYNAMIC) {
					
					if (this.climbing === true) {

						if ( this.withinStairs ) {

							if ( this.moving ) {

								this.currentAnim = anims[ this.getDirectionalAnimName( "stairs" ) ];

								return true;

							}

						}
						else {

							this.currentAnim = anims[ this.getDirectionalAnimName( "climb" ) ];
							this.currentAnim.stop = !this.moving;
							this.currentAnim.reverse = this.vel.y > 0;

							return true;

						}

					}
					else if (!this.grounded) {

						if (this.jumping) {
							
							anim = anims[ this.getDirectionalAnimName( "jump" ) ];

							if ( this.currentAnim !== anim ) {
	
								this.currentAnim = anim;
								this.currentAnim.playFromStart( true );

							}

							return true;

						}
						else if (this.falling) {

							this.currentAnim = anims[ this.getDirectionalAnimName( "fall" ) ];
							
							return true;

						}

					}

                    if ( this.moving ) {

                        this.currentAnim = anims[ this.getDirectionalAnimName( "move" ) ];

                        return true;

                    }

                }
				
				// idle fallback
				
				anim = anims[ this.getDirectionalAnimName( "idle" ) ];
				
				if ( this.currentAnim !== anim ) {
					
					this.currentAnim = anim;
					this.currentAnim.playFromStart();
					
				}

            }

        });

    });
