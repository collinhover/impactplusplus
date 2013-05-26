ig.module(
        'plusplus.entities.trigger-input'
    )
    .requires(
        'plusplus.core.input',
        'plusplus.entities.trigger'
    )
    .defines(function () {
        "use strict";

        /**
         * Trigger that triggers on an input action rather than collision.
         * @class
         * @extends ig.EntityTrigger
         * @memberof ig
         * @author Collin Hover - collinhover.com
         **/
        ig.EntityTriggerInput = ig.global.EntityTriggerInput = ig.EntityTrigger.extend(/**@lends ig.EntityTriggerInput.prototype */{

            /**
             * Input action to listen for.
             * @type String
             */
            action: '',

            /**
             * Input trigger should not trigger through collision.
             * @type String
             */
            triggerable: false,

            /**
             * Updates input trigger and checks input state for {@link ig.EntityTriggerInput#action}.
             * @override
             */
            update: function () {

                if (!this._killed && this.action && ( ig.input.pressed(this.action) || ig.input.released(this.action) )) {

                    this.trigger();

                }

                this.parent();

            }

        });

    });