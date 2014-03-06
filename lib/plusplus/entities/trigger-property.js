ig.module(
    'plusplus.entities.trigger-property'
)
    .requires(
        'plusplus.entities.trigger-controller'
)
    .defines(function() {
        "use strict";

        /**
         * Trigger controller that sets a {@link ig.EntityTriggerProperty#propertyName} in all targets to {@link ig.EntityTriggerProperty#activateValue} (if activating) or {@link ig.EntityTriggerProperty#deactivateValue} (if deactivating).
         * @class
         * @extends ig.EntityTriggerController
         * @memberof ig
         * @author Collin Hover - collinhover.com
         */
        ig.EntityTriggerProperty = ig.global.EntityTriggerProperty = ig.EntityTriggerController.extend( /**@lends ig.EntityTriggerProperty.prototype */ {

            /**
             * Name of property to change.
             * @type {String}
             * @default
             */
            propertyName: '',

            /**
             * Value of property when activating.
             * @type {*}
             * @default
             */
            activateValue: true,

            /**
             * Value of property when activating.
             * @type {*}
             * @default
             */
            deactivateValue: false,

            /**
             * @override
             */
            handleTargetsActivate: function() {

                if (this.propertyName) {

                    for (var i = 0, il = this.targetSequence.length; i < il; i++) {

                        this.targetSequence[i][this.propertyName] = this.activateValue;

                    }

                }

            },

            /**
             * @override
             */
            handleTargetsDeactivate: function() {

                if (this.propertyName) {

                    for (var i = 0, il = this.targetSequence.length; i < il; i++) {

                        this.targetSequence[i][this.propertyName] = this.deactivateValue;

                    }

                }

            }

        });

    });
