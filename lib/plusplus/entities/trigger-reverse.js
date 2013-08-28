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
            trigger: function (entity, unactivated ) {

                this._delaying = false;
                this.triggering = true;

                // wait

                if (this.wait) {

                    this.waitTimer.set(this.wait);

                }
                else {

                    this.targetSequence.length = 0;

                    for (var name in this.target) {

                        var target = ig.game.namedEntities[this.target[ name ]];

                        if (target && target.deactivate && !target.triggering ) {

                            this.targetSequence.push(target);

                        }

                    }

                    if (this.sortTargetsBy) {

                        this.targetSequence.sort(this.sortTargetsBy);

                    }

                    this.handleTargets( entity );

                }

                // activate self

                if ( !unactivated ) {

                    this.deactivate(entity);

                }

                this.complete();

            },

            /**
             * @override
             */
            handleTargets: function (entity) {

                for ( var i = 0, il = this.targetSequence.length; i < il; i++ ) {

                    this.targetSequence[i].deactivate(entity);

                }

            },

            /**
             * Reverse trigger sets self as not activated on activate.
             * @override
             **/
            activate: function ( entity ) {

                this.parent( entity );

                this.activated = false;

            },

            /**
             * Reverse trigger sets self as activated on deactivate.
             * @override
             **/
            deactivate: function ( entity ) {

                this.parent( entity );

                this.activated = true;

            }

        });

    });