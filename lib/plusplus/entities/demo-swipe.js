ig.module(
    'plusplus.entities.demo-swipe'
)
    .requires(
        'plusplus.core.config',
        'plusplus.abstractities.demo'
)
    .defines(function() {

        var _c = ig.CONFIG;

        /**
         * Visual demo used in tutorials for swiping.
         * <span class="alert"><strong>IMPORTANT:</strong> this entity has a defined size and animation sheet!</span>
         * @class
         * @extends ig.Demo
         * @memberof ig
         * @author Collin Hover - collinhover.com
         */
        ig.EntityDemoSwipe = ig.global.EntityDemoSwipe = ig.Demo.extend( /**@lends ig.EntityDemoSwipe.prototype */ {

            /**
             * Swipe demo will likely move.
             * @override
             * @default movable
             */
            performance: ig.EntityExtended.PERFORMANCE.MOVABLE,

            /**
             * @override
             * @default 64 x 64
             */
            size: {
                x: 64,
                y: 64
            },

            /**
             * @override
             * @default demos_gestures_swipe.png
             */
            animSheet: new ig.AnimationSheet(_c.PATH_TO_MEDIA + 'demos_gestures_swipe.png', 64, 64),

            /**
             * @override
             */
            animSettings: {
                moveX: {
                    sequence: [0, 1, 2],
                    frameTime: 0.2
                }
            }

        });

    });
