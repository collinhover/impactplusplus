ig.module(
        'plusplus.entities.effect-electricity'
    )
    .requires(
        'plusplus.core.config',
        'plusplus.abstractities.effect',
        'plusplus.helpers.utilsvector2'
    )
    .defines(function () {

        var _c = ig.CONFIG;
        var _utv2 = ig.utilsvector2;

        /**
         * Entity effect to show electricity.
         * <span class="alert"><strong>IMPORTANT:</strong> this entity has a defined size and animation sheet!</span>
         * @class
         * @extends ig.Effect
         * @memberof ig
         * @author Collin Hover - collinhover.com
         */
        ig.EntityEffectElectricity = ig.global.EntityEffectElectricity = ig.Effect.extend(/**@lends ig.EntityEffectElectricity.prototype */{

            /**
             * @override
             * @default 32x32
             */
            size: _utv2.vector(32, 32),

            /**
             * @override
             * @default effect_electricity.png
             */
            animSheet: new ig.AnimationSheet(_c.PATH_TO_MEDIA + 'effect_electricity.png', 32, 32),

            /**
             * @override
             * @property {Object} idle - idle animation
             * @property {Object} idle.sequence - frames 0, 1, 2, 3
             * @property {Object} idle.frameTime - 0.15
             */
            animSettings: {
                idle: {
                    sequence: [0,1,2,3],
                    frameTime: 0.15
                }
            }

        });

    });