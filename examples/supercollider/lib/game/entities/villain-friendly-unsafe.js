ig.module(
    'game.entities.villain-friendly-unsafe'
)
    .requires(
        'game.entities.villain-friendly'
)
    .defines(function() {
        "use strict";

        /**
         * Villain in friendly mode with super simple and totally unsafe pathing!
         * @class
         * @extends ig.EntityVillainFriendly
         * @memberof ig
         * @author Collin Hover - collinhover.com
         **/
        ig.EntityVillainFriendlyUnsafe = ig.global.EntityVillainFriendlyUnsafe = ig.EntityVillainFriendly.extend({

            // change pathfinding settings

            moveToPreySettings: {
                // keep it simple and only look 1 tile ahead
                simple: true,
                // don't care if tiles are walkable
                // or if path will take us over the edge into death
                // or if path is too high to get to
                // the upside is we can move up and down slopes
                // at a much cheaper cost than complex pathfinding
                unsafe: true
                // and no need for:
                // search distance (not used in simple pathfinding)
                // avoiding entities (not used in simple pathfinding)
                // etc
            }

        });

    });
