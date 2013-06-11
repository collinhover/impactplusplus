ig.module(
        'plusplus.entities.trigger'
    )
    .requires(
        'plusplus.core.timer',
        'plusplus.core.entity',
        'plusplus.helpers.utils',
        'plusplus.helpers.signals'
    )
    .defines(function () {
        "use strict";

        var _ut = ig.utils;

        /**
         * Trigger calling the activate function of each of its targets when a checked against entity enters it.
         * <span class="alert alert-info"><strong>Tip:</strong> many entities descend from trigger, so make sure to check before adding a trigger to trigger a trigger!</span>
         * @class
         * @extends ig.EntityExtended
         * @memberof ig
         * @author Collin Hover - collinhover.com
         * @author Dominic Szablewski
         * @example
         * // the trigger process is linear
         * // to start, the trigger needs to check against a type of entity
         * // by default, triggers only check against the player
         * ig.utils.addType(ig.EntityExtended, trigger, 'checkAgainst', "PLAYER");
         * // triggers can be expanded to check against other things, such as characters
         * ig.utils.addType(ig.EntityExtended, trigger, 'checkAgainst', "CHARACTER");
         * // or to ONLY check against a certain type
         * trigger.checkAgainst = 0;
         * ig.utils.addType(ig.EntityExtended, trigger, 'checkAgainst', "CERTAIN_TYPE");
         * // once the trigger checks against one of these types of entities
         * // the trigger automatically calls its trigger method (after an optional delay)
         * trigger.trigger( entityOfType );
         * // during the trigger method, targets are found by name and activated
         * target = ig.game.namedEntities[this.target[ name ]];
         * target.activate( entityOfType );
         * // and after all targets are taken care of, trigger activates itself
         * // this can be useful for entities that extend the trigger
         * // ex: instagib entity that kills player when they fall out of bounds
         * trigger.activate( entityOfType );
         * // also, the trigger deactivate method will reverse the trigger state
         * // and is useful for triggers that only activate once
         * trigger.deactivate( entity );
         * // and it is important to note that triggers are suicidal
         * // i.e. after triggering they remove themselves from the game
         * // but this can be changed easily
         * trigger.suicidal = false;
         **/
        ig.EntityTrigger = ig.global.EntityTrigger = ig.EntityExtended.extend(/**@lends ig.EntityTrigger.prototype */{

            // editor properties

            _wmScalable: true,
            _wmDrawBox: true,
            _wmBoxColor: 'rgba( 255, 255, 0, 0.7 )',

            /**
             * Triggers do not need to update.
             * @override
             * @default
             */
            frozen: true,

            /**
             * Map of names of target entities to activate when activated.
             * @type Object
             * @example
             * // a trigger can trigger any entity by name
             * entityA.name = 'foo';
             * triggerA.target.1 = 'foo';
             * // a trigger can trigger another trigger by name to create a chain
             * triggerA.name = 'bar';
             * triggerB.target.1 = 'bar';
             */
            target: {},

            /**
             * Duration in seconds before this trigger can be activated again.
             * @type Number
             * @default
             */
            wait: 0,

            /**
             * Duration in seconds to delay activation.
             * @type Number
             * @default
             */
            delay: 0,

            /**
             * Whether trigger should activate after delay regardless of whether triggering entity is still there.
             * @type Boolean
             * @default
             */
            triggerAfterDelay: false,

            /**
             * Whether trigger can only activate once before needed to be deactivated.
             * @type Boolean
             * @default
             */
            once: true,

            /**
             * Whether trigger kills itself after triggering once.
             * @type Boolean
             * @default
             */
            suicidal: true,

            /**
             * Whether trigger can be triggered through collision.
             * @type Boolean
             * @default
             */
            triggerable: true,

            /**
             * Whether trigger should auto toggle back to default state after done checking against an entity.
             * @type Boolean
             * @default
             */
            autoToggle: false,

            /**
             * Method to sort targets by when triggered.
             * @type Function
             * @default
             */
            sortTargetsBy: null,
            
            /**
             * Sorted list of targets, populated when triggered.
             * @type Array
             * @readonly
             */
            targetSequence: [],

            /**
             * Timer to handle wait duration.
             * <br>- created on init
             * @type ig.TimerExtended
             */
            waitTimer: null,

            /**
             * Timer to handle delay duration.
             * <br>- created on init
             * @type ig.TimerExtended
             */
            delayTimer: null,

            /**
             * Signal dispatched when trigger completes triggering.
             * <br>- created on init
             * @type ig.Signal
             */
            onCompleted: null,

            // internal properties, do not modify

            _delaying: false,

            /**
             * Initializes trigger types.
             * <br>- adds {@link ig.EntityExtended.TYPE.TRIGGER} to {@link ig.EntityExtended#type}
             * <br>- adds {@link ig.EntityExtended.TYPE.PLAYER} to {@link ig.EntityExtended#checkAgainst}
             * @override
             **/
            initTypes: function () {

                this.parent();

                _ut.addType(ig.EntityExtended, this, 'type', "TRIGGER");

                // by default triggers should only check for player

                _ut.addType(ig.EntityExtended, this, 'checkAgainst', "PLAYER");

            },

            /**
             * Initializes trigger properties.
             * @see ig.EntityExtended.
             **/
            initProperties: function () {

                this.parent();

                this.waitTimer = new ig.TimerExtended(0, this);
                this.delayTimer = new ig.TimerExtended(0, this);

                this.onCompleted = new ig.Signal();

            },

            /**
             * Checks trigger against entity and tries to trigger.
             * @override
             **/
            check: function (entity) {

                this.parent(entity);

                if (this.triggerable && ( !this.once || !this.activated ) && this.waitTimer.delta() >= 0) {

                    // delay

                    if (this.delay > 0 && !this._delaying) {

                        this._delaying = true;
                        this.delayTimer.set(this.delay);

                    }

                    // trigger

                    if (this.delayTimer.delta() >= 0) {

                        this.trigger(entity);

                    }

                }

            },

            /**
             * Called when triggering to activate self and all targets.
             **/
            trigger: function (entity) {

                this._delaying = false;

                // wait

                if (this.wait) {

                    this.waitTimer.set(this.wait);

                }

                // activate and sort all targets

                if (this.sortTargetsBy) {

                    this.targetSequence = [];

                    for (var name in this.target) {

                        var target = ig.game.namedEntities[this.target[ name ]];

                        if (target) {

                            target.activate(entity);
                            this.targetSequence.push(target);

                        }

                    }

                    this.targetSequence.sort(this.sortTargetsBy);

                }
                // activate all targets
                else {

                    for (var name in this.target) {

                        var target = ig.game.namedEntities[this.target[ name ]];

                        if (target) {

                            target.activate(entity);

                        }

                    }

                }

                // activate self

                this.activate(entity);

                this.complete();

            },

            /**
             * Called when finished triggering.
             **/
            complete: function () {

                this.onCompleted.dispatch();

                // disable and kill

                if (this.suicidal) {

                    this.kill( true );

                }

            },

            /**
             * @override
             **/
            kill: function ( silent ) {

                this.triggerable = false;

                this.parent( silent );

            },

            /**
             * @override
             **/
            cleanup: function () {

                if ( !ig.game.hasLevel ) {

                    this.onCompleted.removeAll();
                    this.onCompleted.forget();

                }

                this.parent();

            },

            /**
             * @override
             */
            checkStop: function () {

                this.parent();

                // stop _delaying

                if ( !this.triggerAfterDelay ) {

                    this._delaying = false;

                }

                // trigger should auto toggle

                if (this.autoToggle && this.activated) {

                    this.deactivate();

                }

            },

            /**
             * Updates trigger and checks whether should trigger after delay.
             * @override
             */
            update: function () {

                if ( this._delaying && this.triggerAfterDelay && this.delayTimer.delta() >= 0 ) {

                    this.trigger();

                }

                this.parent();

            }

        });

    });