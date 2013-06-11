ig.module(
        'plusplus.entities.trigger-reverse'
    )
    .requires(
        'plusplus.entities.trigger'
    )
    .defines(function () {
        "use strict";

        /**
         * Trigger that deactivates instead of activating.
         * @class
         * @extends ig.EntityTrigger
         * @memberof ig
         * @author Collin Hover - collinhover.com
         **/
        ig.EntityTriggerReverse = ig.global.EntityTriggerReverse = ig.EntityTrigger.extend(/**@lends ig.EntityTriggerReverse.prototype */{

            // editor properties

            _wmBoxColor: 'rgba( 255, 200, 0, 0.7 )',

            /**
             * Reverse trigger deactivates all targets and self.
             * @override
             **/
            trigger: function (other) {

                // deactivate self

                this.deactivate(other);

                // deactivate all targets

                for (var name in this.target) {

                    var entity = ig.game.namedEntities[this.target[ name ]];

                    if (entity) {

                        entity.deactivate(other);

                    }

                }

                this.complete();

            },

            /**
             * Reverse trigger sets self as not activated on activate.
             * @override
             **/
            activate: function () {

                this.activated = false;

            },

            /**
             * Reverse trigger sets self as activated on deactivate.
             * @override
             **/
            deactivate: function () {

                this.activated = true;

            }

        });

    });