ig.module(
    'game.entities.leech-crab-flying'
)
    .requires(
        'plusplus.core.config',
        'game.entities.leech-crab'
)
    .defines(function() {
        "use strict";

        var _c = ig.CONFIG;

        /**
         * Leech crab that flies and does not eat plants.
         * @class
         * @extends ig.Creature
         * @memberof ig
         * @author Collin Hover - collinhover.com
         */
        ig.EntityLeechCrabFlying = ig.global.EntityLeechCrabFlying = ig.EntityLeechCrab.extend( /**@lends ig.EntityLeechCrabFlying.prototype */ {

            size: {
                x: 24,
                y: 24
            },
            offset: {
                x: 4,
                y: 4
            },

            animSheet: new ig.AnimationSheet(_c.PATH_TO_MEDIA + 'leech_crab_flying.png', 32, 32),

            animSettings: {
                idleX: {
                    sequence: [0, 1, 2, 3, 4, 5],
                    frameTime: 0.05
                },
                moveX: {
                    sequence: [0, 1, 2, 3, 4, 5],
                    frameTime: 0.05
                }
            },

            // physics

            maxVelGrounded: {
                x: 15,
                y: 15
            },
            maxVelUngrounded: {
                x: 15,
                y: 15
            },
            frictionGrounded: {
                x: 600,
                y: 600
            },
            frictionUngrounded: {
                x: 600,
                y: 600
            },
            speed: {
                x: 100,
                y: 100
            },

            // fly!

            gravityFactor: 0,

            // never die

            invulnerable: true,

            // original leech crab eats plants
            // but the flying version has no prey

            preyType: 0,

            // wander in all directions

            canWanderX: true,
            canWanderY: true,

            // randomly switch direction while wandering

            wanderSwitchChance: 0.005,
            wanderSwitchChanceStopped: 0.015

        });

    });
