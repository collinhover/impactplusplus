ig.module(
    'plusplus.entities.tutorial-tap'
)
    .requires(
        'plusplus.abstractities.tutorial',
        'plusplus.entities.demo-tap'
)
    .defines(function() {
        "use strict";

        /**
         * Tutorial for tapping.
         * <span class="alert"><strong>IMPORTANT:</strong> this entity has a defined size and animation sheet!</span>
         * @class
         * @extends ig.Tutorial
         * @memberof ig
         * @author Collin Hover - collinhover.com
         */
        ig.EntityTutorialTap = ig.global.EntityTutorialTap = ig.Tutorial.extend( /**@lends ig.EntityTutorialTap.prototype */ {

            /**
             * Tap tutorial should loop a little faster.
             * @override
             * @default
             */
            loopDelay: 0.5,

            /**
             * Tap tutorial should be only slightly delayed as it is a quick action.
             * @override
             * @default
             */
            delay: 0.25,

            /**
             * Tutorial uses tap demo.
             * @override
             * @default ig.EntityDemoTap
             */
            spawningEntity: ig.EntityDemoTap,

            /**
             * Tutorial checks for player action to complete.
             * @override
             */
            actions: ['tap'],

            /**
             * Tutorial should explain action to player.
             * @override
             * @property {String} text tap!
             */
            textSettings: {
                text: 'tap!'
            },

            /**
             * Demo should be offset slightly to account for finger position.
             * @override
             * @property {Vector2} offsetPct 0.35 x 0.5
             */
            spawnAndMoveToSettings: {
                offsetPct: {
                    x: 0.35,
                    y: 0.5
                }
            }

        });

    });
