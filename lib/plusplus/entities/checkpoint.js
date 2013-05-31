ig.module(
        'plusplus.entities.checkpoint'
    )
    .requires(
        'plusplus.abstractities.spawner',
        'plusplus.helpers.utils'
    )
    .defines(function () {
        "use strict";

        var _ut = ig.utils;

        /**
         * Entity that triggers an update of an entity's reset state and spawns it upon death.
         * @class
         * @extends ig.Spawner
         * @memberof ig
         * @author Collin Hover - collinhover.com
         **/
        ig.EntityCheckpoint = ig.global.EntityCheckpoint = ig.Spawner.extend(/**@lends ig.EntityCheckpoint.prototype */{

            // editor properties

            _wmBoxColor: 'rgba( 0, 255, 100, 0.7 )',

            /**
             * Checkpoint is spawner but should be triggerable by collision.
             * @override
             * @default
             */
            triggerable: true,

            /**
             * Whether checkpoint will restore entity stats.
             * @type Boolean
             * @default
             */
            restorative: false,

            /**
             * Whether checkpoint will restore entity stats after spawned
             * @type Boolean
             * @default
             */
            restorativeSpawn: true,

            /**
             * Checkpoint should only be triggered occasionally.
             * @override
             * @default
             */
            wait: 1,

            /**
             * Checkpoint can be triggered repeatedly.
             * @override
             * @default
             */
            once: false,

            /**
             * Checkpoint should not die after triggering.
             * @override
             * @default
             */
            suicidal: false,

            /**
             * Checkpoint spawns entities right in middle.
             * @override
             * @default
             */
            spawnAtRandomPosition: false,

            /**
             * Checkpoint spawns entities at bottom of checkpoint area.
             * @override
             * @default
             */
            spawnAtSide: { x: 0, y: 1 },

            /**
             * Initializes checkpoint types.
             * <br>- adds {@link ig.EntityExtended.TYPE.CHECKPOINT} to {@link ig.EntityExtended#type}
             * @override
             **/
            initTypes: function () {

                this.parent();

                _ut.addType(ig.EntityExtended, this, 'type', "CHECKPOINT");

            },

            /**
             * Does spawner activate and links triggering entity as well as, if {@link ig.Checkpoint#restorative}, restores its stats.
             * @override
             **/
            activate: function (entity) {

                this.parent(entity);

                if (entity) {

                    // link entity

                    this.linkSpawned(entity);

                    // restore

                    if (this.restorative) {

                        entity.restoreStats(this);

                    }

                }

            },

            /**
             * Does spawner activate and links triggering entity as well as, if {@link ig.Checkpoint#restorativeSpawn}, restores its stats.
             * @override
             **/
            spawned: function (entity) {

                this.parent(entity);

                // restore

                if (this.restorativeSpawn) {

                    entity.restoreStats(this);

                }

            }

        });

    });