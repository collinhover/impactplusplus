ig.module(
    'plusplus.entities.trigger-reverse-constant'
)
    .requires(
        'plusplus.entities.trigger-reverse'
)
    .defines(function() {
        "use strict";

        /**
         * Convenience reverse trigger that doesn't die after triggering.
         * @class
         * @extends ig.EntityTriggerReverse
         * @memberof ig
         * @author Collin Hover - collinhover.com
         **/
        ig.EntityTriggerReverseConstant = ig.global.EntityTriggerReverseConstant = ig.EntityTriggerReverse.extend( /**@lends ig.EntityTriggerReverseConstant.prototype */ {

            /**
             * Constant triggers should not die after triggering.
             * @override
             * @default
             */
            suicidal: false

        });

    });
