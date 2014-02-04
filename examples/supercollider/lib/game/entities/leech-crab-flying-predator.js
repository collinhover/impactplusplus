ig.module(
    'game.entities.leech-crab-flying-predator'
)
    .requires(
        'plusplus.core.config',
        'game.entities.leech-crab-flying'
)
    .defines(function() {
        "use strict";

        var _c = ig.CONFIG;

        /**
         * Leech crab that flies and is a predator to leech crab prey.
         * @class
         * @extends ig.EntityLeechCrabFlying
         * @memberof ig
         * @author Collin Hover - collinhover.com
         */
        ig.EntityLeechCrabFlyingPredator = ig.global.EntityLeechCrabFlyingPredator = ig.EntityLeechCrabFlying.extend( /**@lends ig.EntityLeechCrabFlyingPredator.prototype */ {

            // chases prey leech crabs

            preyClass: "EntityLeechCrabPrey",

            // search a little further

            reactionDistance: _c.CREATURE.REACTION_DISTANCE * 2,

            moveToPredatorSettings: {
                // use complex pathfinding to chase
                simple: false,
                // only search a limited distance
                searchDistance: _c.CREATURE.REACTION_DISTANCE * 2
            }

        });

    });
