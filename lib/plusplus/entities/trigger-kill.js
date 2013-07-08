ig.module(
        'plusplus.entities.trigger-kill'
    )
    .requires(
        'plusplus.entities.trigger'
    )
    .defines(function () {
        "use strict";

        /**
         * Trigger that kills all of its targets.
         * @class
         * @extends ig.EntityTrigger
         * @memberof ig
         * @author Collin Hover - collinhover.com
         **/
        ig.EntityTriggerKill = ig.global.EntityTriggerKill = ig.EntityTrigger.extend(/**@lends ig.EntityTriggerKill.prototype */{

            // editor properties

            _wmBoxColor: 'rgba( 200, 0, 150, 0.7 )',

            /**
             * Whether targets should be killed silently.
             * @type Boolean
             * @default
             */
            silently: false,

            /**
             * Trigger kills all targets.
             * @override
             **/
            trigger: function () {

                for (var name in this.target) {

                    var entity = ig.game.namedEntities[this.target[ name ]];

                    if (entity) {

                        entity.kill( this.silently );

                    }

                }

                this.complete();

            }

        });

    });