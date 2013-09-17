ig.module(
        'game.entities.spawner-character-libraried'
    )
    .requires(
        'plusplus.abstractities.spawner-character',
        'plusplus.entities.dummy',
        'game.entities.villain',
        'game.entities.villain-working',
        'game.entities.villain-friendly',
        'game.entities.villain-clone',
        'game.entities.leech-crab',
        'game.entities.leech-crab-wander',
        'game.entities.leech-crab-hungry',
        'game.entities.leech-crab-flying',
        'game.entities.leech-plant'
    )
    .defines(function () {
        "use strict";

        /**
         * Spawner that requires all spawnable characters, for easy reusability of generic spawner entity.
         * This is intended for use in the level editor so that we don't need to define a new spawner for each spawnable entity.
         * If you're generating a spawner programatically, use ig.SpawnerCharacter instead and simply require the spawnable entity.
         * @class
         * @extends ig.SpawnerCharacter
         * @memberof ig
         * @author Collin Hover - collinhover.com
         **/
        ig.EntitySpawnerCharacterLibraried = ig.global.EntitySpawnerCharacterLibraried = ig.SpawnerCharacter.extend({

            // nothing

        });

    });

