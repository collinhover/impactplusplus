ig.module(
    'plusplus.entities.trigger-controller'
)
    .requires(
        'plusplus.entities.trigger-constant',
        'plusplus.entities.trigger-reverse'
)
    .defines(function() {
        "use strict";

        /**
         * Trigger that activates or deactivates targets based on whether it is activated or deactivated.
         * <br>- this entity can be used to set up a system of activating and deactivating triggers
         * <br>- very useful for setting up spawn and despawn areas in levels for better performance
         * @class
         * @extends ig.EntityTriggerConstant
         * @memberof ig
         * @author Collin Hover - collinhover.com
         **/
        ig.EntityTriggerController = ig.global.EntityTriggerController = ig.EntityTriggerConstant.extend( /**@lends ig.EntityTriggerController.prototype */ {

            // editor properties

            _wmBoxColor: 'rgba( 255, 150, 0, 0.7 )',

            /**
             * Controller should not trigger through collision.
             * @override
             * @default
             */
            triggerable: false,

            /**
             * Controller can activate or deactivate more than once in succession.
             * @override
             * @default
             */
            once: false,

            /**
             * Whether controller state is active.
             * @type Boolean
             * @default
             */
            activeState: true,

            /**
             * @override
             **/
            trigger: function(entity, needsActivation, activeState) {

                if (typeof activeState !== 'undefined') {

                    this.activeState = activeState;

                } else {

                    this.activeState = true;

                }

                this.parent(entity, needsActivation);

            },

            /**
             * @override
             */
            handleTargets: function(entity, needsActivation) {

                if (this.activeState) {

                    if (needsActivation !== false) {

                        this.activate(entity);

                    }

                    this.handleTargetsActivate();

                } else {

                    if (needsActivation !== false) {

                        this.deactivate(entity);

                    }

                    this.handleTargetsDeactivate();

                }

            },

            /**
             * Activates all handled targets.
             * @param {ig.EntityExtended} [entity]
             */
            handleTargetsActivate: function(entity) {

                for (var i = 0, il = this.targetSequence.length; i < il; i++) {

                    var target = this.targetSequence[i];

                    if (target instanceof ig.EntityTrigger && !(target instanceof ig.EntityTriggerReverse)) {

                        target.trigger(entity);

                    } else {

                        target.activate(entity);

                    }

                }

            },

            /**
             * Dectivates all handled targets.
             * @param {ig.EntityExtended} [entity]
             */
            handleTargetsDeactivate: function(entity) {

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
             * Controller deactivates all targets and calls complete.
             * @override
             **/
            deactivate: function(entity) {

                this.parent(entity);

                if (!this.triggering) {

                    this.trigger(entity, false, false);

                }

            }

        });

    });
