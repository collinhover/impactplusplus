ig.module(
    'game.entities.projectile-grenade'
)
    .requires(
        'plusplus.abstractities.projectile',
        'plusplus.core.config',
        'plusplus.helpers.utils'
)
    .defines(function() {
        "use strict";

        var _c = ig.CONFIG;
        var _ut = ig.utils;

        /**
         * Projectile for grenade launcher ability.
         * @class
         * @extends ig.Projectile
         * @memberof ig
         * @author Collin Hover - collinhover.com
         */
        ig.EntityProjectileGrenade = ig.global.EntityProjectileGrenade = ig.Projectile.extend( /**@lends ig.EntityProjectileGrenade.prototype */ {

            // lite collides to get knocked around

            collides: ig.EntityExtended.COLLIDES.LITE,

            size: {
                x: 8,
                y: 8
            },

            offset: {
                x: 4,
                y: 4
            },

            animSheet: new ig.AnimationSheet(_c.PATH_TO_MEDIA + 'grenade.png', 16, 16),

            animSettings: {
                moveX: {
                    frameTime: 0.2,
                    sequence: [0, 1]
                },
                moveY: {
                    frameTime: 0.2,
                    sequence: [0, 1]
                },
                deathX: {
                    frameTime: 0.1,
                    sequence: [2, 3, 4, 5]
                },
                deathY: {
                    frameTime: 0.1,
                    sequence: [2, 3, 4, 5]
                }
            },

            canFlipX: true,
            canFlipY: true,

            damage: 10,

            // 1 second fuse!

            lifeDuration: 1,

            // less gravity

            gravityFactor: 0.5,

            // low friction

            friction: {
                x: 5,
                y: 0
            }

        });

    });
