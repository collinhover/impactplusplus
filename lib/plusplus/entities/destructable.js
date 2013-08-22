ig.module(
        'plusplus.entities.destructable'
    )
    .requires(
        'plusplus.entities.explosion',
        'plusplus.entities.particle-debris',
        'plusplus.helpers.utilsvector2'
    )
    .defines(function () {
        "use strict";

        var _utv2 = ig.utilsvector2;

        /**
         * Entity that is destroyed when triggered by a trigger.
         * <br>- this entity can be destroyed either through another trigger or by taking damage
         * <br>- this entity cannot be destroyed through collision
         * @class
         * @extends ig.Spawner
         * @memberof ig
         * @author Collin Hover - collinhover.com
         * @see ig.EntityTrigger
         **/
        ig.EntityDestructable = ig.global.EntityDestructable = ig.EntityExplosion.extend(/**@lends ig.EntityDestructable.prototype */{

            // editor properties

            _wmBoxColor: 'rgba( 255, 0, 175, 0.7 )',

            /**
             * Destructable should collide and block other entities, but not move.
             * @override
             * @default fixed
             */
            collides: ig.EntityExtended.COLLIDES.FIXED,

            /**
             * Destructable spawns {@link ig.EntityParticleDebris} when killed.
             */
            spawningEntity: ig.EntityParticleDebris,

            /**
             * @override
             * @default
             */
            spawnCountMax: 10,

            /**
             * Destructable spawned entity should not be sticky.
             * @override
             */
            spawnSettings: {
                collisionSticky: false,
                vel: _utv2.vector(60, 60)
            },

            /**
             * Destructable should not activate automatically.
             * @override
             * @default
             */
            activated: false,

            /**
             * Destructable should not activate automatically.
             * @override
             * @default
             */
            triggerable: false,

            /**
             * Destructable is killed on activate.
             * @override
             */
            activate: function (entity) {

                this.parent(entity);

                this.kill();

            },

            /**
             * Destructable is automatically triggered when killed to spawn debris.
             * @override
             */
            kill: function ( silent ) {

                // make sure we've triggered

                if (!this.activated) {

                    this.trigger( this );

                }
                else {

                    this.parent( silent );

                }

            }

        });

    });