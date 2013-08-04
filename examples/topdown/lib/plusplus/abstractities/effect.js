ig.module(
        'plusplus.abstractities.effect'
    )
    .requires(
        'plusplus.abstractities.particle'
    )
    .defines(function () {

        /**
         * Entity effect.
         * <br>- effects are particularly useful for abilities
         * <span class="alert alert-error"><strong>IMPORTANT:</strong> this is an abstract entity that should be extended.</span>
         * @class
         * @extends ig.Particle
         * @memberof ig
         * @author Collin Hover - collinhover.com
         * @see ig.Ability
         */
        ig.Effect = ig.Particle.extend(/**@lends ig.Effect.prototype */{

            /**
             * @override
             * @default
             */
            fadeAfterSpawnDuration: 0,

            /**
             * @override
             * @default
             */
            fadeBeforeDeathDuration: 0,

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
            randomFlip: false

        });

    });