ig.module(
    'plusplus.entities.trigger'
)
    .requires(
        'plusplus.core.timer',
        'plusplus.core.entity',
        'plusplus.helpers.utils',
        'plusplus.helpers.signals'
)
    .defines(function() {
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
         * // provided you've added the names of targets
         * trigger.target.1 = "unique_target_001";
         * trigger.target.2 = "unique_target_002";
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
        ig.EntityTrigger = ig.global.EntityTrigger = ig.EntityExtended.extend( /**@lends ig.EntityTrigger.prototype */ {

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
             * Whether entity that checks and causes trigger to activate should be used as a target.
             * @type Boolean
             * @default
             */
            useCheckingAsTarget: false,

            /**
             * Whether trigger is in the process of triggering.
             * @type Boolean
             * @default
             * @readonly
             */
            triggering: false,

            /**
             * Whether trigger should automatically call the complete method when finished triggering.
             * <span class="alert alert-info"><strong>Tip:</strong> set this to false to handle completing manually!</span>
             * @type Boolean
             * @default
             */
            autoComplete: true,

            /**
             * Whether trigger should auto toggle back to default state after done checking against an entity.
             * @type Boolean
             * @default
             */
            autoToggle: false,

            /**
             * Whether trigger should call the {@link ig.EntityTrigger#teardown} method when complete, or only on deactivate and cleanup.
             * @type Boolean
             * @default
             */
            teardownWhenComplete: true,

            /**
             * Timer to handle wait duration.
             * <br>- created on init
             * @type ig.Timer
             */
            waitTimer: null,

            /**
             * Timer to handle delay duration.
             * <br>- created on init
             * @type ig.Timer
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
            initTypes: function() {

                this.parent();

                _ut.addType(ig.EntityExtended, this, 'type', "TRIGGER");

                // by default triggers should only check for player

                _ut.addType(ig.EntityExtended, this, 'checkAgainst', "PLAYER");

            },

            /**
             * Initializes trigger properties.
             * @see ig.EntityExtended.
             **/
            initProperties: function() {

                this.parent();

                this.waitTimer = new ig.Timer();
                this.delayTimer = new ig.Timer();

                this.onCompleted = new ig.Signal();

            },

            /**
             * @override
             */
            resetExtras: function() {

                var activated = this.activated;

                this.activated = false;

                this.parent();

                // start with trigger if activated upon spawn
                // entity will activate self normally
                // but we want trigger instead of activate

                if (activated) {

                    this.trigger();

                }

            },

            /**
             * Checks trigger against entity and tries to trigger.
             * @override
             **/
            check: function(entity) {

                this.parent(entity);

                if (this.triggerable) {

                    this.trigger(entity, true, true);

                }

            },

            /**
             * Called when triggering to activate self and all targets.
             * @param {ig.EntityExtended} [entity] entity calling trigger.
             * @param {Boolean} [needsActivation=true] whether to activating self in addition to targets.
             * @param {Boolean} [entityIsChecking=false] whether entity is checking.
             **/
            trigger: function(entity, needsActivation, entityIsChecking) {

                if (this.getCanTrigger(entity)) {

                    // delay

                    if (this.delay > 0 && !this._delaying) {

                        this._delaying = true;

                        // setting new delay resets timer paused at
                        // so we'll need to restore it after setting new delay

                        var pausedAt = this.delayTimer.pausedAt;

                        this.delayTimer.set(this.delay);

                        this.delayTimer.pausedAt = pausedAt;

                    }

                    // trigger

                    if (this.delayTimer.delta() >= 0) {

                        this._delaying = false;
                        this.triggering = true;

                        // get all targets

                        this.targetSequence.length = 0;

                        for (var name in this.target) {

                            var target = ig.game.namedEntities[this.target[name]];

                            if (target && !target.triggering) {

                                this.targetSequence.push(target);

                            }

                        }

                        if (entityIsChecking && this.useCheckingAsTarget) {

                            _ut.arrayCautiousAdd(this.targetSequence, entity);

                        }

                        if (this.sortTargetsBy) {

                            this.targetSequence.sort(this.sortTargetsBy);

                        }

                        // activate self and targets

                        this.handleTargets(entity, needsActivation);

                        // finish triggering

                        if (this.wait) {

                            this.waitTimer.set(this.wait);

                        }

                        this.triggering = false;

                        if (this.autoComplete) {

                            this.complete();

                        }

                    }

                }

            },

            /**
             * Gets whether trigger can be triggered.
             * @param {ig.EntityExtended} entity entity trying to trigger this trigger.
             * @returns {Boolean} whether trigger can be triggered.
             **/
            getCanTrigger: function(entity) {

                return !this.triggering && (!this.once || !this.activated) && (!this.wait || this.waitTimer.delta() >= 0);

            },

            /**
             * Handles activating all self and targets in the target sequence.
             * <span class="alert alert-info"><strong>Tip:</strong> override this method to change how the trigger and each target is activated.</span>
             * @param {ig.EntityExtended} entity entity calling trigger.
             * @param {Boolean} [needsActivation=true] whether to activating self in addition to targets
             */
            handleTargets: function(entity, needsActivation) {

                if (needsActivation !== false) {

                    this.activate(entity);

                }

                for (var i = 0, il = this.targetSequence.length; i < il; i++) {

                    var target = this.targetSequence[i];

                    if (target instanceof ig.EntityTrigger) {

                        target.trigger(entity);

                    } else if (target.activate) {

                        target.activate(entity);

                    }

                }

            },

            /**
             * Activates and tries to trigger to ensure that triggers chain.
             * @override
             **/
            activate: function(entity) {

                if (!this.needsTeardown) {

                    this.setup();

                }

                if (!this.triggering) {

                    this.trigger(entity, false);

                }

                this.parent(entity);

            },

            /**
             * Deactivates and tears down trigger.
             * @override
             */
            deactivate: function(entity) {

                if (this.needsTeardown) {

                    this.teardown();

                }

                this.parent(entity);

            },

            /**
             * Called when finished triggering.
             **/
            complete: function() {

                this.onCompleted.dispatch();

                this.targetSequence.length = 0;

                if (this.suicidal) {

                    this.kill(true);

                } else {

                    // auto toggle to deactivate when not checking
                    // i.e. this trigger was activated by another trigger
                    // and not a collision

                    if (!this.checking && this.autoToggle && this.activated) {

                        this.deactivate();

                    } else if (this.teardownWhenComplete && this.needsTeardown) {

                        this.teardown();

                    }

                }

            },

            /**
             * Sets up trigger and makes temporary modifications, which are removed by {@link ig.EntityTrigger#teardown}.
             * <span class="alert alert-info"><strong>Tip:</strong> setup is called only on activate, while teardown is called on the 1) complete, 2) deactivate, and 3) cleanup methods. Complete is normally called immediately after activating/triggering, so if you don't want to teardown immediately use the {@link ig.EntityTrigger#teardownWhenComplete} property.</span>
             */
            setup: function() {

                this.needsTeardown = true;

            },

            /**
             * Tears down trigger and cleans up any temporary modifications trigger made by {@link ig.EntityTrigger#setup}.
             * <span class="alert alert-info"><strong>Tip:</strong> setup is called only on activate, while teardown is called on the 1) complete, 2) deactivate, and 3) cleanup methods. Complete is normally called immediately after activating/triggering, so if you don't want to teardown immediately use the {@link ig.EntityTrigger#teardownWhenComplete} property.</span>
             */
            teardown: function() {

                this.needsTeardown = false;

            },

            /**
             * @override
             **/
            pause: function() {

                this.parent();

                this.delayTimer.pause();
                this.waitTimer.pause();

            },

            /**
             * @override
             **/
            unpause: function() {

                this.parent();

                this.delayTimer.unpause();
                this.waitTimer.unpause();

            },

            /**
             * @override
             **/
            kill: function(silent) {

                this.triggerable = false;

                this.parent(silent);

            },

            /**
             * @override
             **/
            cleanup: function() {

                if (!ig.game.hasLevel) {

                    this.onCompleted.removeAll();
                    this.onCompleted.forget();

                }

                if (this.needsTeardown) {

                    this.teardown();

                }

                this.parent();

            },

            /**
             * Updates trigger and checks whether should trigger after delay.
             * @override
             */
            update: function() {

                if (!this.checking && this.wasChecking !== this.checking) {

                    if (!this.triggerAfterDelay) {

                        this._delaying = false;

                    }

                    if (this.autoToggle && this.activated) {

                        this.deactivate();

                    }

                }

                if (this._delaying && this.triggerAfterDelay && this.delayTimer.delta() >= 0) {

                    this.trigger(this);

                }

                this.parent();

            }

        });

        /*
         * overrides and fixes for when in editor
         */
        if (ig.global.wm) {

            delete ig.EntityExtended.prototype.staticInstantiate;

            ig.EntityTrigger.inject({

                trigger: function() {}

            });

        }

    });
