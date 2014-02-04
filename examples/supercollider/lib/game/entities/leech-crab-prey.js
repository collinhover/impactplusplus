ig.module(
    'game.entities.leech-crab-prey'
)
    .requires(
        'game.entities.leech-crab-wander',
        'plusplus.core.config'
)
    .defines(function() {
        "use strict";

        var _c = ig.CONFIG;

        /**
         * Leech crab that is prey to predator flying leech crabs.
         * @class
         * @extends ig.EntityLeechCrabWander
         * @memberof ig
         * @author Collin Hover - collinhover.com
         */
        ig.EntityLeechCrabPrey = ig.global.EntityLeechCrabPrey = ig.EntityLeechCrabWander.extend( /**@lends ig.EntityLeechCrabPrey.prototype */ {

            // short delay before pathfinding again

            pathfindingDelay: 0.75,
            pathfindingUpdateDelay: 0.75,

            // in this example, can climb

            canClimb: true,

            // we need to also reduce max vel
            // to match slower velocity set in leech crab base

            maxVelClimbing: {
                x: 25,
                y: 25
            },

            // afraid of predator flying leech crabs

            predatorClass: "EntityLeechCrabFlyingPredator",

            // use complex pathfinding to run away

            moveToPredatorSettings: {
                // don't go over the edge
                avoidUngrounded: true,
                // only search a limited distance
                searchDistance: _c.CREATURE.REACTION_DISTANCE
            }

        });

    });
