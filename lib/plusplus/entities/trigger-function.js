ig.module(
    'plusplus.entities.trigger-function'
)
    .requires(
        'plusplus.entities.trigger'
)
    .defines(function() {
        "use strict";

        /**
         * Trigger that calls a {@link ig.EntityTriggerProperty#functionName} in all targets.
         * @class
         * @extends ig.EntityTrigger
         * @memberof ig
         * @author Collin Hover - collinhover.com
         */
        ig.EntityTriggerFunction = ig.global.EntityTriggerFunction = ig.EntityTrigger.extend( /**@lends ig.EntityTriggerFunction.prototype */ {

            /**
             * Name of function to call.
             * @type {String}
             * @default
             */
            functionName: '',

            /**
             * @override
             */
            handleTargets: function(entity, needsActivation) {

                if (needsActivation !== false) {

                    this.activate(entity);

                }

                if (this.functionName) {

                    for (var i = 0, il = this.targetSequence.length; i < il; i++) {

                        var target = this.targetSequence[i];

                        if (typeof target[this.functionName] === 'function') {

                            target[this.functionName]();

                        }

                    }

                }

            }

        });

    });
