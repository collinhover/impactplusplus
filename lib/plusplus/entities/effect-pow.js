ig.module(
    'plusplus.entities.effect-pow'
)
    .requires(
        'plusplus.core.config',
        'plusplus.abstractities.effect'
)
    .defines(function() {
        "use strict";

        var _c = ig.CONFIG;

        /**
         * Entity pow effect.
         * <span class="alert"><strong>IMPORTANT:</strong> this entity has a defined size and animation sheet!</span>
         * @class
         * @extends ig.Effect
         * @memberof ig
         * @author Collin Hover - collinhover.com
         */
        ig.EntityEffectPow = ig.global.EntityEffectPow = ig.Effect.extend( /**@lends ig.EntityEffectPow.prototype */ {

            /**
             * Pow effect does not need to move.
             * @override
             * @default static
             */
            performance: ig.EntityExtended.PERFORMANCE.STATIC,

            /**
             * @override
             * @default 8x8
             */
            size: {
                x: 8,
                y: 8
            },

            /**
             * Pow effect does not change animations.
             * @override
             */
            animAutomatic: false,

            /**
             * @override
             * @default effect_pow.png
             */
            animSheet: new ig.AnimationSheet(_c.PATH_TO_MEDIA + 'effect_pow.png', 8, 8),

            /**
             * @override
             */
            animSettings: {
                moveX: {
                    sequence: [0, 1],
                    frameTime: 0.125
                }
            },

            /**
             * @override
             * @default
             */
            lifeDuration: 0.25,

            /**
             * @override
             * @default
             */
            fadeBeforeDeathDuration: 0.05

        });

    });
