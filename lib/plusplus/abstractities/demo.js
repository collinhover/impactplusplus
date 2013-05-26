ig.module(
        'plusplus.abstractities.demo'
    )
    .requires(
        'plusplus.core.config',
        'plusplus.abstractities.particle'
    )
    .defines(function () {

        var _c = ig.CONFIG;

        /**
         * Visual demo used in tutorials.
         * <br>- use this to show a user what to do to complete the tutorial
         * <span class="alert alert-error"><strong>IMPORTANT:</strong> this is an abstract entity that should be extended.</span>
         * @class
         * @extends ig.Particle
         * @memberof ig
         * @author Collin Hover - collinhover.com
         */
        ig.Demo = ig.Particle.extend(/**@lends ig.Demo.prototype */{

            /**
             * @override
             * @default static
             */
            performance: _c.STATIC,

            /**
             * @override
             * @see ig.CONFIG.Z_INDEX_ABOVE_PLAYER
             */
            zIndex: _c.Z_INDEX_ABOVE_PLAYER,

            /**
             * @override
             * @default
             */
            fadeAfterSpawnDuration: 0.1,

            /**
             * @override
             * @default
             */
            fadeBeforeDeathDuration: 0.1,

            /**
             * @override
             * @default
             */
            randomVel: false,

            /**
             * @override
             * @default
             */
            randomDoubleVel: false,

            /**
             * @override
             * @default
             */
            randomFlip: false,

            /**
             * Demo resets its {@link ig.Particle#lifeDuration} to match its {@link ig.EntityExtended#currentAnim} duration.
             * @override
             */
            spawn: function () {

                this.parent();

                // ensure that life duration is as long as anim duration

                if (this.currentAnim) {

                    var animDuration = this.currentAnim.getDuration();

                    if (this.lifeDuration !== animDuration) {

                        this.lifeDuration = animDuration;
                        this.lifeTimer.set(this.lifeDuration);

                    }

                }

            }

        });

    });