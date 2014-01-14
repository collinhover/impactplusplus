ig.module(
    'plusplus.entities.particle-color'
)
    .requires(
        'plusplus.core.config',
        'plusplus.abstractities.particle-fast'
)
    .defines(function() {
        "use strict";

        var _c = ig.CONFIG;

        /**
         * Fast particle that looks like a simple colored square.
         * <span class="alert"><strong>IMPORTANT:</strong> this entity has a defined size and animation sheet!</span>
         * <br>- colored particle sprite sheet courtesy of Jesse Freeman
         * @class
         * @extends ig.ParticleFast
         * @memberof ig
         * @author Collin Hover - collinhover.com
         * @author Jesse Freeman
         **/
        ig.EntityParticleColor = ig.global.EntityParticleColor = ig.ParticleFast.extend( /**@lends ig.EntityParticleColor.prototype */ {

            /**
             * @override
             * @default 2x2
             */
            size: {
                x: 2,
                y: 2
            },

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
            vel: {
                x: 50,
                y: 50
            },

            /**
             * @override
             * @default
             */
            lifeDuration: 0.35,

            /**
             * @override
             * @default
             */
            fadeBeforeDeathDuration: 0.15,

            // internal properties, do not modify

            _animTileOffsetLast: -1,

            /**
             * Resets color particle visuals and randomizes slightly from offset.
             * @override
             **/
            reset: function(x, y, settings) {

                this.parent(x, y, settings);

                if (this._animTileOffsetLast !== this.animTileOffset) {

                    this._animTileOffsetLast = this.animTileOffset;

                    this.addAnim("move", {
                        sequence: [Math.round(Math.random() * this.animSequenceCount) + (this.animTileOffset * (this.animSequenceCount + 1))],
                        frameTime: 1,
                        stop: true
                    });

                }

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
