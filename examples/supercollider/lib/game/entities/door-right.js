ig.module(
    'game.entities.door-right'
)
    .requires(
        'plusplus.core.config',
        'plusplus.abstractities.door'
)
    .defines(function() {
        "use strict";

        var _c = ig.CONFIG;

        /**
         * Automatic door that faces right.
         * @class
         * @extends ig.Door
         * @memberof ig
         * @author Collin Hover - collinhover.com
         */
        ig.EntityDoorRight = ig.global.EntityDoorRight = ig.Door.extend( /**@lends ig.EntityDoorRight.prototype */ {

            /**
             * @override
             * @default 16 x 56
             */
            size: {
                x: 16,
                y: 56
            },

            /**
             * @override
             */
            animSheet: new ig.AnimationSheet(_c.PATH_TO_MEDIA + "door_right.png", 16, 56),

            animInit: 'idleX',

            animSettings: {
                idleX: {
                    frameTime: 1,
                    sequence: [0]
                },
                lockX: {
                    frameTime: 1,
                    sequence: [1]
                },
                openX: {
                    frameTime: 0.05,
                    sequence: [2, 3, 4]
                },
                closeX: {
                    frameTime: 0.15,
                    sequence: [4, 3, 2]
                },
                brokenX: {
                    frameTime: 1,
                    sequence: [5]
                }
            }

        });

    });
