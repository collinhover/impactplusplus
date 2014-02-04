ig.module(
    'game.entities.particle-debris-door'
)
    .requires(
        'plusplus.core.config',
        'plusplus.entities.particle-debris'
)
    .defines(function() {
        "use strict";

        var _c = ig.CONFIG;

        /**
         * Debris particle for destructable door.
         * @class
         * @extends ig.EntityParticleDebris
         * @memberof ig
         * @author Collin Hover - collinhover.com
         */
        ig.EntityParticleDebrisDoor = ig.global.EntityParticleDebrisDoor = ig.EntityParticleDebris.extend( /**@lends ig.EntityParticleDebrisDoor.prototype */ {

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
            animSheet: new ig.AnimationSheet(_c.PATH_TO_MEDIA + "door_debris.png", 6, 6),

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
