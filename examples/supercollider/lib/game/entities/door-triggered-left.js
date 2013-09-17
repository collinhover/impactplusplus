ig.module(
        'game.entities.door-triggered-left'
    )
    .requires(
        'plusplus.core.config',
        'plusplus.abstractities.door-triggered'
    )
    .defines(function () {
        "use strict";

        var _c = ig.CONFIG;

        /**
         * Triggered door that faces left.
         * @class
         * @extends ig.DoorTriggered
         * @memberof ig
         * @author Collin Hover - collinhover.com
         */
        ig.EntityDoorTriggeredLeft = ig.global.EntityDoorTriggeredLeft = ig.DoorTriggered.extend(/**@lends ig.EntityDoorTriggeredLeft.prototype */{

            /**
             * @override
             * @default 16 x 56
             */
            size: {x:16, y: 56},

            /**
             * @override
             */
            animSheet: new ig.AnimationSheet( _c.PATH_TO_MEDIA + "door_left.png", 16, 56),

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
                    sequence: [2,3,4]
                },
                closeX: {
                    frameTime: 0.15,
                    sequence: [4,3,2]
                },
                brokenX: {
                    frameTime: 1,
                    sequence: [5]
                }
            }

        });

    });