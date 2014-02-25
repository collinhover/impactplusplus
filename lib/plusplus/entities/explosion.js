ig.module(
    'plusplus.entities.explosion'
)
    .requires(
        'plusplus.abstractities.spawner-fast',
        'plusplus.entities.particle-color'
)
    .defines(function() {
        "use strict";

        /**
         * Entity for creating explosions, optionally based on another entity.
         * @class
         * @extends ig.SpawnerFast
         * @memberof ig
         * @author Collin Hover - collinhover.com
         */
        ig.EntityExplosion = ig.global.EntityExplosion = ig.SpawnerFast.extend( /**@lends ig.EntityExplosion.prototype */ {

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
             * @override
             * @property {Vector2} vel 100 x 100
             * @property {Number} animTileOffset ig.EntityParticleColor.colorOffsets.YELLOW
             */
            spawnSettings: {
                vel: {
                    x: 100,
                    y: 100
                },
                animTileOffset: ig.EntityParticleColor.colorOffsets.YELLOW
            },

            /**
             * Spawn entities on ready.
             * @override
             * @default
             */
            activated: true,

            /**
             * Unfrozen for high likely-hood of self animation.
             * @override
             * @default
             */
            frozen: false

        });

    });
