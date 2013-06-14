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
        'plusplus.helpers.utilsvector2',
        'plusplus.helpers.tweens'
    )
    .defines(function () {
        "use strict";

        var _c = ig.CONFIG;
        var _ut = ig.utils;
        var _utm = ig.utilsmath;
        var _utv2 = ig.utilsvector2;

        /**
         * Base character entity.
         * <br>- includes handling for actions such as run, jump, climb, and use abilities
         * <br>- automatically tries to swap animations based on state via {@link ig.Character#updateCurrentAnim}
         * <br>- fixes entity movement on slopes
         * <span class="alert alert-error"><strong>IMPORTANT:</strong> this is an abstract entity that should be extended.</span>
         * @class
         * @extends ig.EntityExtended
         * @memeberof ig
         * @author Collin Hover - collinhover.com
         **/
        ig.Character = ig.EntityExtended.extend(/**@lends ig.Character.prototype */{

            /**
             * Character performance should be dynamic to be movable.
             * <br>- set to kinematic to take advantage of run, jump, and climb
             * @default dynamic
             * @override
             */
            performance: _c.DYNAMIC,

            /**
             * @default
             * @override
             */
            targetable: true,

            /**
             * Character base size should be effective size accounting for offset.
             * @type Vector2|Object
             * @see ig.CONFIG.CHARACTER.SIZE_EFFECTIVE_X
             * @see ig.CONFIG.CHARACTER.SIZE_EFFECTIVE_Y
             */
            size: _utv2.vector( _c.CHARACTER.SIZE_EFFECTIVE_X, _c.CHARACTER.SIZE_EFFECTIVE_Y ),

            /**
             * Character base offset.
             * @type Vector2|Object
             * @see ig.CONFIG.CHARACTER.SIZE_OFFSET_X
             * @see ig.CONFIG.CHARACTER.SIZE_OFFSET_Y
             */
            offset: _utv2.vector( _c.CHARACTER.SIZE_OFFSET_X, _c.CHARACTER.SIZE_OFFSET_Y ),

            /**
             * Max velocity while in air.
             * @type Vector2
             * @see ig.CONFIG.CHARACTER.MAX_VEL_UNGROUNDED_X
             * @see ig.CONFIG.CHARACTER.MAX_VEL_UNGROUNDED_Y
             */
            maxVelUngrounded: _utv2.vector(_c.CHARACTER.MAX_VEL_UNGROUNDED_X, _c.CHARACTER.MAX_VEL_UNGROUNDED_Y),

            /**
             * Max velocity while on ground.
             * @type Vector2
             * @see ig.CONFIG.CHARACTER.MAX_VEL_GROUNDED_X
             * @see ig.CONFIG.CHARACTER.MAX_VEL_GROUNDED_Y
             */
            maxVelGrounded: _utv2.vector(_c.CHARACTER.MAX_VEL_GROUNDED_X, _c.CHARACTER.MAX_VEL_GROUNDED_Y),

            /**
             * Max velocity while climbing.
             * @type Vector2
             * @see ig.CONFIG.CHARACTER.MAX_VEL_CLIMBING_X
             * @see ig.CONFIG.CHARACTER.MAX_VEL_CLIMBING_Y
             */
            maxVelClimbing: _utv2.vector(_c.CHARACTER.MAX_VEL_CLIMBING_X, _c.CHARACTER.MAX_VEL_CLIMBING_Y),

            /**
             * Friction while in air.
             * @type Vector2
             * @see ig.CONFIG.CHARACTER.FRICTION_UNGROUNDED_X
             * @see ig.CONFIG.CHARACTER.FRICTION_UNGROUNDED_Y
             */
            frictionUngrounded: _utv2.vector(_c.CHARACTER.FRICTION_UNGROUNDED_X, _c.CHARACTER.FRICTION_UNGROUNDED_Y),

            /**
             * Friction while on ground.
             * @type Vector2
             * @see ig.CONFIG.CHARACTER.FRICTION_GROUNDED_X
             * @see ig.CONFIG.CHARACTER.FRICTION_GROUNDED_Y
             */
            frictionGrounded: _utv2.vector(_c.CHARACTER.FRICTION_GROUNDED_X, _c.CHARACTER.FRICTION_GROUNDED_Y),

            /**
             * Movement speed to be applied to acceleration.
             * @type Vector2
             * @see ig.CONFIG.CHARACTER.SPEED_X
             * @see ig.CONFIG.CHARACTER.SPEED_Y
             */
            speed: _utv2.vector(_c.CHARACTER.SPEED_X, _c.CHARACTER.SPEED_Y),

            /**
             * Whether character is able to jump.
             * @type Boolean
             * @default
             */
            canJump: true,

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
            canClimb: true,

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
             * @type ig.TimerExtended
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
             * @type ig.TimerExtended
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
            mimicLevel: _c.RANKS_MAP[ "NONE" ],

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
             * Duration after character leaves ground during which they can still jump.
             * <br>- this is intended to help players with slower reaction time
             * <br>- this does not allow another jump while jumping
             * @type Number
             * @see ig.CONFIG.CHARACTER.UNGROUNDED_FOR_THRESHOLD
             */
            ungroundedForThreshold: _c.CHARACTER.UNGROUNDED_FOR_THRESHOLD,

            /**
             * Whether character is intersecting a climbable entity.
             * <br>- type of number but functions as boolean
             * @type Number
             */
            withinClimbables: 0,

            /**
             * Whether character is intersecting a one-way entity.
             * <br>- type of number but functions as boolean
             * @type Number
             */
            withinOneWay: 0,

            /**
             * Whether character is jumping.
             * <br>- to check if character is not on ground, use {@link ig.Character#grounded}.
             * @type Boolean
             */
            jumping: false,

            /**
             * Whether character is in initial, ascending portion of jump.
             * @type Boolean
             */
            jumpAscend: false,

            /**
             * Whether character climbing.
             * @type Boolean
             */
            climbing: false,

            /**
             * How long character will continue to try to move to something while stuck.
             * @type Number
             * @see ig.CONFIG.CHARACTER.MOVE_TO_STUCK_FOR_THRESHOLD
             */
            moveToStuckForThreshold: _c.CHARACTER.MOVE_TO_STUCK_FOR_THRESHOLD,

            // internal properties, do not modify

            _ungroundedFor: 0,
            
            _jumpPushing: false,
            _jumpWhileClimbing: false,

            _climbingIntentDown: false,
            _climbingIntentUp: false,
            
            _movingToSpeed: false,
            _movingToWithoutJump: false,
            _moveToPos: _utv2.vector(),
            _moveToPosAt: _utv2.vector(),
            _moveToStuckFor: 0,

            _temporarilyInvulnerable: false,
            _temporarilyInvulnerablePulsing: false,

            _cleanWithinClimbable: false,

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

                this.regenTimer = new ig.TimerExtended(0, this);
                this.damageTimer = new ig.TimerExtended(0, this);

                // stats

                this.energyMax = this.energy;

                // abilities

                this.abilities = this.abilitiesOriginal = new ig.Hierarchy();

            },

            /**
             * Resets character movement, velocity, and flip.
             * @override
             **/
            resetExtras: function () {

                this.parent();

                this.moveToStop();
                this.applyAntiVelocity();

                this.flip = false;

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

                // restore stats to full

                this.restoreStats(this);

                // make temporarily invulnerable

                this.temporaryInvulnerability();

                // remove control

                this.controllable = false;

                this.parent();

            },

            /**
             * Called when character spawned.
             * @override
             **/
            spawn: function () {

                this.parent();

                // return control

                this.controllable = true;

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
             * Attempts to move to location, and stops if reached or stuck in place for too long.
             * <br>- currently moves directly to, and needs to be improved with some sort of pathfinding
             * @param {Vector2} position position to move to.
             * @param {Boolean} [withoutJump=false] do not jump if stuck or in air.
             **/
            moveToLocation: function (position, withoutJump) {

                if (position) {

                    var targetUpdated;

                    if (_ut.isNumber(position.x) && this._moveToPos.x !== position.x) {

                        this._moveToPos.x = position.x;
                        targetUpdated = true;

                    }

                    if (_ut.isNumber(position.y) && this._moveToPos.y !== position.y) {

                        this._moveToPos.y = position.y;
                        targetUpdated = true;

                    }

                    if (targetUpdated === true) {

                        this._moveToPosAt.x = this.pos.x;
                        this._moveToPosAt.y = this.pos.y;
                        this.movingTo = true;
                        this._moveToStuckFor = 0;
                        this.movedTo = false;

                    }

                }

                if (typeof withoutJump === 'boolean' && this._movingToWithoutJump !== withoutJump) {

                    this._movingToWithoutJump = withoutJump;

                }

            },

            /**
             * Moves character left at {@link ig.Character#speed}.
             * @param {Number} [mod] modifier to apply to speed.
             */
            moveToLeft: function (mod) {

                this._movingToSpeed = true;
                if (mod) {
                    this.accel.x = -this.speed.x * mod;
                }
                else {
                    this.accel.x = -this.speed.x;
                }
                this.flip = true;

            },

            /**
             * Moves character right at {@link ig.Character#speed}.
             * @param {Number} [mod] modifier to apply to speed.
             */
            moveToRight: function (mod) {

                this._movingToSpeed = true;
                if (mod) {
                    this.accel.x = this.speed.x * mod;
                }
                else {
                    this.accel.x = this.speed.x;
                }
                this.flip = false;

            },

            /**
             * Moves character up at {@link ig.Character#speed}.
             * @param {Number} [mod] modifier to apply to speed.
             */
            moveToUp: function (mod) {

                this._movingToSpeed = true;
                if (mod) {
                    this.accel.y = -this.speed.y * mod;
                }
                else {
                    this.accel.y = -this.speed.y;
                }

            },

            /**
             * Moves character down at {@link ig.Character#speed}.
             * @param {Number} [mod] modifier to apply to speed.
             */
            moveToDown: function (mod) {

                this._movingToSpeed = true;
                if (mod) {
                    this.accel.y = this.speed.y * mod;
                }
                else {
                    this.accel.y = this.speed.y;
                }

            },

            /**
             * @override
             **/
            moveToHere: function () {

                this.parent();

                this._movingToSpeed = false;

            },

            /**
             * Zeroes current horizontal movement.
             */
            moveToStopHorizontal: function () {

                this.moveToHere();
                this.accel.x = 0;

            },

            /**
             * Zeroes current vertical movement.
             */
            moveToStopVertical: function () {

                this.moveToHere();
                this.accel.y = 0;

            },

            /**
             * Zeroes all current movement.
             */
            moveToStop: function () {

                this.moveToStopHorizontal();
                this.moveToStopVertical();

            },

            /**
             * @override
             **/
            moveToUpdate: function () {

                if (this.movingTo === true) {

                    var dx = this._moveToPos.x - this.pos.x;

                    // at target position

                    if (_utm.almostEqual(dx, 0, 1)) {

                        this.movedTo = true;
                        this.moveToStop();

                    }
                    // continue to position
                    else {

                        if (dx < 0) {

                            this.moveToLeft();

                        }
                        else {

                            this.moveToRight();

                        }

                    }

                    // check if stuck

                    if (this.movedTo !== true) {

                        if (_utm.almostEqual(this._moveToPosAt.x, this.pos.x, _c.PRECISION_ZERO) && _utm.almostEqual(this._moveToPosAt.y, this.pos.y, _c.PRECISION_ZERO)) {

                            this._moveToStuckFor += ig.system.tick;

                            // stuck for too long, stop trying

                            if (this._moveToStuckFor >= this.moveToStuckForThreshold) {

                                this.moveToStop();

                            }

                        }
                        // not stuck, update position at
                        else {

                            this._moveToStuckFor = 0;
                            this._moveToPosAt.x = this.pos.x;
                            this._moveToPosAt.y = this.pos.y;

                        }

                    }

                }

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

                    if (( this.grounded || this.withinClimbables || this._ungroundedFor < this.ungroundedForThreshold ) && this.jumping !== true) {

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

                    this.jumpPush();

                    if (this.vel.y >= 0) {

                        this.jumpAscend = false;

                    }

                    if (!this._jumpPushing && !this.jumpAscend) {

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

                        this._ungroundedFor = 0;
                        this.applyAntiVelocityY();

                    }

                    this.jumpAscend = true;
                    this.jumpStepsRemaining--;

                    this.moveToUp(this.jumpForce);

                    if (this.jumpStepsRemaining <= 0) {

                        this._jumpPushing = false;
                        this.moveToStopVertical();

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

                    if (this.climbing !== true && !( this._climbingIntentDown && this.grounded )) {

                        this.climbing = true;
                        this.grounded = this._ungroundedFor = 0;

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

                    if (!this.withinClimbables || this.grounded) {

                        this.climbEnd();

                    }
                    else {

                        this.applyAntiGravity();

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
                    entity: this
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
             * <br>- does nothing if {@link ig.Character#damageDelay} is set to 0
             **/
            temporaryInvulnerability: function () {

                if (!this.invulnerable && this.damageDelay > 0) {

                    this.damageTimer.set(this.damageDelay);
                    this.invulnerable = this._temporarilyInvulnerable = true;

                    // pulse alpha

                    if (this.temporaryInvulnerabilityAlpha < 1 && this.temporaryInvulnerabilityPulses > 0) {

                        this._temporarilyInvulnerablePulsing = true;

                        // tweens

                        var hide = this.tween({
                                alpha: this.temporaryInvulnerabilityAlpha
                            },
                            {
                                name: "invulnerableHide",
                                duration: this.damageDelay * 1000 / ( this.temporaryInvulnerabilityPulses * 2 ),
                                noComplete: true,
                                stopped: true
                            });
                        var show = this.tween({
                                alpha: 1
                            },
                            {
                                name: "invulnerableShow",
                                duration: this.damageDelay * 1000 / ( this.temporaryInvulnerabilityPulses * 2 ),
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

                    }

                    this.invulnerable = this._temporarilyInvulnerable = false;
                    this.alpha = 1;

                }

            },

            /**
             * Kills character.
             * @override
             **/
            kill: function () {

                // remove control

                this.controllable = false;

                this.parent();

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
             * Intersects and checks intersected for various properties such as one-way and climbable.
             * @override
             **/
            intersectWith: function (entity) {

                this.withinOneWay |= entity.oneWay;

                if ( entity.climbable ) {

                    this.withinClimbables = 1;
                    this._cleanWithinClimbable = false;

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

                        this.standing = this.grounded = 0;
                        this.withinClimbables = 1;
                        this._cleanWithinClimbable = false;
                        this.climbDown();
                        return false;

                    }
                    else if (this._climbingIntentUp && entityOneWay.oneWayFacing.y > 0) {

                        this.standing = this.grounded = 0;
                        this.withinClimbables = 1;
                        this._cleanWithinClimbable = false;
                        this.climbUp();
                        return false;

                    }
                    else {

                        this.withinClimbables = 0;

                    }

                }

                return colliding;

            },

            /**
             * Collides with another entity.
             * <br>- sets grounded if other entity is {@link ig.Entity.COLLIDES.ACTIVE} or {@link ig.Entity.COLLIDES.FIXED}
             * <br>- updates visible and animation if collision caused character to stop moving
             * @override
             **/
            collideWith: function (entity, axis, strong) {

                this.parent(entity, axis, strong);

                // other is a fixed or active entity

                if (entity.collides >= ig.Entity.COLLIDES.ACTIVE) {

                    // checking on y axis

                    if (axis === 'y') {

                        // ground character

                        if (entity.last.y > this.last.y) {

                            this.standing = this.grounded = 1;

                        }
                        else if (this.jumping) {

                            this.jumpEnd();

                        }

                    }

                }

                // update visible, and in turn current animation, in case collision caused this to stop moving
                // cant just update current animation as flip has to be handled in update visible

                if (!strong && this.changed) {

                    this.updateVisible();

                }

            },

            /**
             * @override
             **/
            update: function () {

                this._climbingIntentDown = this._climbingIntentUp = false;

                this.parent();

            },

            /**
             * @override
             **/
            updateCleanup: function () {

                // reset collision properties

                if ( this.changed ) {

                    this.withinOneWay = 0;

                    // reset within climbable on next update

                    if ( this._cleanWithinClimbable ) {

                        this._cleanWithinClimbable = false;
                        this.withinClimbables = 0;

                    }
                    else {

                        this._cleanWithinClimbable = true;

                    }

                }

                this.parent();

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

                // grounded

                if (this.grounded) {

                    this._ungroundedFor = 0;

                }
                else {

                    this._ungroundedFor += ig.system.tick;

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

                // animation

                var playAnim = this.updateCurrentAnim();

                if (this.currentAnim) {

                    this.currentAnim.stop = !playAnim;

                }

                this.parent();

            },

            /**
             * Updates the current animation based on the status of the character.
             * <br>- tries to swap to climb animation when climbing
             * <br>- tries to swap to jump animation when jumping
             * <br>- tries to swap to fall animation when in air but not jumping
             * <br>- tries to swap to run animation when moving
             * <br>- defaults to idle animation
             * <span class="alert"><strong>IMPORTANT:</strong> plays or stops animations automatically based on whether moving.</span>
             **/
            updateCurrentAnim: function () {

                var playAnim = this.moving;

                if (this.performance === _c.KINEMATIC) {

                    if (this.climbing === true && this.anims.climb) {

                        this.currentAnim = this.anims.climb;

                    }
                    else if (!this.grounded) {

                        if (this.jumping === true && this.anims.jump) {

                            this.currentAnim = this.anims.jump;

                        }
                        else if (this.anims.fall) {

                            this.currentAnim = this.anims.fall;

                        }

                    }
                    else {

                        if (this.movingX && this.anims.run) {

                            this.currentAnim = this.anims.run;

                        }
                        else if (this.anims.idle) {

                            playAnim = true;
                            this.currentAnim = this.anims.idle;

                        }

                    }

                }
                else {

                    if (this.anims.idle) {

                        playAnim = true;
                        this.currentAnim = this.anims.idle;

                    }

                }

                return playAnim;

            }

        });

    });