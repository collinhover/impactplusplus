ig.module(
    'game.entities.particle-debris-grate'
)
    .requires(
        'plusplus.core.config',
        'plusplus.entities.particle-debris'
)
    .defines(function() {
        "use strict";

        var _c = ig.CONFIG;

        /**
         * Debris particle for destructable grate.
         * @class
         * @extends ig.EntityParticleDebris
         * @memberof ig
         * @author Collin Hover - collinhover.com
         */
        ig.EntityParticleDebrisGrate = ig.global.EntityParticleDebrisGrate = ig.EntityParticleDebris.extend( /**@lends ig.EntityParticleDebrisGrate.prototype */ {

            /**
             * Smaller than tile size to account for offset.
             * @override
             * @default 2x2
             */
            size: {
                x: 2,
                y: 2
            },
            /**
             * @override
             * @default 2x2
             */
            offset: {
                x: 2,
                y: 2
            },

            /**
             * @override
             */
            animSheet: new ig.AnimationSheet(_c.PATH_TO_MEDIA + "grate_debris.png", 4, 4),

            /**
             * @override
             * @property {Object} idle idle animation
             * @property {Object} idle.sequence random frame within sheet
             * @property {Object} idle.frameTime 3
             */
            animSettings: {
                moveX: {
                    sequence: [0, 1, 2, 3, 4, 5, 6, 7, 8],
                    frameTime: 3
                }
            }

        });

    });
