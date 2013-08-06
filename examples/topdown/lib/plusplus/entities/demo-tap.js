ig.module(
        'plusplus.entities.demo-tap'
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
         * Visual demo used in tutorials for tapping.
         * <span class="alert"><strong>IMPORTANT:</strong> this entity has a defined size and animation sheet!</span>
         * @class
         * @extends ig.Demo
         * @memberof ig
         * @author Collin Hover - collinhover.com
         */
        ig.EntityDemoTap = ig.global.EntityDemoTap = ig.Demo.extend(/**@lends ig.EntityDemoTap.prototype */{

            /**
             * @override
             * @default 64 x 64
             */
            size: _utv2.vector(64, 64),

            /**
             * @override
             * @default demos_gestures_tap.png
             */
            animSheet: new ig.AnimationSheet(_c.PATH_TO_MEDIA + 'demos_gestures_tap.png', 64, 64),

            /**
             * @override
             * @property {Object} up - idle animation
             * @property {Object} up.sequence - frames 0, 1, 2, 3, 4
             * @property {Object} up.frameTime - 0.1
             */
            animSettings: {
                idle: {
                    sequence: [0, 1, 2, 3, 4],
                    frameTime: 0.1
                }
            }

        });

    });