ig.module(
        'plusplus.entities.dummy'
    )
    .requires(
        'plusplus.core.config',
        'plusplus.abstractities.character',
        'plusplus.entities.particle-color',
        'plusplus.helpers.utils'
    )
    .defines(function () {
        "use strict";

        var _c = ig.CONFIG;
        var _ut = ig.utils;

        /**
         * Generic dummy entity for use in testing.
         * <span class="alert"><strong>IMPORTANT:</strong> this entity has a defined size and animation sheet!</span>
         * @class
         * @extends ig.Character
         * @memberof ig
         * @author Collin Hover - collinhover.com
         **/
        ig.EntityDummy = ig.global.EntityDummy = ig.Character.extend(/**@lends ig.EntityDummy.prototype */{

            /**
             * @override
             * @default fixed
             */
            collides: ig.Entity.COLLIDES.FIXED,

            /**
             * @override
             * @default dummy.png
             */
            animSheet: new ig.AnimationSheet(_c.PATH_TO_MEDIA + 'dummy.png', 32, 32),

            /**
             * @override
             * @default
             */
            animSettings: true,

            /**
             * @override
             * @default gray particles
             */
            damageSettings: {
                spawnCountMax: _c.CHARACTER.EXPLODING_DAMAGE_PARTICLE_COUNT,
                spawnSettings: {
                    animTileOffset: ig.EntityParticleColor.colorOffsets.GRAY
                }
            },

            /**
             * @override
             * @default gray particles
             */
            deathSettings: {
                spawnCountMax: _c.CHARACTER.EXPLODING_DEATH_PARTICLE_COUNT,
                spawnSettings: {
                    animTileOffset: ig.EntityParticleColor.colorOffsets.GRAY
                }
            },

            /**
             * Initializes dummy types.
             * <br>- adds {@link ig.EntityExtended.TYPE.DAMAGEABLE} to {@link ig.EntityExtended#type}
             * @override
             */
            initTypes: function () {

                this.parent();

                _ut.addType(ig.EntityExtended, this, 'type', "DAMAGEABLE");

            }

        });

    });