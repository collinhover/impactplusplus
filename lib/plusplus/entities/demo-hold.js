ig.module(
    'plusplus.entities.demo-hold'
)
    .requires(
        'plusplus.core.config',
        'plusplus.abstractities.demo'
)
    .defines(function() {

        var _c = ig.CONFIG;

        /**
         * Visual demo used in tutorials for holding.
         * <span class="alert"><strong>IMPORTANT:</strong> this entity has a defined size and animation sheet!</span>
         * @class
         * @extends ig.Demo
         * @memberof ig
         * @author Collin Hover - collinhover.com
         */
        ig.EntityDemoHold = ig.global.EntityDemoHold = ig.Demo.extend( /**@lends ig.EntityDemoHold.prototype */ {

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
             * @default demos_gestures_hold.png
             */
            animSheet: new ig.AnimationSheet(_c.PATH_TO_MEDIA + 'demos_gestures_hold.png', 64, 64),

            /**
             * @override
             */
            animSettings: {
                moveX: {
                    sequence: [0, 1, 2, 3, 4, 4, 4, 4],
                    frameTime: 0.25
                }
            }

        });

    });
