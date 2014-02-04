ig.module(
    'game.entities.particle-color-random'
)
    .requires(
        'plusplus.entities.particle-color'
)
    .defines(function() {
        "use strict";

        /**
         * Randomly colored particle.
         * @class
         * @extends ig.EntityParticleColor
         * @memberof ig
         * @author Collin Hover - collinhover.com
         */
        ig.EntityParticleColorRandom = ig.global.EntityParticleColorRandom = ig.EntityParticleColor.extend( /**@lends ig.EntityParticleColorRandom.prototype */ {

            /**
             * @override
             **/
            reset: function(x, y, settings) {

                // randomize color between green and purple

                this.animTileOffset = ig.EntityParticleColor.colorOffsets.GREEN + Math.round(Math.random() * ((ig.EntityParticleColor.colorOffsets.BROWN - 1) - ig.EntityParticleColor.colorOffsets.GREEN));

                this.parent(x, y, settings);

            }

        });

    });
