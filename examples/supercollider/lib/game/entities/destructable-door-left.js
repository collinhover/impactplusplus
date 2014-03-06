ig.module(
    'game.entities.destructable-door-left'
)
    .requires(
        'plusplus.core.config',
        'plusplus.entities.destructable-damage',
        'game.entities.particle-debris-door'
)
    .defines(function() {
        "use strict";

        var _c = ig.CONFIG;

        /**
         * Destructable pseudo door facing to the left that is destroyed by damage.
         * @class
         * @extends ig.EntityDestructableDamage
         * @memberof ig
         * @author Collin Hover - collinhover.com
         */
        ig.EntityDestructableDoorLeft = ig.global.EntityDestructableDoorLeft = ig.EntityDestructableDamage.extend( /**@lends ig.EntityDestructableDoorLeft.prototype */ {

            _wmDrawBox: false,
            _wmScalable: false,

            /**
             * @override
             */
            frozen: false,

            /**
             * @override
             * @default 16 x 56
             */
            size: {
                x: 16,
                y: 56
            },

            /**
             * @override
             */
            animSheet: new ig.AnimationSheet(_c.PATH_TO_MEDIA + "door_left.png", 16, 56),

            /**
             * @override
             * @default
             */
            animInit: 'brokenX',

            /**
             * @override
             */
            animSettings: {
                brokenX: {
                    frameTime: 1,
                    sequence: [5]
                }
            },

            /**
             * @override
             * @default {@link ig.EntityParticleDebrisDoor}
             */
            spawningEntity: ig.EntityParticleDebrisDoor,

            /**
             * @override
             */
            spawnSettings: {
                vel: {
                    x: 120,
                    y: 120
                }
            }

        });

    });
