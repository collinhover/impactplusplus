ig.module(
    'game.entities.projectile-laser'
)
    .requires(
        'plusplus.abstractities.projectile',
        'plusplus.entities.explosion',
        'plusplus.core.config',
        'plusplus.helpers.utils'
)
    .defines(function() {
        "use strict";

        var _c = ig.CONFIG;
        var _ut = ig.utils;

        /**
         * Projectile for laser gun ability.
         * @class
         * @extends ig.Projectile
         * @memberof ig
         * @author Collin Hover - collinhover.com
         */
        ig.EntityProjectileLaser = ig.global.EntityProjectileLaser = ig.Projectile.extend( /**@lends ig.EntityProjectileLaser.prototype */ {

            // lite collides to get knocked around

            collides: ig.EntityExtended.COLLIDES.LITE,

            size: {
                x: 4,
                y: 4
            },

            offset: {
                x: 2,
                y: 2
            },

            // animations the Impact++ way

            animSheet: new ig.AnimationSheet(_c.PATH_TO_MEDIA + 'projectile.png', 8, 8),

            animSettings: {
                moveX: {
                    frameTime: 1,
                    sequence: [0]
                },
                deathX: {
                    frameTime: 0.05,
                    sequence: [1, 2, 3, 4, 5]
                },
                moveY: {
                    frameTime: 1,
                    sequence: [6]
                },
                deathY: {
                    frameTime: 0.05,
                    sequence: [7, 8, 9, 10, 11]
                }
            },

            // can flip any direction

            canFlipX: true,
            canFlipY: true,

            // stats

            damage: 2,

            lifeDuration: 2,

            // no gravity

            gravityFactor: 0,

            // no friction

            friction: {
                x: 0,
                y: 0
            },

            // no bounce

            bounciness: 0,

            // die on collision with walls

            collisionKills: true

        });

    });
