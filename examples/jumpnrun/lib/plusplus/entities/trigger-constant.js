ig.module(
        'plusplus.entities.trigger-constant'
    )
    .requires(
        'plusplus.entities.trigger'
    )
    .defines(function () {
        "use strict";

        /**
         * Convenience trigger that doesn't die after triggering.
         * @class
         * @extends ig.EntityTrigger
         * @memberof ig
         * @author Collin Hover - collinhover.com
         **/
        ig.EntityTriggerConstant = ig.global.EntityTriggerConstant = ig.EntityTrigger.extend(/**@lends ig.EntityTriggerConstant.prototype */{

            /**
             * Constant triggers should not die after triggering.
             * @override
             * @default
             */
            suicidal: false

        });

    });