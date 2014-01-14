ig.module(
    'plusplus.abstractities.particle'
)
    .requires(
        'plusplus.core.config',
        'plusplus.core.timer',
        'plusplus.core.entity'
)
    .defines(function() {
        "use strict";

        var _c = ig.CONFIG;

        /**
         * Base entity class for particles.
         * <br>- by default, particles do not collide with other entities
         * <br>- by default, particles collide with collision map
         * <span class="alert alert-error"><strong>IMPORTANT:</strong> this is an abstract entity that should be extended.</span>
         * @class
         * @extends ig.EntityExtended
         * @memberof ig
         * @author Collin Hover - collinhover.com
         * @author Dominic Szablewski
         * @author Jesse Freeman
         * @example
         * // by default, the abstract particle looks for a set of animations
         * // to use as the current animation based on various properties
         * // the set is controlled by the animsExpected property
         * particle.animsExpected = [ "move" ];
         * // this behavior can be skipped using the "animAutomatic" property
         * particle.animAutomatic = false;
         * // the actual animation switching is done in the updateCurrentAnim method
         * // for example, the particle is expected to always be in motion
         * // so the current animation is set to move
         * particle.currentAnim = particle.getDirectionalAnimName( "move" );
         * // note here the directional animation name
         * // animations in Impact++ are directional and based on flip and facing
         * // so if an entity can flip X and Y
         * // you should have animations for both X and Y
         * // i.e. "moveX" and "moveY"
         * // if an entity cannot flip X and Y
         * // you should have animations for Up, Down, Left, and Right
         * // i.e. "moveUp", "moveDown", "moveLeft", "moveRight"
         **/
        ig.Particle = ig.EntityExtended.extend( /**@lends ig.Particle.prototype */ {

            /**
             * Whether entity is allowed to set own {@link ig.EntityExtended#currentAnim} automatically based on current state.
             * @type Boolean
             * @see ig.CONFIG.PARTICLE.ANIM_AUTOMATIC
             */
            animAutomatic: _c.PARTICLE.ANIM_AUTOMATIC,

            /**
             * List of names of animations this entity is expected to have.
             * <span class="alert"><strong>IMPORTANT:</strong> when any animation in this list is not present, it will be filled by a placeholder animation!</span>
             * @type Array
             */
            animsExpected: [
                "move"
            ],

            /**
             * Particles should almost always be rendered above anything else.
             * @override
             * @see ig.CONFIG.Z_INDEX_ABOVE_ALL
             */
            zIndex: _c.Z_INDEX_ABOVE_ALL,

            /**
             * Particle performance should allow for full collision map interaction.
             * @override
             * @default dynamic
             */
            performance: ig.EntityExtended.PERFORMANCE.DYNAMIC,

            /**
             * @override
             * @default 1x1
             */
            size: {
                x: 1,
                y: 1
            },

            /**
             * @override
             * @default 150x150
             */
            maxVel: {
                x: 150,
                y: 150
            },

            /**
             * @override
             * @default 20 x 0
             */
            friction: {
                x: 20,
                y: 0
            },

            /**
             * Particles always bounce.
             * @type Number
             * @override
             * @default
             */
            minBounceVelocity: 0,

            /**
             * Particles have a high bounciness.
             * @type Number
             * @override
             * @default
             */
            bounciness: 0.6,

            /**
             * Total time from birth until death.
             * @type Number
             * @default
             */
            lifeDuration: 1,

            /**
             * Duration from birth at which particle will be fully faded in.
             * @type Number
             * @default
             */
            fadeAfterSpawnDuration: 0,

            /**
             * Duration from death at which particle will start to fade out.
             * @type Number
             * @default
             */
            fadeBeforeDeathDuration: 0.5,

            /**
             * Whether particle should kill self when hitting something.
             * @type Boolean
             * @default
             */
            collisionKills: false,

            /**
             * Whether particle should stick to the first thing it collides with.
             * @type Boolean
             * @default
             */
            collisionSticky: false,

            /**
             * Whether to randomize velocity on initialize.
             * <span class="alert"><strong>IMPORTANT:</strong> this only works if the particle has a velocity above 0, via {@link ig.EntityExtended#vel}.</span>
             * @type Boolean
             * @default
             */
            randomVel: true,

            /**
             * Whether to randomize velocity on either side of zero on initialize.
             * <span class="alert"><strong>IMPORTANT:</strong> this only works if the particle has a velocity above 0, via {@link ig.EntityExtended#vel}.</span>
             * @type Boolean
             * @default
             */
            randomDoubleVel: true,

            /**
             * Whether to randomize particle flip on initialize.
             * <span class="alert"><strong>IMPORTANT:</strong> this modifies {@link ig.EntityExtended#flip}.</span>
             * @type Boolean
             * @default
             */
            randomFlip: true,

            /**
             * Whether to set particle flip based on velocity on init.
             * <span class="alert"><strong>IMPORTANT:</strong> this modifies {@link ig.EntityExtended#flip}.</span>
             * @type Boolean
             * @default
             */
            velocityFlip: true,

            /**
             * Timer used to count down life time.
             * <br>- created on init
             * @type ig.Timer
             */
            lifeTimer: null,

            // internal properties, do not modify

            _fadeAfterInv: 0,
            _fadeBeforeDiff: 0,
            _fadeBeforeInv: 0,

            /**
             * @override
             **/
            initProperties: function() {

                this.parent();

                this.lifeTimer = new ig.Timer();

            },

            /**
             * @override
             **/
            resetExtras: function() {

                this.parent();

                // check all expected animations so we don't have to check while in game

                if (this.animAutomatic && !this._animsPlaceheld) {

                    this._animsPlaceheld = true;

                    this.placeholdAnims();

                }

                // invert fades so we can multiply instead of dividing

                if (this.fadeAfterSpawnDuration) {

                    this._fadeAfterInv = 1 / (this.fadeAfterSpawnDuration);

                }

                if (this.fadeBeforeDeathDuration) {

                    this._fadeBeforeInv = 1 / (this.fadeBeforeDeathDuration);
                    this._fadeBeforeDiff = this.lifeDuration - this.fadeBeforeDeathDuration;

                }

            },

            /**
             * Ensures all expected animations are present.
             * <span class="alert"><strong>IMPORTANT:</strong> when an expected animation is missing, it is placeholded by the init anim or the current anim.</span>
             **/
            placeholdAnims: function() {

                if (this.animsExpected.length > 0) {

                    var anims = this.anims;
                    var animInitPlaceholder;

                    if (this.animInit instanceof ig.Animation) {

                        animInitPlaceholder = animInit;

                    } else if (this.animInit && anims[this.animInit]) {

                        animInitPlaceholder = anims[this.animInit];

                    } else {

                        animInitPlaceholder = anims['idle'] || this.currentAnim;

                    }

                    for (var i = 0, il = this.animsExpected.length; i < il; i++) {

                        var animName = this.animsExpected[i];
                        var animPlaceholder = anims[animName] || animInitPlaceholder;

                        if (animPlaceholder) {

                            if (!anims[animName + "X"]) {

                                anims[animName + "X"] = animPlaceholder;

                            }

                            if (!anims[animName + "Right"]) {

                                anims[animName + "Right"] = anims[animName + "X"];

                            }

                            if (!anims[animName + "Left"]) {

                                anims[animName + "Left"] = anims[animName + "X"];

                            }

                            if (!anims[animName + "Y"]) {

                                anims[animName + "Y"] = animPlaceholder;

                            }

                            if (!anims[animName + "Down"]) {

                                anims[animName + "Down"] = anims[animName + "Y"];

                            }

                            if (!anims[animName + "Up"]) {

                                anims[animName + "Up"] = anims[animName + "Y"];

                            }

                        }

                    }

                }

            },

            /**
             * Called when particle added to game world.
             * <br>- sets {@link ig.Particle#lifeTimer}
             * <br>- randomizes velocity based on {@link ig.Particle#randomVel} and {@link ig.Particle#randomDoubleVel}
             * <br>- randomizes flip based on {@link ig.Particle#randomFlip}
             * @override
             **/
            ready: function() {

                this.lifeTimer.set(this.lifeDuration);

                if (this.randomVel) {

                    if (this.randomDoubleVel) {

                        this.vel.x = (Math.random() * 2 - 1) * this.vel.x;
                        this.vel.y = (Math.random() * 2 - 1) * this.vel.y;

                    } else {

                        this.vel.x *= Math.random();
                        this.vel.y *= Math.random();

                    }

                }

                if (this.currentAnim) {

                    if (this.randomFlip) {

                        this.flip.x = (Math.random() > 0.5);
                        this.flip.y = (Math.random() > 0.5);

                    } else if (this.velocityFlip) {

                        // flip based on starting velocity

                        if (this.canFlipX) {

                            this.flip.x = this.vel.x < 0 ? true : false;

                        }

                        if (this.canFlipY) {

                            this.flip.y = this.vel.y < 0 ? true : false;

                        }

                    }

                }

                this.parent();

            },

            /**
             * @override
             **/
            pause: function() {

                this.parent();

                this.lifeTimer.pause();

            },

            /**
             * @override
             **/
            unpause: function() {

                this.parent();

                this.lifeTimer.unpause();

            },

            /**
             * Handles result of particle colliding with another entity.
             * <br>- kills particle if hits another entity based on {@link ig.Particle#collisionKills}
             * <br>- sticks to entity collding with based on {@link ig.Particle#collisionSticky}
             * @override
             **/
            collideWith: function(entity, dirX, dirY, nudge, vel, weak) {

                this.parent(entity, dirX, dirY, nudge, vel, weak);

                // kill at the first thing we hit

                if (this.collisionKills) {

                    this.kill();

                }
                // sticky to first thing we hit that isn't another particle
                else if (this.collisionSticky && !(entity instanceof ig.Particle)) {

                    this.collides = ig.EntityExtended.COLLIDES.NEVER;
                    this.performance = ig.EntityExtended.PERFORMANCE.MOVABLE;

                    this.moveTo(entity, {
                        offset: {
                            x: (this.pos.x + this.size.x * 0.5) - (entity.pos.x + entity.size.x * 0.5),
                            y: (this.pos.y + this.size.y * 0.5) - (entity.pos.y + entity.size.y * 0.5)
                        }
                    });

                }

            },

            /**
             * Handles result of checking particle against collision map.
             * <br>- kills particle if hits collision map based on {@link ig.Particle#collisionKills}
             * <br>- sticks to collision map based on {@link ig.Particle#collisionSticky}
             * @override
             **/
            handleMovementTrace: function(res) {

                this.parent(res);

                // did we hit map

                if (this.collidingWithMap) {

                    // kill at the first thing we hit

                    if (this.collisionKills) {

                        this.kill();

                    }
                    // sticky to first thing we hit
                    else if (this.collisionSticky) {

                        this.applyAntiVelocity();
                        this.collides = ig.EntityExtended.COLLIDES.NEVER;
                        this.performance = ig.EntityExtended.PERFORMANCE.STATIC;

                    }

                }

            },

            /**
             * Updates particle and handles particle fade in/out as well as automatic death.
             * @override
             **/
            update: function() {

                var delta = this.lifeTimer.delta();

                if (delta >= 0) {

                    this.kill();

                } else {

                    var deltaInv = delta + this.lifeDuration;
                    this.alpha = (this.fadeAfterSpawnDuration !== 0 ? Math.min(1, deltaInv * this._fadeAfterInv) : 1) - (this.fadeBeforeDeathDuration !== 0 ? Math.max(0, (deltaInv - this._fadeBeforeDiff) * this._fadeBeforeInv) : 0);

                }

                this.parent();

            },

            /**
             * Records changes and sets particle facing based on its velocity.
             * @override
             */
            recordChanges: function(force) {

                this.parent(force);

                if (this.changed) {

                    if (_c.TOP_DOWN || this.canFlipY) {

                        if (this.movingX) {

                            this.facing.x = this.vel.x < 0 ? -1 : 1;

                            if (this.movingY) {

                                this.facing.y = this.vel.y < 0 ? -1 : 1;

                            } else {

                                this.facing.y = 0;

                            }

                        } else if (this.movingY) {

                            this.facing.x = 0;
                            this.facing.y = this.vel.y < 0 ? -1 : 1;

                        }

                    } else if (this.movingX) {

                        this.facing.x = this.vel.x < 0 ? -1 : 1;

                    }

                }

            },

            /**
             * Updates visible and current animation via {@link ig.Projectile#updateCurrentAnim}.
             * @override
             **/
            updateVisible: function() {

                if (this.animAutomatic && !this._killed) {

                    this.updateCurrentAnim();

                }

                this.parent();

            },

            /**
             * Updates the current animation and flip based on the direction of travel.
             **/
            updateCurrentAnim: function() {

                if (this.performance === ig.EntityExtended.PERFORMANCE.DYNAMIC) {

                    this.currentAnim = this.anims[this.getDirectionalAnimName("move")];

                }

            }

        });


    });
