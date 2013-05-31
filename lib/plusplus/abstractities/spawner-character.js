ig.module(
        'plusplus.abstractities.spawner-character'
    )
    .requires(
        'plusplus.abstractities.spawner'
    )
    .defines(function () {
        "use strict";

        /**
         * Spawner for convenience in spawning creatures.
         * <span class="alert alert-error"><strong>IMPORTANT:</strong> this is an abstract entity that should be extended.</span>
         * @class
         * @extends ig.Spawner
         * @memberof ig
         * @author Collin Hover - collinhover.com
         **/
        ig.SpawnerCharacter = ig.Spawner.extend(/**@lends ig.SpawnerCharacter.prototype */{

            /**
             * Character spawner should not spawn randomly.
             * @override
             * @default
             */
            spawnAtRandomPosition: false,

            /**
             * @override
             * @default
             */
            spawnAtSide: { x: 0, y: 1 },

            /**
             * Character spawner should remain around to do multiple spawns.
             * @override
             * @default
             */
            suicidal: false

        });

    });

