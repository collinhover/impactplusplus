/**
 * Simple spiky character that moves around a platform.
 */
ig.module(
    'game.entities.spike'
)
    .requires(
        // note that anything in abstractities
        // is an abstract entity that needs to be extended
        'plusplus.abstractities.creature',
        // if you want to use the config
        // don't forget to require it
        'plusplus.core.config',
        // and some utils
        'plusplus.helpers.utils'
)
    .defines(function() {
        "use strict";

        var _c = ig.CONFIG;
        var _ut = ig.utils;

        ig.EntitySpike = ig.global.EntitySpike = ig.Creature.extend({

            size: {
                x: 16,
                y: 9
            },

            // animations the Impact++ way
            // note that these animations are for
            // both side scrolling and top down mode
            // you will likely only need one or the other
            // so your animSettings will be much simpler

            animSheet: new ig.AnimationSheet('media/spike.png', 16, 9),

            animInit: "idleX",

            // for example, a sidescroller's animSettings
            // will only use idleX and moveX
            // while a top down where entities can flip on X and Y
            // will use idleX/Y, moveX/Y
            // but if the entities CANNOT flip on X and Y
            // will use idleLeft/Right/Up/Down, moveLeft/Right/Up/Down

            animSettings: {
                idleX: {
                    frameTime: 0.08,
                    sequence: [0, 1, 2]
                },
                idleLeft: {
                    frameTime: 0.08,
                    sequence: [0, 1, 2]
                },
                idleRight: {
                    frameTime: 0.08,
                    sequence: [0, 1, 2]
                },
                moveX: {
                    frameTime: 0.08,
                    sequence: [0, 1, 2]
                },
                moveLeft: {
                    frameTime: 0.08,
                    sequence: [0, 1, 2]
                },
                moveRight: {
                    frameTime: 0.08,
                    sequence: [0, 1, 2]
                },
                idleY: {
                    frameTime: 0.08,
                    sequence: [0, 1, 2]
                },
                idleUp: {
                    frameTime: 0.08,
                    sequence: [0, 1, 2]
                },
                idleDown: {
                    frameTime: 0.08,
                    sequence: [0, 1, 2]
                },
                moveY: {
                    frameTime: 0.08,
                    sequence: [0, 1, 2]
                },
                moveUp: {
                    frameTime: 0.08,
                    sequence: [0, 1, 2]
                },
                moveDown: {
                    frameTime: 0.08,
                    sequence: [0, 1, 2]
                }
            },

            // lets slow it downnnnnnn

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

            health: 10,

            // explode with a few red particles when killed

            deathSettings: {
                spawnCountMax: 3,
                spawnSettings: {
                    animTileOffset: ig.EntityParticleColor.colorOffsets.RED
                }
            },

            // spikes can't jump or climb

            canJump: false,
            canClimb: false,

            // but they can wander!

            canWanderX: true,
            canWanderY: false,

            // use this method to add types for checks
            // since we are using bitwise flags
            // we can take advantage of the fact that they can be added

            initTypes: function() {

                this.parent();

                // spikes can be damaged

                _ut.addType(ig.EntityExtended, this, 'type', "DAMAGEABLE");

                // spikes are in enemy group and will not collide with or hurt each other

                _ut.addType(ig.EntityExtended, this, 'group', "ENEMY", "GROUP");

                // spikes will collide and hurt any character not in their group

                _ut.addType(ig.EntityExtended, this, 'checkAgainst', "CHARACTER");

            },

            check: function(entity) {

                this.parent(entity);

                entity.receiveDamage(10, this);

            }

        });

    });
