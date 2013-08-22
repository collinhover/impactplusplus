ig.module(
        'plusplus.entities.demo-swipe'
    )
    .requires(
        'plusplus.core.config',
        'plusplus.abstractities.demo',
        'plusplus.helpers.utilsvector2'
    )
    .defines(function () {

        var _c = ig.CONFIG;
        var _utv2 = ig.utilsvector2;

        /**
         * Visual demo used in tutorials for swiping.
         * <span class="alert"><strong>IMPORTANT:</strong> this entity has a defined size and animation sheet!</span>
         * @class
         * @extends ig.Demo
         * @memberof ig
         * @author Collin Hover - collinhover.com
         */
        ig.EntityDemoSwipe = ig.global.EntityDemoSwipe = ig.Demo.extend(/**@lends ig.EntityDemoSwipe.prototype */{

            /**
             * Swipe demo will likely move.
             * @override
             * @default movable
             */
            performance: _c.MOVABLE,

            /**
             * @override
             * @default 64 x 64
             */
            size: _utv2.vector(64, 64),

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