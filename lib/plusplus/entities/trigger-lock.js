ig.module(
        'plusplus.entities.trigger-lock'
    )
    .requires(
        'plusplus.entities.trigger'
    )
    .defines(function () {
        "use strict";

        /**
         * Trigger that locks targets.
         * @class
         * @extends ig.EntityTrigger
         * @memberof ig
         * @author Collin Hover - collinhover.com
         */
        ig.EntityTriggerLock = ig.global.EntityTriggerLock = ig.EntityTrigger.extend(/**@lends ig.EntityTriggerLock.prototype */{

            /**
             * @override
             */
            handleTargets: function () {

                for ( var i = 0, il = this.targetSequence.length; i < il; i++ ) {

                    this.targetSequence[i].lock();

                }

            }

        });

    });