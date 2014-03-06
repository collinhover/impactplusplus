ig.module(
    'plusplus.entities.particle-debris'
)
    .requires(
        'plusplus.core.config',
        'plusplus.abstractities.particle'
)
    .defines(function() {
        "use strict";

        var _c = ig.CONFIG;

        /**
         * Entity particle debris.
         * <span class="alert"><strong>IMPORTANT:</strong> this entity has a defined size and animation sheet!</span>
         * <br>- debris particle sprite sheet courtesy of Dominic Szablewski
         * @class
         * @extends ig.Particle
         * @memberof ig
         * @author Collin Hover - collinhover.com
         * @author Dominic Szablewski
         **/
        ig.EntityParticleDebris = ig.global.EntityParticleDebris = ig.Particle.extend( /**@lends ig.EntityParticleDebris.prototype */ {

            /**
             * @override
             * @default 4x4
             */
            size: {
                x: 4,
                y: 4
            },

            /**
             * @override
             * @default debris.png
             */
            animSheet: new ig.AnimationSheet(_c.PATH_TO_MEDIA + 'debris.png', 4, 4),

            /**
             * @override
             * @default
             */
            animInit: 'moveX',

            /**
             * @override
             */
            animSettings: {
                moveX: {
                    sequence: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14],
                    frameTime: 3
                }
            },

            /**
             * @override
             * @default
             */
            animAutomatic: false,

            /**
             * @override
             * @default 60x10
             */
            vel: {
                x: 60,
                y: 10
            },

            /**
             * @override
             * @default 100x100
             */
            friction: {
                x: 100,
                y: 100
            },

            /**
             * @override
             * @default
             */
            lifeDuration: 3,

            /**
             * Called just after particle added to game world, and randomizes current animation frame.
             * @override
             **/
            ready: function() {

                this.parent();

                if (this.currentAnim) {

                    this.currentAnim.gotoRandomFrame();

                }

            }

        });

    });
