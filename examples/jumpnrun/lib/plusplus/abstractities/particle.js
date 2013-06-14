ig.module(
        'plusplus.abstractities.particle'
    )
    .requires(
        'plusplus.core.config',
        'plusplus.core.timer',
        'plusplus.core.entity',
        'plusplus.helpers.utilsvector2'
    )
    .defines(function () {
        "use strict";

        var _c = ig.CONFIG;
        var _utv2 = ig.utilsvector2;

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
         **/
        ig.Particle = ig.EntityExtended.extend(/**@lends ig.Particle.prototype */{

            /**
             * Particle performance should allow for full collision map interaction.
             * @override
             * @default kinematic
             */
            performance: _c.KINEMATIC,

            /**
             * @override
             * @default 1x1
             */
            size: _utv2.vector(1, 1),

            /**
             * @override
             * @default 150x150
             */
            maxVel: _utv2.vector(150, 150),

            /**
             * @override
             * @default 20 x 0
             */
            friction: _utv2.vector(20, 0),

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
             * Timer used to count down life time.
             * <br>- created on init
             * @type ig.TimerExtended
             */
            lifeTimer: null,

            /**
             * @override
             **/
            initProperties: function () {

                this.parent();

                this.lifeTimer = new ig.TimerExtended(0, this);

            },

            /**
             * Called when particle added to game world.
             * <br>- sets {@link ig.Particle#lifeTimer}
             * <br>- randomizes velocity based on {@link ig.Particle#randomVel} and {@link ig.Particle#randomDoubleVel}
             * <br>- randomizes flip based on {@link ig.Particle#randomFlip}
             * @override
             **/
            ready: function () {

                this.lifeTimer.set(this.lifeDuration);

                if (this.randomVel) {

                    if (this.randomDoubleVel) {

                        this.vel.x = (Math.random() * 2 - 1) * this.vel.x;
                        this.vel.y = (Math.random() * 2 - 1) * this.vel.y;

                    }
                    else {

                        this.vel.x *= Math.random();
                        this.vel.y *= Math.random();

                    }

                }

                if (this.currentAnim) {

                    if (this.randomFlip) {

                        this.currentAnim.flip.x = (Math.random() > 0.5);
                        this.currentAnim.flip.y = (Math.random() > 0.5);

                    }

                }

                this.parent();

            },

            /**
             * Updates particle and handles particle fade in/out as well as automatic death.
             * @override
             **/
            update: function () {

                var delta = this.lifeTimer.delta();

                if (delta >= 0) {

                    this.kill();

                }
                else {

                    var deltaInv = delta + this.lifeDuration;

                    if (this.fadeBeforeDeathDuration && deltaInv >= this.lifeDuration - this.fadeBeforeDeathDuration) {

                        this.alpha = deltaInv.map(
                            this.lifeDuration - this.fadeBeforeDeathDuration, this.lifeDuration,
                            this.resetState.alpha, 0
                        );

                    }
                    else if (this.fadeAfterSpawnDuration && deltaInv <= this.fadeAfterSpawnDuration) {

                        this.alpha = deltaInv.map(
                            0, this.fadeAfterSpawnDuration,
                            0, this.resetState.alpha
                        );

                    }
                    else {

                        this.alpha = this.resetState.alpha;

                    }

                }

                this.parent();

            },

            /**
             * Handles result of checking particle against collision map.
             * <br>- kills particle if hits collision map based on {@link ig.Particle#collisionKills}
             * <br>- sticks to collision map based on {@link ig.Particle#collisionSticky}
             * @override
             **/
            handleMovementTrace: function (res) {

                this.parent(res);

                // did we hit something

                if (res.collision.x || res.collision.y || res.slope) {

                    // kill at the first thing we hit

                    if (this.collisionKills) {

                        this.kill();

                    }
                    // sticky to first thing we hit
                    else if (this.collisionSticky) {

                        this.collides = ig.Entity.COLLIDES.NONE;
                        this.performance = _c.STATIC;

                    }

                }

            }

        });


    });