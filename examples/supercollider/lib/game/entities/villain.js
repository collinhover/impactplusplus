ig.module(
    'game.entities.villain'
)
    .requires(
        'plusplus.core.config',
        'plusplus.abstractities.creature',
        'plusplus.abilities.melee'
)
    .defines(function() {
        "use strict";

        var _c = ig.CONFIG;

        /**
         * Villain character.
         * @class
         * @extends ig.Creature
         * @memberof ig
         * @author Collin Hover - collinhover.com
         **/
        ig.EntityVillain = ig.global.EntityVillain = ig.Creature.extend({

            // base name for easy search

            name: "villain",

            // never collides

            collides: ig.EntityExtended.COLLIDES.NEVER,

            // animations

            animSheet: new ig.AnimationSheet(_c.PATH_TO_MEDIA + 'villain.png', _c.CHARACTER.SIZE_X, _c.CHARACTER.SIZE_Y),

            animInit: "idleX",

            animSettings: {
                idleX: {
                    sequence: [
                        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                        1, 2, 3, 3, 2, 1, 0, 1, 2, 3, 3, 2, 1,
                        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                        5, 4, 5, 4, 5, 4
                    ],
                    frameTime: 0.1
                },
                deathX: {
                    sequence: [6, 7, 8],
                    frameTime: 0.05
                },
                spawnX: {
                    sequence: [11, 10, 9, 8, 7, 6],
                    frameTime: 0.1
                },
                moveX: {
                    sequence: [12, 13, 14, 15, 16, 17],
                    frameTime: 0.1
                },
                jumpX: {
                    sequence: [16, 18, 19],
                    frameTime: 0.1
                },
                fallX: {
                    sequence: [20, 21],
                    frameTime: 0.1
                },
                climbX: {
                    sequence: [24, 25, 26, 27, 28, 29],
                    frameTime: 0.1
                },
                stairsX: {
                    sequence: [22, 23],
                    frameTime: 0.15
                },
                talkX: {
                    sequence: [0],
                    frameTime: 1
                },
                listenX: {
                    sequence: [0],
                    frameTime: 1
                },
                meleeX: {
                    sequence: [30, 31],
                    frameTime: 0.1
                },
                typeX: {
                    sequence: [32, 33],
                    frameTime: 0.1
                }
            },

            /**
             * @override
             **/
            initProperties: function() {

                this.parent();

                this.abilityMelee = new ig.AbilityMelee(this, {
                    // target will be provided by attack method
                    canFindTarget: false,
                    // slightly shorter melee distance than normal
                    rangeX: _c.CHARACTER.SIZE_EFFECTIVE_X
                });

            },

            /**
             * @override
             */
            attack: function(entity) {

                // since we've split villain into multiple modes
                // i.e. friendly, boss, etc
                // we'll only find if villain is close enough to attack
                // and let the mode decide what to do

                if (this.grounded || this.climbing) {

                    this.abilityMelee.setEntityTarget(entity);

                    if (this.abilityMelee.entityTarget) {

                        return this.abilityMelee.closeEnough();

                    }

                }

                return this.parent(entity);

            }

        });

    });
