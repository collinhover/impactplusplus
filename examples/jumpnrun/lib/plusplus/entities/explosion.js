ig.module(
        'plusplus.entities.explosion'
    )
    .requires(
        'plusplus.abstractities.spawner',
        'plusplus.entities.particle-color',
        'plusplus.helpers.utilsvector2'
    )
    .defines(function () {

        var _utv2 = ig.utilsvector2;

        /**
         * Entity for creating explosions, optionally based on another entity.
         * @class
         * @extends ig.Spawner
         * @memberof ig
         * @author Collin Hover - collinhover.com
         */
        ig.EntityExplosion = ig.global.EntityExplosion = ig.Spawner.extend(/**@lends ig.EntityExplosion.prototype */{

            /**
             * Spawn colored particle.
             * @override
             * @default ig.EntityParticleColor
             */
            spawningEntity: ig.EntityParticleColor,

            /**
             * @override
             * @default
             */
            spawnCountMax: 3,

            /**
             * Spawned entities should be sticky.
             * @override
             * @property {Boolean} collisionSticky true
             * @property {Vector2} vel 200 x 200
             * @property {Number} animTileOffset ig.EntityParticleColor.colorOffsets.YELLOW
             */
            spawnSettings: {
                collisionSticky: true,
                vel: _utv2.vector(200, 200),
                animTileOffset: ig.EntityParticleColor.colorOffsets.YELLOW
            },

            /**
             * Spawn entities on ready.
             * @override
             * @default
             */
            activated: true,

            /**
             * Entity to copy size from.
             * @type ig.EntityExtended
             */
            entity: null,

            /**
             * Resets core properties and, if entity passed in settings, copy entity size and offset.
             * @override
             **/
            resetCore: function (x, y, settings) {

                this.parent(x, y, settings);

                // copy some of entity properties

                if (this.entity) {

                    _utv2.copy(this.size, this.entity.size);
                    _utv2.copy(this.offset, this.entity.offset);

                }

            }

        });

    });