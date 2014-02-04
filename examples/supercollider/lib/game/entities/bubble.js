/**
 * Projectile bubble that gives off glow.
 * @extends ig.Projectile
 * @class ig.EntityBubble
 * @author Collin Hover - collinhover.com
 */
ig.module(
    'game.entities.bubble'
)
    .requires(
        'plusplus.core.config',
        'plusplus.abstractities.projectile',
        'plusplus.abilities.glow',
        'plusplus.helpers.utilsvector2'
)
    .defines(function() {

        var _c = ig.CONFIG;
        var _utv2 = ig.utilsvector2;

        ig.global.EntityBubble = ig.EntityBubble = ig.Projectile.extend({

            // size and sprite

            size: {
                x: 8,
                y: 8
            },
            offset: {
                x: 2,
                y: 2
            },

            animSheet: new ig.AnimationSheet(_c.PATH_TO_MEDIA + 'bubble.png', 12, 12),

            animInit: "moveX",

            animSettings: {
                moveX: {
                    sequence: [9],
                    frameTime: 1
                },
                spawnX: {
                    sequence: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
                    frameTime: 0.3
                },
                deathX: {
                    sequence: [10, 11, 12],
                    frameTime: 0.05
                }
            },

            // gets knocked around

            collides: ig.EntityExtended.COLLIDES.LITE,

            // permanent acceleration up

            accel: _utv2.vector(0, -5),

            // anti grav

            gravityFactor: 0,

            // short life

            lifeDuration: 3,

            // bouncy

            bounciness: 0.5,

            // no damage

            //damage: 0,

            // glow settings

            glowSettings: {
                sizeMod: 10,
                fadeInDuration: 750
            },

            /**
             * @override
             **/
            initProperties: function() {

                this.parent();

                this.glow = new ig.AbilityGlow(this);

            },

            /**
             * @override
             **/
            resetExtras: function() {

                // ensure glow fade duration is not longer than part of lifetime

                this.glowSettings.fadeInDuration = Math.min(this.glowSettings.fadeInDuration, this.lifeDuration * 1000 * 0.25);

                this.parent();

            }

        });

    });
