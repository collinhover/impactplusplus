ig.module(
    'game.entities.checkpoint-start'
)
    .requires(
        'plusplus.entities.checkpoint',
        'game.entities.player'
)
    .defines(function() {
        "use strict";

        /**
         * Special checkpoint used to spawn player at start of game (needs to be placed in editor and triggered).
         * <span class="alert alert-info"><strong>Tip:</strong> don't use this unless your player should NOT spawn immediately!</span>
         * @class
         * @extends ig.EntityCheckpoint
         * @memberof ig
         * @author Collin Hover - collinhover.com
         */
        ig.EntityCheckpointStart = ig.global.EntityCheckpointStart = ig.EntityCheckpoint.extend( /**@lends ig.EntityCheckpointStart.prototype */ {

            /**
             * @override
             */
            spawningEntity: ig.EntityPlayer

        });

    });
