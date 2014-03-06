ig.module(
    'plusplus.entities.effect-electricity'
)
    .requires(
        'plusplus.core.config',
        'plusplus.abstractities.effect'
)
    .defines(function() {

        var _c = ig.CONFIG;

        /**
         * Entity effect to show electricity.
         * <span class="alert"><strong>IMPORTANT:</strong> this entity has a defined size and animation sheet!</span>
         * @class
         * @extends ig.Effect
         * @memberof ig
         * @author Collin Hover - collinhover.com
         */
        ig.EntityEffectElectricity = ig.global.EntityEffectElectricity = ig.Effect.extend( /**@lends ig.EntityEffectElectricity.prototype */ {

            /**
             * Electricity effect does not need to move.
             * @override
             * @default static
             */
            performance: ig.EntityExtended.PERFORMANCE.STATIC,

            /**
             * @override
             * @default 32x32
             */
            size: {
                x: 32,
                y: 32
            },

            /**
             * Electricity effect does not change animations.
             * @override
             */
            animAutomatic: false,

            /**
             * @override
             * @default effect_electricity.png
             */
            animSheet: new ig.AnimationSheet(_c.PATH_TO_MEDIA + 'effect_electricity.png', 32, 32),

            /**
             * @override
             */
            animSettings: {
                moveX: {
                    sequence: [0, 1, 2, 3],
                    frameTime: 0.15
                }
            }

        });

    });
