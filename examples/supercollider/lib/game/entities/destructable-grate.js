ig.module(
    'game.entities.destructable-grate'
)
    .requires(
        'plusplus.core.config',
        'plusplus.helpers.utilsvector2',
        'plusplus.entities.destructable-collide',
        'game.entities.particle-debris-grate'
)
    .defines(function() {
        "use strict";

        var _c = ig.CONFIG;
        var _utv2 = ig.utilsvector2;

        /**
         * Grate destroyed by collision after a short delay.
         * @class
         * @extends ig.EntityDestructableCollide
         * @memberof ig
         * @author Collin Hover - collinhover.com
         */
        ig.EntityDestructableGrate = ig.global.EntityDestructableGrate = ig.EntityDestructableCollide.extend( /**@lends ig.EntityDestructableGrate.prototype */ {

            _wmDrawBox: false,
            _wmScalable: false,

            /**
             * @override
             */
            frozen: false,

            /**
             * @override
             * @default 64 x 16
             */
            size: _utv2.vector(48, 16),

            /**
             * @override
             * @default 4 x 0
             */
            offset: _utv2.vector(8, 0),

            /**
             * @override
             */
            animSheet: new ig.AnimationSheet(_c.PATH_TO_MEDIA + "grate.png", 64, 16),

            /**
             * @override
             * @default
             */
            animInit: 'idleX',

            /**
             * @override
             */
            animSettings: {
                idleX: {
                    frameTime: 1,
                    sequence: [0]
                }
            },

            /**
             * Debris particle.
             * @override
             * @default {@link ig.EntityParticleDebrisGrate}
             */
            spawningEntity: ig.EntityParticleDebrisGrate,

            /**
             * Debris settings.
             * @override
             */
            spawnSettings: {
                vel: _utv2.vector(60, 200)
            },

            /**
             * Grate destroys after short delay.
             * @override
             */
            delay: 0.25

        });

    });
