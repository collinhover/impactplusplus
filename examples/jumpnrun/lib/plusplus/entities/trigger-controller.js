ig.module(
        'plusplus.entities.trigger-controller'
    )
    .requires(
        'plusplus.entities.trigger-constant'
    )
    .defines(function () {
        "use strict";

        /**
         * Trigger that activates or deactivates targets based on whether it is activated or deactivated.
         * <br>- this entity can be used to set up a system of activating and deactivating triggers
         * <br>- very useful for setting up spawn and despawn areas in levels for higher performance
         * @class
         * @extends ig.EntityTriggerConstant
         * @memberof ig
         * @author Collin Hover - collinhover.com
         **/
        ig.EntityTriggerController = ig.global.EntityTriggerController = ig.EntityTriggerConstant.extend(/**@lends ig.EntityTriggerController.prototype */{

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
             */
            once: false,

            /**
             * Controller activates all targets and calls complete.
             * @override
             **/
            activate: function (other) {

                var entity;
                var name;

                this.parent();

                // activate targets

                for (name in this.target) {

                    entity = ig.game.namedEntities[this.target[ name ]];

                    if (entity) {

                        entity.activate(other);

                    }

                }

                this.complete();

            },

            /**
             * Controller deactivates all targets and calls complete.
             * @override
             **/
            deactivate: function (other) {

                var entity;
                var name;

                this.parent();

                // deactivate targets

                for (name in this.target) {

                    entity = ig.game.namedEntities[this.target[ name ]];

                    if (entity) {

                        entity.deactivate(other);

                    }

                }

                this.complete();

            }

        });

    });