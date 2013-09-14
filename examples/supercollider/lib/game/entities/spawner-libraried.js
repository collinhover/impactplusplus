ig.module(
        'game.entities.spawner-libraried'
    )
    .requires(
        'plusplus.abstractities.spawner',
        /* particles */
        'plusplus.entities.particle-color',
        'plusplus.entities.particle-debris',
        'plusplus.entities.effect-electricity'
    )
    .defines(function () {
        "use strict";

        /**
         * Spawner that requires all spawnable non-character entities for easy reusability of generic spawner entity.
         * This is intended for use in the level editor so that we don't need to define a new spawner for each spawnable entity.
         * If you're generating a spawner programatically, use ig.Spawner instead and simply require the spawnable entity.
         * @class
         * @extends ig.Spawner
         * @memberof ig
         * @author Collin Hover - collinhover.com
         **/
        ig.EntitySpawnerLibraried = ig.global.EntitySpawnerLibraried = ig.Spawner.extend({

            // nothing

        });

    });

