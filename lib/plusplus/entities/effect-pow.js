ig.module(
        'plusplus.entities.effect-pow'
    )
    .requires(
        'plusplus.core.config',
        'plusplus.abstractities.effect',
        'plusplus.helpers.utilsvector2'
    )
    .defines(function () {
        "use strict";

        var _c = ig.CONFIG;
        var _utv2 = ig.utilsvector2;

        /**
         * Entity pow effect.
         * <span class="alert"><strong>IMPORTANT:</strong> this entity has a defined size and animation sheet!</span>
         * @class
         * @extends ig.Effect
         * @memberof ig
         * @author Collin Hover - collinhover.com
         */
        ig.EntityEffectPow = ig.global.EntityEffectPow = ig.Effect.extend(/**@lends ig.EntityEffectPow.prototype */{

            /**
             * Pow effect does not need to move.
             * @override
             * @default static
             */
            performance: _c.STATIC,

            /**
             * @override
             * @default 8x8
             */
            size: _utv2.vector(8, 8),

            /**
             * @override
             * @default effect_pow.png
             */
            animSheet: new ig.AnimationSheet(_c.PATH_TO_MEDIA + 'effect_pow.png', 8, 8),

            /**
             * @override
             * @property {Object} idle - idle animation
             * @property {Object} idle.sequence - frames 0, 1
             * @property {Object} idle.frameTime - 0.125
             */
            animSettings: {
                idle: {
                    sequence: [0,1],
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