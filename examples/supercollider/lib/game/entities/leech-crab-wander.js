ig.module(
    'game.entities.leech-crab-wander'
)
    .requires(
        'game.entities.leech-crab'
)
    .defines(function() {
        "use strict";

        /**
         * Leech crab that wanders.
         * @class
         * @extends ig.EntityLeechCrab
         * @memberof ig
         * @author Collin Hover - collinhover.com
         */
        ig.EntityLeechCrabWander = ig.global.EntityLeechCrabWander = ig.EntityLeechCrab.extend( /**@lends ig.EntityLeechCrabWander.prototype */ {

            // wander on horizontal

            canWanderX: true,

            // wandering settings

            moveToWanderSettings: {
                // simple pathfinding, just next node
                simple: true,
                // don't go over the edge!
                avoidUngrounded: true
            }

        });

    });
