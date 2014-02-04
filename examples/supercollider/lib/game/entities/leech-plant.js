ig.module(
    'game.entities.leech-plant'
)
    .requires(
        'plusplus.core.config',
        'plusplus.abstractities.character',
        'plusplus.helpers.utils'
)
    .defines(function() {
        "use strict";

        var _c = ig.CONFIG;
        var _ut = ig.utils;

        /**
         * Leech Plant.
         * @class
         * @extends ig.Character
         * @memberof ig
         * @author Collin Hover - collinhover.com
         */
        ig.EntityLeechPlant = ig.global.EntityLeechPlant = ig.Character.extend( /**@lends ig.EntityLeechPlant.prototype */ {

            performance: ig.EntityExtended.PERFORMANCE.STATIC,

            size: {
                x: 16,
                y: 16
            },
            offset: {
                x: 4,
                y: 4
            },

            animSheet: new ig.AnimationSheet(_c.PATH_TO_MEDIA + 'leech_plant.png', 24, 24),

            animInit: "idleX",

            animSettings: {
                idleX: {
                    sequence: [0, 5, 6, 7, 8, 9],
                    frameTime: 1,
                    stop: true
                },
                spawnX: {
                    sequence: [1, 2, 3, 4],
                    frameTime: 0.1
                }
            },

            animAutomatic: false,

            health: 6,

            damageSettings: {
                spawnCountMax: 3,
                spawnSettings: {
                    animTileOffset: ig.EntityParticleColor.colorOffsets.GREEN
                }
            },

            deathSettings: {
                spawnCountMax: 5,
                spawnSettings: {
                    animTileOffset: ig.EntityParticleColor.colorOffsets.GREEN
                }
            },

            /**
             * @override
             **/
            initTypes: function() {

                _ut.addType(ig.EntityExtended, this, 'type', "EDIBLE PLANT");

            },

            /**
             * @override
             **/
            receiveDamage: function(amount, from, unblockable) {

                var damaged = this.parent(amount, from, unblockable);

                if (damaged) {

                    var anim = this.anims[this.getDirectionalAnimName("idle")];

                    if (this.currentAnim !== anim) {

                        this.currentAnim = anim;

                    }

                    this.currentAnim.gotoFrame(Math.round((this.currentAnim.sequence.length - 1) * (1 - this.health / this.healthMax)));

                }

                return damaged;

            },

            /**
             * @override
             **/
            receiveHealing: function(amount, from) {

                this.parent(amount, from);

                var anim = this.anims[this.getDirectionalAnimName("idle")];

                if (this.currentAnim !== anim) {

                    this.currentAnim = anim;

                }

                this.currentAnim.gotoFrame(Math.round((this.currentAnim.sequence.length - 1) * (1 - this.health / this.healthMax)));

            }

        });

    });
