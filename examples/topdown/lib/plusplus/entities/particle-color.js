ig.module(
        'plusplus.entities.particle-color'
    )
    .requires(
        'plusplus.core.config',
        'plusplus.abstractities.particle',
        'plusplus.helpers.utilsvector2'
    )
    .defines(function () {
        "use strict";

        var _c = ig.CONFIG;
        var _utv2 = ig.utilsvector2;

        /**
         * Entity particle colored.
         * <span class="alert"><strong>IMPORTANT:</strong> this entity has a defined size and animation sheet!</span>
         * <br>- colored particle sprite sheet courtesy of Jesse Freeman
         * @class
         * @extends ig.Particle
         * @memberof ig
         * @author Collin Hover - collinhover.com
         * @author Jesse Freeman
         **/
        ig.EntityParticleColor = ig.global.EntityParticleColor = ig.Particle.extend(/**@lends ig.EntityParticleColor.prototype */{

            /**
             * @override
             * @default 2x2
             */
            size: _utv2.vector(2, 2),

            /**
             * @override
             * @default particles.png
             */
            animSheet: new ig.AnimationSheet(_c.PATH_TO_MEDIA + 'particles.png', 2, 2),

            /**
             * @override
             * @default
             */
            animTileOffset: 0,

            /**
             * @override
             * @default
             */
            animSequenceCount: 7,

            /**
             * @override
             * @default 50x50
             */
            vel: _utv2.vector(50, 50),

            /**
             * Initializes color particle visuals and randomizes slightly from offset
             * @override
             **/
            initVisuals: function () {

                this.parent();

                var colorFrame = Math.round(Math.random() * this.animSequenceCount) + ( this.animTileOffset * ( this.animSequenceCount + 1 ) );

                this.addAnim('idle', 0.2, [ colorFrame ]);

            }

        });

        /**
         * Color offset map, based on {@link ig.EntityParticleColor#animSheet}
         * @memberof ig.EntityParticleColor
         * @property {Number} RED 0
         * @property {Number} YELLOW 4
         * @property {Number} GREEN 8
         * @property {Number} BLUE 12
         * @property {Number} PURPLE 16
         * @property {Number} BROWN 20
         * @property {Number} GRAY 24
         * @property {Number} WHITE 28
         */
        ig.EntityParticleColor.colorOffsets = {
            RED: 0,
            YELLOW: 4,
            GREEN: 8,
            BLUE: 12,
            PURPLE: 16,
            BROWN: 20,
            GRAY: 24,
            WHITE: 28
        };

    });