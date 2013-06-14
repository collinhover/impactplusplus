ig.module(
        'plusplus.entities.camera-atmosphere'
    )
    .requires(
        'plusplus.entities.trigger-controller'
    )
    .defines(function () {
        "use strict";

        /**
         * Trigger controller that changes camera atmosphere.
         * <span class="alert alert-info"><strong>Tip:</strong> combine these with {@link ig.TriggerConstant} and {@link ig.TriggerReverseConstant} to create persistent areas of atmosphere in your levels!</span>
         * @class
         * @extends ig.EntityTriggerController
         * @memberof ig
         * @author Collin Hover - collinhover.com
         */
        ig.EntityCameraAtmosphere = ig.global.EntityCameraAtmosphere = ig.EntityTriggerController.extend({

            _wmBoxColor: 'rgba(80, 130, 170, 0.7)',

            /**
             * Duration of atmosphere fade.
             * @type Number
             * @default
             * @see ig.Camera#atmosphereFadeDuration
             */
            atmosphereFadeDuration: false,

            /**
             * Atmosphere overlay settings that map directly to (@link ig.UIOverlay} settings.
             * @type Object
             * @default
             * @see ig.Camera#atmosphereSettings
             */
            atmosphereSettings: null,

            /**
             * Activates atmosphere in camera.
             * @override
             */
            activate: function (entity) {

                this.parent( entity );

                if ( ig.game.camera ) {

                    ig.game.camera.addAtmosphere( this.atmosphereFadeDuration, this.atmosphereSettings );

                }

            },

            /**
             * Deactivates atmosphere in camera.
             * @override
             */
            deactivate: function (entity) {

                this.parent( entity );

                if ( ig.game.camera ) {

                    ig.game.camera.removeAtmosphere( this.atmosphereFadeDuration );

                }

            }

        });

    });
