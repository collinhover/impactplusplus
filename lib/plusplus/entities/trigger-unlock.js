ig.module(
        'plusplus.entities.trigger-unlock'
    )
    .requires(
        'plusplus.entities.trigger'
    )
    .defines(function () {
        "use strict";

        /**
         * Trigger that unlocks targets.
         * @class
         * @extends ig.EntityTrigger
         * @memberof ig
         * @author Collin Hover - collinhover.com
         */
        ig.EntityTriggerUnlock = ig.global.EntityTriggerUnlock = ig.EntityTrigger.extend(/**@lends ig.EntityTriggerUnlock.prototype */{

            /**
             * @override
             */
            handleTargets: function () {

                for ( var i = 0, il = this.targetSequence.length; i < il; i++ ) {

                    this.targetSequence[i].unlock();

                }

            }

        });

    });