ig.module(
        'plusplus.entities.particle-debris'
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
         * Entity particle debris.
         * <span class="alert"><strong>IMPORTANT:</strong> this entity has a defined size and animation sheet!</span>
         * <br>- debris particle sprite sheet courtesy of Dominic Szablewski
         * @class
         * @extends ig.Particle
         * @memberof ig
         * @author Collin Hover - collinhover.com
         * @author Dominic Szablewski
         **/
        ig.EntityParticleDebris = ig.global.EntityParticleDebris = ig.Particle.extend(/**@lends ig.EntityParticleDebris.prototype */{

            /**
             * @override
             * @default 4x4
             */
            size: _utv2.vector(4, 4),

            /**
             * @override
             * @default debris.png
             */
            animSheet: new ig.AnimationSheet(_c.PATH_TO_MEDIA + 'debris.png', 4, 4),

            /**
             * @override
             * @property {Object} idle idle animation
             * @property {Object} idle.sequence random frame within sheet
             * @property {Object} idle.frameTime 3
             */
            animSettings: {
                idle: {
                    sequence: [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14 ],
                    frameTime: 3
                }
            },

            /**
             * @override
             * @default 60x10
             */
            vel: _utv2.vector(60, 10),

            /**
             * @override
             * @default 100x100
             */
            friction: _utv2.vector(100, 100),

            /**
             * @override
             * @default
             */
            lifeDuration: 3,

            /**
             * Called just after particle added to game world, and randomizes current animation frame.
             * @override
             **/
            ready: function () {

                this.parent();

                if (this.currentAnim) {

                    this.currentAnim.gotoRandomFrame();

                }

            }

        });

    });