ig.module(
    'game.entities.leech-crab'
)
    .requires(
        'plusplus.core.config',
        'plusplus.abstractities.creature',
        'plusplus.helpers.utils'
)
    .defines(function() {
        "use strict";

        var _c = ig.CONFIG;
        var _ut = ig.utils;

        /**
         * Leech crab that does nothing except stand idle.
         * @class
         * @extends ig.Creature
         * @memberof ig
         * @author Collin Hover - collinhover.com
         */
        ig.EntityLeechCrab = ig.global.EntityLeechCrab = ig.Creature.extend( /**@lends ig.EntityLeechCrab.prototype */ {

            zIndex: _c.Z_INDEX_PLAYER - 1,

            size: {
                x: 24,
                y: 8
            },
            offset: {
                x: 4,
                y: 4
            },

            collides: ig.EntityExtended.COLLIDES.NEVER,

            // animations

            animSheet: new ig.AnimationSheet(_c.PATH_TO_MEDIA + 'leech_crab.png', 32, 16),

            animInit: "idleX",

            animSettings: {
                idleX: {
                    sequence: [
                        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                        1, 1, 2, 2, 2, 2, 2, 2, 3, 2, 3, 2, 1, 1
                    ],
                    frameTime: 0.1
                },
                moveX: {
                    sequence: [4, 5, 6, 7],
                    frameTime: 0.15
                },
                stairsX: {
                    sequence: [4, 5, 6, 7],
                    frameTime: 0.15
                },
                spawnX: {
                    sequence: [19, 18, 17, 16, 0],
                    frameTime: 0.1
                },
                deathX: {
                    sequence: [8, 9, 10, 11, 12, 13, 14, 15],
                    frameTime: 0.1
                },
                eatX: {
                    sequence: [20, 21, 22, 23, 20, 0],
                    frameTime: 0.15
                }
            },

            // physics

            maxVelGrounded: {
                x: 25,
                y: 25
            },
            frictionGrounded: {
                x: 800,
                y: 800
            },
            speed: {
                x: 100,
                y: 100
            },

            // stats

            health: 2,

            // don't explode when hurt or killed

            explodingDamage: false,
            explodingDeath: false,

            // no jumping and no climbing

            canJump: false,
            canClimb: false,

            // no wandering

            canWanderX: false,
            canWanderY: false,

            /**
             * @override
             **/
            initTypes: function() {

                this.parent();

                _ut.addType(ig.EntityExtended, this, 'type', "HERBIVORE DAMAGEABLE");

            }

        });

    });
