ig.module(
    'plusplus.entities.camera-shake'
)
    .requires(
        'plusplus.entities.trigger'
)
    .defines(function() {
        "use strict";

        /**
         * Trigger that causes camera to shake and simulate an earthquake or explosion.
         * @class
         * @extends ig.EntityTrigger
         * @memberof ig
         * @author Collin Hover - collinhover.com
         */
        ig.EntityCameraShake = ig.global.EntityCameraShake = ig.EntityTrigger.extend( /**@lends ig.EntityCameraShake.prototype */ {

            _wmBoxColor: 'rgba(80, 130, 170, 0.7)',

            /**
             * Camera shake strength.
             * @type Number
             * @default
             * @see ig.Camera#shakeStrength
             */
            shakeStrength: 0,

            /**
             * Camera shake duration in seconds.
             * @type Number
             * @default
             * @see ig.Camera#shakeDuration
             */
            shakeDuration: 0,

            /**
             * Camera shake value function.
             * @type Function
             * @see ig.Camera#shakeFunction
             */
            shakeFunction: false,

            /**
             * Activates shake in camera.
             * @override
             */
            activate: function(entity) {

                this.parent(entity);

                if (ig.game.camera) {

                    ig.game.camera.shake(this.shakeDuration, this.shakeStrength, this.shakeFunction);

                }

            },

            /**
             * Deactivates shake in camera.
             * @override
             */
            deactivate: function(entity) {

                this.parent(entity);

                if (ig.game.camera) {

                    ig.game.camera.shakeStop();

                }

            }

        });

    });
