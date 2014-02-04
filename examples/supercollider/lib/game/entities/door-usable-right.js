ig.module(
    'game.entities.door-usable-right'
)
    .requires(
        'plusplus.core.config',
        'plusplus.abstractities.door-usable'
)
    .defines(function() {
        "use strict";

        var _c = ig.CONFIG;

        /**
         * Usable door that faces right.
         * @class
         * @extends ig.DoorUsable
         * @memberof ig
         * @author Collin Hover - collinhover.com
         */
        ig.EntityDoorUsableRight = ig.global.EntityDoorUsableRight = ig.DoorUsable.extend( /**@lends ig.EntityDoorUsableRight.prototype */ {

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
