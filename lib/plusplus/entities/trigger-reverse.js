ig.module(
    'plusplus.entities.trigger-reverse'
)
    .requires(
        'plusplus.entities.trigger'
)
    .defines(function() {
        "use strict";

        /**
         * Trigger that deactivates instead of activating.
         * @class
         * @extends ig.EntityTrigger
         * @memberof ig
         * @author Collin Hover - collinhover.com
         **/
        ig.EntityTriggerReverse = ig.global.EntityTriggerReverse = ig.EntityTrigger.extend( /**@lends ig.EntityTriggerReverse.prototype */ {

            // editor properties

            _wmBoxColor: 'rgba( 255, 200, 0, 0.7 )',

            /**
             * @override
             */
            handleTargets: function(entity, needsActivation) {

                if (needsActivation !== false) {

                    this.deactivate(entity);

                }

                for (var i = 0, il = this.targetSequence.length; i < il; i++) {

                    var target = this.targetSequence[i];

                    if (target instanceof ig.EntityTriggerReverse) {

                        target.trigger(entity);

                    } else {

                        target.deactivate(entity);

                    }

                }

            },

            /**
             * Reverse trigger deactivates on activate.
             * @override
             **/
            activate: function(entity) {

                if (this.needsTeardown) {

                    this.teardown();

                }

                this.activated = false;

                if (this.deactivateCallback) {

                    this.deactivateCallback.call(this.deactivateContext || this, entity);

                }

            },

            /**
             * Reverse trigger activates on deactivate.
             * @override
             */
            deactivate: function(entity) {

                if (!this.needsTeardown) {

                    this.setup();

                }

                this.activated = true;

                if (this.activateCallback) {

                    this.activateCallback.call(this.activateContext || this, entity);

                }

                if (!this.triggering) {

                    this.trigger(entity, false);

                }

            }

        });

    });
