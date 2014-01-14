ig.module(
    'plusplus.abilities.ability'
)
    .requires(
        'plusplus.core.timer',
        'plusplus.core.entity',
        'plusplus.abstractities.particle',
        'plusplus.helpers.utils',
        'plusplus.helpers.utilsintersection',
        'plusplus.helpers.signals'
)
    .defines(function() {
        "use strict";

        var _ut = ig.utils;
        var _uti = ig.utilsintersection;
        var count = 0;

        /**
         * Base class for Abilities.
         * <br>- abilities are great for when your characters need to do special actions such as shooting, interacting, etc
         * <span class="alert alert-info"><strong>Tip:</strong> abilities include a visual casting / using system, see {@link ig.Ability#activateCastSettings} for examples.</span>
         * <span class="alert alert-danger"><strong>IMPORTANT:</strong> always use abilities by calling the {@link ig.Ability#activate} method, and if the ability {@link ig.Ability#requiresTarget} make sure it {@link ig.Ability#canFindTarget} or you supply one via {@link ig.Ability#setEntityTarget} or {@link ig.Ability#setEntityTargetFirst}!</span>
         * @class
         * @extends ig.Class
         * @memberof ig
         * @author Collin Hover - collinhover.com
         * @example
         * // using abilities is easy
         * // each character already has an abilities list
         * // which is a special hierarchy object
         * // that has built in methods to facilitate ability use
         * character.abilities = new ig.Hierarchy();
         * // but this abilities list is empty
         * // so create a new melee ability
         * // and don't forget to pass the entity
         * // so the ability has a reference to its user
         * character.melee = new ig.AbilityMelee( character );
         * // then, optionally, add the ability
         * // to the character's ability list
         * character.abilities.addDescendant( character.melee );
         * // now when our character needs to get violent
         * // and really punch something
         * character.melee.activate();
         * // the melee ability is a SPAMMABLE type
         * // so we can also find all SPAMMABLE abilities
         * // in the character's abilities list
         * var spammables = character.abilities.getDescendantsByType(ig.Ability.TYPE.SPAMMABLE);
         * // and activate each spammable ability
         * // which in this case is only the melee ability
         * for (var i = 0, il = spammables.length; i < il; i++) {
         *      spammables[ i ].activate();
         * }
         * // some abilities, such as melee
         * // will automatically find the closest target in range
         * // when activated, based on the canFindTarget property
         * character.melee.canFindTarget = true;
         * character.melee.activate();
         * // but what if we need to activate the ability
         * // on a specific entity?
         * character.melee.setEntityTarget( mySpecificTarget );
         * character.melee.activate();
         * // or, how about using the player's tap or click target
         * // get all input points that have tapped
         * var inputPoints = ig.input.getInputPoints([ 'tapped' ], [ true ]);
         * // for the example, use only the first
         * var inputPoint = inputPoints[ 0 ];
         * if ( inputPoint ) {
         *      // give the ability a list of targets under the tap
         *      // and let the ability choose the best
         *      character.melee.setEntityTargetFirst(inputPoint.targets);
         *      // now punch again!
         *      character.melee.activate();
         * }
         * // in the case of the player, melee works automatically with tapping
         * // this is because the melee ability is of the type spammable
         * // and the player is setup by default to use spammable abilities when a tap occurs
         * // ( as long as the tap is not on an interactive target )
         * ig.AbilityMelee = ig.AbilityDamage.extend({
         *      ...
         *      initTypes: function () {
         *          this.parent();
         *          ig.utils.addType(ig.Ability, this, 'type', "SPAMMABLE");
         *      }
         *      ...
         * });
         **/
        ig.Ability = ig.Class.extend( /**@lends ig.Ability.prototype */ {

            /**
             * Unique instance id.
             * @type String
             */
            id: count++,

            /**
             * Unique instance name.
             * <br>- usually names are used to map instances for faster searching.
             * @type String
             */
            name: '',

            /**
             * Flag for type of ability.
             * @type Number
             * @default
             * @see ig.utils#addType
             */
            type: 0,

            /**
             * Whether ability is paused.
             * @type Boolean
             * @default
             */
            paused: false,

            /**
             * Whether ability blocks other abilities of lower {@link ig.Ability#priority} when this ability is activated first via {@link ig.Hierarchy#activate}.
             * @type Boolean
             * @default
             * @example
             * // if a character has two abilities
             * character.abilityA = new ig.Ability( character );
             * character.abilityB = new ig.Ability( character );
             * // and these are added to the character's abilities list
             * character.abilities.addDescendants( [ character.abilityA, character.abilityB ] );
             * // when abilities are all activated together
             * character.abilities.activate( target );
             * // we can set abilities to block
             * // the execution of all lower priority abilities
             * // for example, to block B from executing if A is activated successfully
             * // (assuming A priority is > B priority)
             * character.abilityA.blocking = true;
             */
            blocking: true,

            /**
             * Priority of ability where higher is activated sooner when using {@link ig.Hierarchy#activate}.
             * @type Number
             * @default
             * @example
             * // if a character has two abilities
             * character.abilityA = new ig.Ability( character );
             * character.abilityB = new ig.Ability( character );
             * // and these are added to the character's abilities list
             * character.abilities.addDescendants( [ character.abilityA, character.abilityB ] );
             * // when these abilities are all activated together
             * character.abilities.activate( target );
             * // there is no guaranteed order of execution
             * // though in this case it would likely be A then B
             * // to change this order (or to guarantee order) use priorities
             * // for example, to guarantee execution order of B then A
             * character.abilityA.priority = 1;
             * character.abilityB.priority = 0;
             * // this only applies when these abilities are all activated together
             * character.abilities.activate( target );
             */
            priority: 0,

            /**
             * Whether ability is able to activate.
             * @type Boolean
             * @default
             */
            enabled: true,

            /**
             * Entity that is using this ability.
             * @type ig.EntityExtended
             * @default
             */
            entity: null,

            /**
             * Entity that provides options / settings for ability use.
             * @type ig.EntityExtended
             * @default
             */
            entityOptions: null,

            /**
             * Entity that is the target of this ability
             * @type ig.EntityExtended
             * @default
             */
            entityTarget: null,

            /**
             * Whether ability can be used while moving.
             * @type Boolean
             * @default
             */
            movable: false,

            /**
             * Whether ability should automatically force the entity to stop moving so it won't interrupt itself immediately.
             * @type Boolean
             * @default
             */
            autoStopMoving: true,

            /**
             * Whether ability should activate once and stay activated.
             * @type Boolean
             * @default
             */
            once: false,

            /**
             * Whether ability has been activated.
             * @type Boolean
             * @default
             */
            activated: false,

            /**
             * Whether ability needs deactivate.
             * @type Boolean
             * @default
             */
            needsDeactivate: false,

            /**
             * Whether ability should toggle activate / deactivate instead of just activating.
             * @type Boolean
             * @default
             */
            activateToggle: false,

            /**
             * Whether ability should check distance twice during activate process.
             * <span class="alert"><strong>IMPORTANT:</strong> this only applies when casting!</span>
             * @type Boolean
             * @default
             */
            activateStrict: true,

            /**
             * Whether ability is channelled after activated.
             * @type Boolean
             * @default
             */
            channelled: false,

            /**
             * Whether ability is currently channelling.
             * @type Boolean
             * @default
             * @readonly
             */
            channelling: false,

            /**
             * Energy cost to activate.
             * @type Number
             * @default
             */
            costActivate: 0,

            /**
             * Energy cost to channel.
             * @type Number
             * @default
             */
            costChannel: 0,

            /**
             * Time in seconds ability needs to cooldown between uses.
             * @type Number
             * @default
             */
            cooldownDelay: 0,

            /**
             * Timer for cooldown.
             * <br>- created on init
             * @type ig.Timer
             */
            cooldownTimer: null,

            /**
             * Timer for casting.
             * <br>- created on init
             * @type ig.Timer
             */
            castTimer: null,

            /**
             * Whether needs target to activate.
             * @type Boolean
             * @default
             */
            requiresTarget: false,

            /**
             * Whether can find a target in range when has none while executing.
             * @type Boolean
             * @default
             */
            canFindTarget: false,

            /**
             * Whether can target self.
             * @type Boolean
             * @default
             */
            canTargetSelf: true,

            /**
             * Whether can target others.
             * @type Boolean
             * @default
             */
            canTargetOthers: true,

            /**
             * Whether can target fixed entities (usually UI elements).
             * @type Boolean
             * @default
             */
            canTargetFixed: false,

            /**
             * Horizontal distance for finding targets from ability user, or to determine if ability user is close enough to target.
             * @example
             * // does not find targets and treats all targets as if within range
             * ability.rangeX = 0;
             * @default
             * @type Number
             */
            rangeX: 0,
            /**
             * Vertical distance for finding targets from ability user, or to determine if ability user is close enough to target.
             * @example
             * // does not find targets and treats all targets as if within range
             * ability.rangeY = 0;
             * @default
             * @type Number
             */
            rangeY: 0,

            /**
             * Flag for types of entities that can be targeted.
             * <span class="alert alert-info"><strong>Tip:</strong> a target must match ALL types in this flag!</span>
             * @example
             * // target any type
             * ability.typeTargetable = 0;
             * // target characters
             * ig.utils.addType( ig.EntityExtended, ability, 'typeTargetable', 'CHARACTER' );
             * // target characters that are zombies
             * ig.utils.addType( ig.EntityExtended, ability, 'typeTargetable', 'CHARACTER ZOMBIE' );
             * @default
             * @type Number
             * @see ig.utils#addType
             * @see ig.EntityExtended
             */
            typeTargetable: 0,

            /**
             * Flag for groups of entities that can be targeted.
             * <span class="alert alert-info"><strong>Tip:</strong> a target must match ALL groups in this flag!</span>
             * @example
             * // target any group except for own group
             * ability.groupTargetable = 0;
             * // target enemy
             * ig.utils.addType( ig.EntityExtended, ability, 'typeTargetable', 'ENEMY', 'GROUP' );
             * // target enemy zombies
             * ig.utils.addType( ig.EntityExtended, ability, 'typeTargetable', 'ENEMY ZOMBIES', 'GROUP' );
             * @default
             * @type Number
             * @see ig.utils#addType
             * @see ig.EntityExtended
             */
            groupTargetable: 0,

            /**
             * Whether to face target.
             * @type Boolean
             * @default
             */
            faceTarget: true,

            //
            /**
             * Whether to retain target after execution.
             * @type Boolean
             * @default
             */
            retainTarget: false,

            /**
             * Whether blocks user from regenerating while channelling.
             * @type Boolean
             * @default
             */
            regenBlocking: true,

            /**
             * Upgrade rank.
             * @type Number
             * @default
             */
            rank: 0,

            /**
             * Upgrades to apply, where each index corresponds to a rank.
             * @type Array
             */
            upgrades: [],

            /**
             * Whether to ability is casting.
             * @type Boolean
             * @default
             * @readonly
             */
            casting: false,

            /**
             * Activate cast settings.
             * @type Object
             * @default
             * @see {@link ig.Ability#cast}
             */
            activateCastSettings: null,

            /**
             * Activate checks pass cast settings.
             * @type Object
             * @default
             * @see {@link ig.Ability#cast}
             */
            activatePassCastSettings: null,

            /**
             * Activate setup cast settings.
             * @type Object
             * @default
             * @see {@link ig.Ability#cast}
             */
            activateSetupCastSettings: null,

            /**
             * Deactivate cast settings.
             * @type Object
             * @default
             * @see {@link ig.Ability#cast}
             */
            deactivateCastSettings: null,

            /**
             * Deactivate setup cast settings.
             * @type Object
             * @default
             * @see {@link ig.Ability#cast}
             */
            deactivateSetupCastSettings: null,

            /**
             * Fail cast settings.
             * @type Object
             * @default
             * @see {@link ig.Ability#cast}
             */
            failCastSettings: null,

            /**
             * Reason for ability failure.
             * @type String
             */
            failReason: '',

            /**
             * Signal dispatched when ability activates.
             * <br>- created on init.
             * @type ig.Signal
             */
            onActivated: null,

            /**
             * Signal dispatched when ability deactivates.
             * <br>- created on init.
             * @type ig.Signal
             */
            onDeactivated: null,

            /**
             * Signal dispatched when ability fails a check.
             * <br>- created on init.
             * @type ig.Signal
             */
            onFailed: null,

            // internal properties, do not modify

            _activating: false,
            _deactivating: false,
            _regenBlocked: false,
            _entityTargetRetained: false,

            /**
             * Initializes ability, called upon construction.
             * @param {ig.EntityExtended} entity entity using ability.
             * @param {Object} [settings] settings object.
             **/
            init: function(entity, settings) {

                this.id = count++;

                if (settings && !ig.global.wm) {

                    if (typeof settings.typeTargetable === 'string') {

                        _ut.addType(ig.EntityExtended, this, 'typeTargetable', settings.typeTargetable);
                        delete settings.typeTargetable;

                    }

                    if (typeof settings.groupTargetable === 'string') {

                        _ut.addType(ig.EntityExtended, this, 'groupTargetable', settings.groupTargetable, "GROUP");
                        delete settings.groupTargetable;

                    }

                    ig.merge(this, settings);

                }

                this.initTypes();

                this.initProperties();

                this.initUpgrades();

                this.setEntity(entity);

            },

            /**
             * Initializes ability types.
             **/
            initTypes: function() {},

            /**
             * Initializes ability properties.
             **/
            initProperties: function() {

                // timers

                this.castTimer = new ig.Timer();
                this.cooldownTimer = new ig.Timer();

                // signals

                this.onActivated = new ig.Signal();
                this.onDeactivated = new ig.Signal();
                this.onFailed = new ig.Signal();

            },

            /**
             * Initializes upgrades.
             **/
            initUpgrades: function() {},

            /**
             * Activates ability and starts activation process. Can also toggle between activate and deactivate using {@link ig.Ability#activateToggle} property.
             * <span class="alert alert-info"><strong>Tip:</strong> for best results, your custom ability should do all of its activate magic by overriding the {@link ig.Ability#activateComplete} method!</span>
             **/
            activate: function() {

                if (this.enabled) {

                    if (this.activateToggle && (this.needsDeactivate || this.activated)) {

                        return this.deactivate.apply(this, arguments);

                    } else if (!this._activating && !this.channelling) {

                        this.activated = false;

                        if (this.assert(this.cooledDown(), ig.Ability.FAIL.COOLDOWN)) {

                            return this.activateSetup.apply(this, arguments);

                        }

                    }

                }

            },

            /**
             * Activate without any parameters, used when setting entity to activate passive abilities.
             **/
            activatePlain: function() {

                return this.activate();

            },

            /**
             * DEPRECATED: please use {@link ig.Ability#activate} instead.
             **/
            execute: function() {
                console.warn("DEPRECATED: ig.Ability.execute has been replaced by ig.Ability.activate, and ig.Ability.activate's previous functionality is now handled by ig.Ability.activateComplete.");
                return this.activate.apply(arguments, this);

            },

            /**
             * Sets up ability to activate. Step 1 of activate process.
             * <span class="alert alert-info"><strong>Tip:</strong> for best results, your custom ability should do all of its activate magic by overriding the {@link ig.Ability#activateComplete} method!</span>
             **/
            activateSetup: function() {

                if (!this._activating) {

                    this.castEnd();

                    this._deactivating = false;
                    this.needsDeactivate = this._activating = true;

                    // try to look at target

                    if (this.faceTarget) {

                        this.entity.lookAt(this.entityTarget);

                    }

                    // cast first

                    if (this.activateSetupCastSettings) {

                        this.cast(this.activateSetupCastSettings, this.activateTry, arguments);

                    } else {

                        return this.activateTry.apply(this, arguments);

                    }

                }

            },

            /**
             * Tries to activate by doing checks. Step 2 of activate process.
             * <span class="alert alert-info"><strong>Tip:</strong> for best results, your custom ability should do all of its activate magic by overriding the {@link ig.Ability#activateComplete} method!</span>
             **/
            activateTry: function() {

                // no cost, only check if close enough

                if (this.costActivate === 0) {

                    if (this.assert(this.hasTarget(), ig.Ability.FAIL.TARGET) && this.assert(this.closeEnough(), ig.Ability.FAIL.DISTANCE)) {

                        if (this.activatePassCastSettings) {

                            this.cast(this.activatePassCastSettings, this.activatePass, arguments);

                        } else {

                            return this.activatePass.apply(this, arguments);

                        }

                    }

                }
                // has cost
                else if (this.assert(this.hasTarget(), ig.Ability.FAIL.TARGET) && this.assert(this.canPayCost(this.costActivate), ig.Ability.FAIL.COST) && this.assert(this.closeEnough(), ig.Ability.FAIL.DISTANCE)) {

                    this.extractCost(this.costActivate);

                    if (this.activatePassCastSettings) {

                        this.cast(this.activatePassCastSettings, this.activatePass, arguments);

                    } else {

                        return this.activatePass.apply(this, arguments);

                    }

                }

            },

            /**
             * Called when activate checks passed. Step 3 of activate process.
             * <span class="alert alert-info"><strong>Tip:</strong> for best results, your custom ability should do all of its activate magic by overriding the {@link ig.Ability#activateComplete} method!</span>
             **/
            activatePass: function() {

                if (!this.activatePassCastSettings || !this.activateStrict || this.assert(this.closeEnough(), ig.Ability.FAIL.DISTANCE)) {

                    return this.activateComplete.apply(this, arguments);

                }

            },

            /**
             * Completes activate. Step 4 of activate process.
             * <span class="alert alert-info"><strong>Tip:</strong> for best results, your custom ability should do all of its activate magic by overriding the {@link ig.Ability#activateComplete} method!</span>
             * <span class="alert"><strong>IMPORTANT:</strong> If overriding, always call this.parent() at the end of overriding method as target is dropped at the end of this method.</span>
             **/
            activateComplete: function() {

                this._activating = this._deactivating = false;
                this.needsDeactivate = true;
                this.activated = this.once || this.channelled;
                this.onActivated.dispatch(this);

                // start cooldown

                if (this.cooldownDelay > 0) {

                    this.cooldownTimer.set(this.cooldownDelay);

                }

                // try channel once to make sure any channel animations are set
                // this will also instantly deactivate if can't channel (which is probably good)

                if (this.activateCastSettings) {

                    this.cast(this.activateCastSettings, this.channelled ? this.channelTry : null);

                } else {

                    this.castEnd();

                    if (this.channelled) {

                        this.channelTry();

                    }

                }

                // drop target

                this.dropEntityTarget();

            },

            /**
             * Deactivates ability and stops channelling.
             * <span class="alert alert-info"><strong>Tip:</strong> for best results, your custom ability should do all of its deactivate magic by overriding the {@link ig.Ability#deactivateComplete} method!</span>
             **/
            deactivate: function() {

                return this.deactivateSetup.apply(this, arguments);

            },

            /**
             * Sets up ability to deactivate. Step 1 of deactivate process.
             * <span class="alert alert-info"><strong>Tip:</strong> for best results, your custom ability should do all of its deactivate magic by overriding the {@link ig.Ability#deactivateComplete} method!</span>
             **/
            deactivateSetup: function() {

                if (this.needsDeactivate && !this._deactivating) {

                    this._deactivating = true;
                    this.activated = this._activating = this.needsDeactivate = false;

                    if (this.channelling) {

                        this.channelStop();

                    }

                    this.castEnd();

                    // cast first

                    if (this.deactivateSetupCastSettings && !this.entity._killed) {

                        this.cast(this.deactivateSetupCastSettings, this.deactivateComplete, arguments);

                    } else {

                        return this.deactivateComplete.apply(this, arguments);

                    }

                }

            },

            /**
             * Finishes deactivate. Step 2 of deactivate process.
             * <span class="alert alert-info"><strong>Tip:</strong> for best results, your custom ability should do all of its deactivate magic by overriding the {@link ig.Ability#deactivateComplete} method!</span>
             * <span class="alert"><strong>IMPORTANT:</strong> If overriding, always call this.parent() at the end of overriding method as target is dropped at the end of this method.</span>
             **/
            deactivateComplete: function() {

                this._deactivating = false;

                this.onDeactivated.dispatch(this);

                if (this.deactivateCastSettings && !this.entity._killed) {

                    this.cast(this.deactivateCastSettings);

                } else {

                    this.castEnd();

                }

                // drop target

                this.dropEntityTarget();

            },

            /**
             * Cleans up ability by immediately and silently deactivating.
             **/
            cleanup: function() {

                // cleanup should be silent

                this.castEnd();

                // temporarily replace deactivate cast settings

                var deactivateSetupCastSettings = this.deactivateSetupCastSettings;
                var deactivateCastSettings = this.deactivateCastSettings;
                this.deactivateCastSettings = this.deactivateSetupCastSettings = null;

                var result = this.deactivate.apply(this, arguments);

                this.deactivateSetupCastSettings = deactivateSetupCastSettings;
                this.deactivateCastSettings = deactivateCastSettings;

                // clean signals when game is changing levels

                if (!ig.game.hasLevel) {

                    this.onActivated.removeAll();
                    this.onActivated.forget();
                    this.onDeactivated.removeAll();
                    this.onDeactivated.forget();
                    this.onFailed.removeAll();
                    this.onFailed.forget();

                }

                return result;

            },

            /**
             * Cleanup without parameters.
             **/
            cleanupPlain: function() {

                return this.cleanup();

            },

            /**
             * Pauses ability.
             **/
            pause: function() {

                this.paused = true;

                this.castTimer.pause();
                this.cooldownTimer.pause();

            },

            /**
             * Unpauses ability.
             **/
            unpause: function() {

                this.paused = false;

                this.castTimer.unpause();
                this.cooldownTimer.unpause();

            },

            /**
             * Sets enabled state ability.
             * @param {Boolean} [enabled=true] whether enabled.
             */
            setEnabled: function(enabled) {

                if (typeof enabled === 'undefined') {

                    enabled = true;

                }

                if (!enabled) {

                    this.disable();

                } else {

                    this.enable();

                }

            },

            /**
             * Enables ability, allowing it to {@link ig.Ability#activate}.
             **/
            enable: function() {

                this.enabled = true;

            },

            /**
             * Disables ability, disallowing it to {@link ig.Ability#activate} and deactivating it if activated.
             **/
            disable: function() {

                this.enabled = false;

                if (this.needsDeactivate || this.activated) {

                    return this.deactivateSetup(arguments);

                }

            },

            /**
             * Gets whether ability is finished cooling down.
             * @returns {Boolean} whether cooled down.
             */
            cooledDown: function() {

                return this.cooldownDelay <= 0 || this.cooldownTimer.delta() >= 0;

            },

            /**
             * Casts using delay and/or animation and then does callback.
             * <span class="alert"><strong>IMPORTANT:</strong> casting only works when ability is also updated.</span>
             * @param {Object} settings settings for casting.
             * @param {Function} [internalCallback] internal callback.
             * @param {Array} [internalArgs] internal arguments.
             * @example
             * // cast settings is a plain object
             * castSettings = {};
             * // casts based on 1 second delay
             * castSettings.delay = 1;
             * // add an animation to casting
             * // which will loop until delay complete
             * // if no delay is provided
             * // cast will only last as long as animation
             * castSettings.animName = 'casting';
             * // if the game is in top down mode
             * // the anim name may be changed
             * // based on the casting entity facing
             * // i.e. "shoot" becomes "shootX" when facing x
             * // i.e. "shoot" becomes "shootY" when facing y and can flip y
             * // i.e. "shoot" becomes "shootUp" when facing up and CANNOT flip y
             * // i.e. "shoot" becomes "shootDown" when facing down and CANNOT flip y
             * // this behavior can be overriden by making the anim omni directional
             * castSettings.animOmniDirectional = true;
             * // casting is by default interrupted by any movement
             * // but this can be changed in 2 ways
             * // either set the ability to movable
             * ability.movable = true;
             * // or set the particular cast to movable
             * castSettings.movable = true;
             * // sometimes we want to cast
             * // but we don't want the cast to block the ability activation process
             * // i.e. this cast should be asynchronous
             * castSettings.async = true;
             * // when casting is complete, we can call a function
             * castSettings.callback = function () { ... };
             * // in a context
             * castSettings.context = someObject;
             * // and pass a settings object to that callback
             * castSettings.settings = {...};
             * // while casting, we can also add a list of effects
             * castSettings.effects = [
             *      // where each effect is spawned by a plain object
             *      {
             *          // that consists of an entity class to spawn as the effect
             *          // which will be automatically killed when casting is ended
             *          // (usually effects should be particles, so they are garaunteed to die)
             *          entityClass: ig.EntityClass
             *          // a settings object that will be merged into the spawned entity effect
             *          settings: {...},
             *          // effect can ignore the duration of the cast
             *          // and live beyond the casting time
             *          ignoreDuration: true,
             *          // effect can be automatically faded
             *          // i.e. it will fade slowly from 1 to 0 over its life
             *          fade: true,
             *          // effects will default to follow the ability user
             *          // if follow settings are included
             *         // and these settings map to ig.EntityExtended's moveTo settings
             *          followSettings: {...},
             *          // and effects can also follow the ability target
             *          followTarget: true
             *      }
             *      // and we can create as many effects as needed (but don't be a jerk and overload)
             *      ...
             * ];
             **/
            cast: function(settings, internalCallback, internalArgs) {

                if (settings) {

                    var callback;
                    var args;

                    if (!settings.async) {

                        callback = internalCallback;
                        args = internalArgs;

                    }

                    var animName = settings.animName;

                    if (animName && !settings.animOmniDirectional) {

                        animName = this.entity.getDirectionalAnimName(animName);

                    }

                    var as = settings.animSettings || {};

                    // ensure that if animation will not complete on its own
                    // there is a delay so we don't cast forever

                    if (animName && !settings.delay && (!(!as.loop && !as.lock && !as.stop) || (as.frame && this.entity.anims[animName] && this.entity.anims[animName].stop))) {

                        settings.delay = 1;

                    }

                    // specific cast time

                    if (settings.delay) {

                        this.castStart(settings, callback, args);

                        this.castTimer.set(settings.delay);

                        if (animName) {

                            if (typeof as.loop === 'undefined') {

                                as.loop = true;

                            }

                            this.entity.animOverride(animName, as);

                        }

                    }
                    // cast time based on animation
                    else if (animName) {

                        this.castStart(settings, callback, args);

                        // auto complete cast at end of animation

                        var originalCallback = as.callback;
                        var originalContext = as.context;
                        as.callback = function() {

                            this.castComplete();

                            if (originalCallback) {

                                originalCallback.call(originalContext || this);

                            }

                        };
                        as.context = this;

                        this.entity.animOverride(animName, as);

                    } else {

                        this.castEffects(settings.effects);

                        if (callback) {

                            callback.apply(this, args);

                        }

                    }

                    if (settings.async && internalCallback) {

                        internalCallback.apply(this, internalArgs);

                    }

                } else if (internalCallback) {

                    internalCallback.apply(this, internalArgs);

                }

            },

            /**
             * Starts casting.
             * @param {Object} settings settings object.
             * @param {Function} [internalCallback] internal callback.
             * @param {Array} [internalArgs] internal arguments.
             **/
            castStart: function(settings, internalCallback, internalArgs) {

                this.castEnd();

                this.casting = true;
                this.castSettings = settings;
                this.castInternalCallback = internalCallback;
                this.castInternalArgs = internalArgs;

                // stop moving if cast would be interrupted by movement

                if (this.autoStopMoving && this.getInterrupted()) {

                    this.entity.moveAllStop();

                }

                this.castEffects(settings.effects);

            },

            /**
             * Updates casting.
             **/
            castUpdate: function() {

                // specific cast time

                if (this.castSettings && this.castSettings.delay && this.castTimer.delta() >= 0) {

                    this.castComplete();

                }
                // not already failed
                else if (!this.failReason) {

                    // interrupt when cannot move while casting and is moving

                    this.assert(!this.getInterrupted(), ig.Ability.FAIL.INTERRUPT);

                }

            },

            /**
             * Completes casting.
             **/
            castComplete: function() {

                var settings = this.castSettings;
                var internalCallback = this.castInternalCallback;
                var internalArgs = this.castInternalArgs;

                // end first, in case another cast is callback

                this.castEnd();

                // clear fail reason

                this.failReason = '';

                // do callbacks

                if (settings && settings.callback) {

                    settings.callback.apply(settings.context || this, settings.settings);

                }

                if (internalCallback) {

                    internalCallback.apply(this, internalArgs);

                }

            },

            /**
             * Ends casting.
             **/
            castEnd: function() {

                if (this.casting || this.castSettings) {

                    this.casting = false;

                    // kill effects if they are not particles

                    if (this.castSettings) {

                        var effects = this.castSettings.effects;

                        if (effects) {

                            for (var i = 0, il = effects.length; i < il; i++) {

                                this.effectEnd(effects[i]);

                            }

                        }

                        // release animation

                        var animName = this.castSettings.animName;

                        if (animName) {

                            if (!this.castSettings.animOmniDirectional) {

                                animName = this.entity.getDirectionalAnimName(animName);

                            }

                            this.entity.animRelease(animName, true);

                        }

                    }

                    this.castSettings = this.castInternalCallback = this.castInternalArgs = undefined;

                }

            },

            /**
             * Shows all effects for effects settings.
             * @param {Object} settings effects settings (i.e. castSettings.effects).
             */
            castEffects: function(effects) {

                if (effects && effects.length) {

                    for (var i = 0, il = effects.length; i < il; i++) {

                        this.effectStart(effects[i]);

                    }

                }

            },

            /**
             * Creates an effect.
             * @param {ig.Effect} effect effect.
             **/
            effectStart: function(effect) {

                var es = effect.settings || {};

                // handle lifetime and fadetime

                if (!effect.ignoreDuration) {

                    if (this.castSettings) {

                        // set lifetime of effect to cast delay or animation length

                        if (this.castSettings.delay) {

                            es.lifeDuration = this.castSettings.delay;

                        } else if (this.castSettings.animName) {

                            var anim = this.entity.anims[this.castSettings.animName];

                            if (anim) {

                                es.lifeDuration = anim.frameTime * anim.sequence.length;

                            }

                        }

                    }

                    // fade effect out over lifetime

                    if (effect.fade) {

                        es.fadeBeforeDeathDuration = es.fadeBeforeDeathDuration || 0;

                    }

                }

                // check if not following target or this has a target

                if (!effect.followTarget || this.entityTarget) {

                    // create entity

                    var entity = effect.entity = ig.game.spawnEntity(effect.entityClass, 0, 0, es);

                    // follow entity

                    if (effect.followSettings) {

                        if (typeof effect.followSettings.flipWith === 'undefined') {

                            effect.followSettings.flipWith = true;

                        }

                        if (effect.followTarget) {

                            if (this.entityTarget) {

                                entity.moveTo(this.entityTarget, effect.followSettings);

                            }

                        } else {

                            entity.moveTo(this.entity, effect.followSettings);

                        }

                    }
                    // center entity by default
                    else if (effect.center !== false) {

                        entity.pos.x = this.entity.pos.x + (this.entity.size.x - entity.size.x) * 0.5;
                        entity.pos.y = this.entity.pos.y + (this.entity.size.y - entity.size.y) * 0.5;

                    }

                }

            },

            /**
             * Ends an effect.
             * @param {ig.Effect} effect effect.
             **/
            effectEnd: function(effect) {

                if (effect.entity && !effect.entity._killed && (this.failReason === ig.Ability.FAIL.INTERRUPT || !(effect.entity instanceof ig.Particle))) {

                    effect.entity.kill();
                    effect.entity = undefined;

                }

            },

            /**
             * Updates ability.
             **/
            update: function() {

                if (this.enabled && !this.paused) {

                    if (this.casting) {

                        this.castUpdate();

                    }

                    if (this.activated && this.channelled) {

                        this.channelTry(arguments);

                    }

                }

            },

            /**
             * Trys to channel ability by doing checks. Step 1 of channel process.
             * @param {Array} [args] arguments to use in channel process.
             **/
            channelTry: function(args) {

                // stop moving if cast would be interrupted by movement

                if (!this.channelling && this.autoStopMoving && this.getInterrupted()) {

                    this.entity.moveAllStop();

                }

                // take cost of update and check if target still close enough

                if (this.costChannel === 0) {

                    if (this.assert(!this.getInterrupted(), ig.Ability.FAIL.INTERRUPT) && this.assert(this.closeEnough(), ig.Ability.FAIL.DISTANCE)) {

                        return this.channel.apply(this, args);

                    }

                } else if (this.assert(this.canPayCost(this.costChannel), ig.Ability.FAIL.COST) && this.assert(!this.getInterrupted(), ig.Ability.FAIL.INTERRUPT) && this.assert(this.closeEnough(), ig.Ability.FAIL.DISTANCE)) {

                    this.extractCost(this.costChannel);

                    return this.channel.apply(this, args);

                }

                // entity can't pay cost, deactivate ability

                return this.deactivate.apply(this, args);

            },

            /**
             * Channels ability. Step 2 of channel process.
             **/
            channel: function() {

                if (!this.channelling && this.regenBlocking) {

                    this.channelling = true;

                    this.blockRegen(this.entity);

                }

                if (this.faceTarget) {

                    this.entity.lookAt(this.entityTarget);

                }

            },

            /**
             * Stops channelling ability.
             **/
            channelStop: function() {

                this.channelling = false;
                this.unblockRegen(this.entity);

            },

            /**
             * Whether ability is in use (i.e. cast or channel).
             * @returns {Boolean} whether in use.
             */
            getUsing: function() {

                return this.casting || this.channelling;

            },

            /**
             * Whether ability is in active use (i.e. activated or cast or channel).
             * @returns {Boolean} whether in use.
             */
            getActivelyUsing: function() {

                return this.activated || this.getUsing();

            },

            /**
             * Whether ability is interrupted (currently only by movement)
             * @returns {Boolean} whether interrupted (currently only by movement).
             */
            getInterrupted: function() {

                return this.entity.moving && !(this.movable || (this.castSettings && this.castSettings.movable));

            },

            /**
             * Blocks energy regeneration in entity.
             * @param {ig.EntityExtended} entity block regeneration in this entity.
             **/
            blockRegen: function(entity) {

                if (entity.regenEnergy) {

                    this._regenBlocked = true;
                    entity.regenEnergy = false;

                }

            },

            /**
             * Unblocks energy regeneration in entity.
             * @param {ig.EntityExtended} entity block regeneration in this entity.
             **/
            unblockRegen: function(entity) {

                if (this._regenBlocked) {

                    entity.regenEnergy = true;
                    this._regenBlocked = false;

                }

            },

            /**
             * Sets the entity that is using this ability.
             * @param {ig.EntityExtended} entity ability user.
             **/
            setEntity: function(entity) {

                // clean previous

                if (this.entity) {

                    this.entity.onRemoved.remove(this.cleanupPlain, this);
                    this.entity.onAdded.remove(this.activatePlain, this);

                    this.cleanup();

                }

                // store new

                this.entity = entity;

                if (this.entity) {

                    // auto cleanup when entity is removed from game

                    this.entity.onRemoved.add(this.cleanupPlain, this);

                    // passive abilities should be turned on as soon as entity is added to game

                    if (this.type & ig.Ability.TYPE.PASSIVE) {

                        if (this.entity.added) {

                            this.activatePlain();

                        } else {

                            this.entity.onAdded.addOnce(this.activatePlain, this);

                        }

                    }

                }

            },

            /**
             * Sets the entity for passing to bindings as options. Normally the entity that the ability originated with.
             * @param {ig.EntityExtended} entity options provider.
             **/
            setEntityOptions: function(entity) {

                this.entityOptions = entity;

            },

            /**
             * Sets the entity for use as a target.
             * @param {ig.EntityExtended} entity entity target.
             **/
            setEntityTarget: function(entity) {

                // check type of entity against the types of entities this can target

                if (!entity || (this.entityTarget !== entity && this.isEntityTargetable(entity))) {

                    this.entityTarget = entity;
                    this._entityTargetRetained = false;

                }

            },

            /**
             * @param {ig.EntityExtended} entity entity target.
             * @returns {Boolean} Whether entity can (or should) be targeted.
             **/
            isEntityTargetable: function(entity) {

                return (!entity.fixed || this.canTargetFixed) && (!this.typeTargetable || (entity.type & this.typeTargetable) === this.typeTargetable && !(this.entity.group & entity.group)) && (!this.groupTargetable || (entity.group & this.groupTargetable) === this.groupTargetable) && ((this.canTargetOthers && this.entity !== entity) || (this.canTargetSelf && this.entity === entity));

            },

            /**
             * Sets first targetable entity from a list.
             * @param {Array} entities array of entities to test.
             **/
            setEntityTargetFirst: function(entities) {

                // try to set target until one set

                if (entities && entities.length) {

                    for (var i = 0, il = entities.length; i < il; i++) {

                        this.setEntityTarget(entities[i]);

                        if (this.entityTarget) {

                            break;

                        }

                    }

                }
                // set target to nothing
                else {

                    this.setEntityTarget();

                }

            },

            /**
             * Finds and sets closest targetable entity.
             **/
            setClosestEntityTarget: function() {

                // find all targetables

                if (this.rangeX > 0 || this.rangeY > 0) {

                    // clear current entity

                    if (this.entityTarget) {

                        this.setEntityTarget();

                    }

                    var entities = _uti.entitiesInAABB(
                        this.entity.pos.x - this.rangeX,
                        this.entity.pos.y - this.rangeY,
                        this.entity.pos.x + this.entity.size.x + this.rangeX,
                        this.entity.pos.y + this.entity.size.y + this.rangeY,
                        true
                    );

                    // try to set target until one set

                    this.setEntityTargetFirst(entities);

                }

            },

            /**
             * Retains or drops current entityTarget automatically.
             **/
            dropEntityTarget: function() {

                if (this.entityTarget) {

                    if (this.isEntityTargetDroppable()) {

                        this.setEntityTarget();

                    } else {

                        this._entityTargetRetained = true;

                    }

                }

            },

            /**
             * @returns {Boolean} Whether current entityTarget can (or should) be dropped.
             **/
            isEntityTargetDroppable: function() {

                return !((this.activated && this.channelled) || this.retainTarget);

            },

            /**
             * @returns {Boolean} if this has entityTarget. May also attempt to find target if possible.
             **/
            hasTarget: function() {

                // target is required

                if (this.requiresTarget) {

                    // has no target but able to find a target in range

                    if (this.canFindTarget && !this.entityTarget) {

                        this.setClosestEntityTarget();

                    }

                    // has target

                    if (this.entityTarget) {

                        return true;

                    }

                    return false;

                }

                return true;

            },

            /**
             * Checks if entityTarget is a valid target, as opposed to if is targetable.
             **/
            hasValidTarget: function() {

                return !this.requiresTarget || this.entityTarget;

            },

            /**
             * @returns {Boolean} if entity is close enough to entityTarget
             **/
            closeEnough: function() {

                // target is required

                if (this.requiresTarget) {

                    // has target

                    if (this.entityTarget) {

                        var interactiveTarget = this.entityTarget.type & ig.EntityExtended.TYPE.INTERACTIVE;

                        // infinite range

                        if ((this.rangeX === 0 && this.rangeY === 0) || (interactiveTarget && this.entityTarget.rangeInteractableX === 0 && this.entityTarget.rangeInteractableY === 0)) {

                            return true;

                        }
                        // check range allowable vs target range
                        else {

                            var rangeX;
                            var rangeY;

                            if (interactiveTarget) {

                                rangeX = Math.max(this.rangeX, this.entityTarget.rangeInteractableX);
                                rangeY = Math.max(this.rangeY, this.entityTarget.rangeInteractableY);

                            } else {

                                rangeX = this.rangeX;
                                rangeY = this.rangeY;

                            }

                            // expand entity bounds by activate distance and check if overlaps target bounds

                            var overlap = _uti.AABBIntersect(
                                this.entityTarget.pos.x,
                                this.entityTarget.pos.y,
                                this.entityTarget.pos.x + this.entityTarget.size.x,
                                this.entityTarget.pos.y + this.entityTarget.size.y,
                                this.entity.pos.x - rangeX,
                                this.entity.pos.y - rangeY,
                                this.entity.pos.x + this.entity.size.x + rangeX,
                                this.entity.pos.y + this.entity.size.y + rangeY
                            );

                            // flip entity to face target

                            if (this.faceTarget) {

                                this.entity.lookAt(this.entityTarget);

                            }

                            return overlap;

                        }

                    }
                    // no target
                    else {

                        return false;

                    }

                }

                return true;

            },

            /**
             * Evaluates a check result and triggers fail if a check is false.
             * @param {*} checkResult result of a check evaluated as truthy or falsy.
             * @param {String} failReason reason assert may fail.
             * @returns {Boolean} Whether a check is true.
             **/
            assert: function(checkResult, failReason) {

                if (!checkResult) {

                    this.fail(failReason);

                } else {

                    this.failReason = '';

                }

                return checkResult;

            },

            /**
             * Called when ability fails assert.
             * @param {String} [failReason=unknown] reason for failure.
             */
            fail: function(failReason) {

                this.failReason = failReason || ig.Ability.FAIL.UNKNOWN;

                this._activating = this._deactivating = false;

                // only end cast if interrupting

                if (this.failReason === ig.Ability.FAIL.INTERRUPT) {

                    this.castEnd();

                } else {

                    var fs = this.failCastSettings;

                    if (fs) {

                        // set fail reason as init anim of effects

                        if (fs.effects) {

                            for (var i = 0, il = fs.effects.length; i < il; i++) {

                                var effect = fs.effects[i];

                                effect.settings = effect.settings || {};
                                effect.settings.animInit = this.failReason;

                            }

                        }

                        if (this.failCastSettings) {

                            this.cast(this.failCastSettings);

                        } else {

                            this.castEnd();

                        }

                    }

                }

                this.onFailed.dispatch(this);

                // drop target

                this.dropEntityTarget();

            },

            /**
             * @returns {Boolean} Whether entity can pay energy cost.
             **/
            canPayCost: function(amount) {

                return !this.entity.hasOwnProperty('energy') || this.entity.invulnerable || this.entity.energy >= amount;

            },

            /**
             * Makes entity pay energy cost.
             **/
            extractCost: function(amount) {

                if (this.entity.drainEnergy) {

                    this.entity.drainEnergy(amount, this);

                }

            },

            /**
             * Adds upgrades to the upgrades list, where each upgrade is mapped by index to a rank.
             * @param {Object|Function|Array} upgrades object with properties to merge into this, a function to call upon upgrade, or an array of the previous.
             **/
            addUpgrades: function(upgrades) {

                _ut.arrayCautiousAddMulti(this.upgrades, upgrades);

            },

            /**
             * Upgrades ability to rank, or, if no rank passed, to next rank possible.
             * @param {Number|Boolean} [rank=this.rank+1] rank to upgrade to, where boolean true will upgrade to max rank.
             **/
            upgrade: function(rank) {

                if (rank === true) {

                    rank = this.upgrades.length;

                } else if (!_ut.isNumber(rank)) {

                    rank = this.rank + 1;

                }

                this.changegrade(rank);

            },

            /**
             * Downgrades ability to rank, or, if no rank passed, to previous rank possible. NOTE: Be cautious when using this on abilities that upgrade with a function and not properties.
             * @param {Number|Boolean} [rank=this.rank-1] rank to upgrade to, where boolean true downgrades to min rank.
             **/
            downgrade: function(rank) {

                if (rank === true) {

                    rank = 0;

                } else if (!_ut.isNumber(rank)) {

                    rank = this.rank - 1;

                }

                this.changegrade(rank);

            },

            /**
             * Shifts current upgrade rank up or down based on current vs passed.
             * @param {Number} rank rank to upgrade to.
             **/
            changegrade: function(rank) {

                var rankMax = this.upgrades.length;
                var direction = rank < this.rank ? -1 : 1;
                var rankNext = this.rank + direction;

                // clean up ability before upgrade

                if (this.rank !== rank) {

                    this.cleanup();

                }

                // do upgrades

                while (this.rank !== rank && rankNext < rankMax && rankNext >= 0) {

                    this.rank = rankNext;

                    var upgrade = this.upgrades[rankNext];
                    var entity = this.entity;
                    var entityOptions = this.entityOptions || entity;

                    if (typeof upgrade === 'function') {

                        upgrade.call(this, entity, entityOptions);

                    } else {

                        ig.merge(this, upgrade);

                    }

                    rankNext += direction;

                }

            },

            /**
             * Clones this ability object.
             * <span class="alert alert-danger"><strong>IMPORTANT:</strong> any class that extends {@link ig.Ability} must define {@link ig.Ability#clone} and call parent last.</span>
             * @param {ig.Ability} [c] ability object to clone into.
             * @returns {ig.Ability} copy of this.
             **/
            clone: function(c) {

                if (c instanceof ig.Ability !== true) {

                    c = new ig.Ability();

                }

                c.name = this.name;
                c.type = this.type;
                c.enabled = this.enabled;

                c.costActivate = this.costActivate;
                c.costDeactivate = this.costDeactivate;
                c.costChannel = this.costChannel;

                c.requiresTarget = this.requiresTarget;
                c.canFindTarget = this.canFindTarget;
                c.canTargetSelf = this.canTargetSelf;
                c.canTargetOthers = this.canTargetOthers;
                c.typeTargetable = this.typeTargetable;
                c.rangeX = this.rangeX;
                c.rangeY = this.rangeY;
                c.retainTarget = this.retainTarget;

                c.rank = this.rank;
                c.upgrades = this.upgrades.slice(0);

                c.regenBlocking = this.regenBlocking;

                c.setEntityOptions(this.entityOptions);
                c.setEntity(this.entity);

                return c;

            }

        });

        /**
         * Bitwise flags for abilities to designate types, via {@link ig.Ability#type}.
         * <br>- some flags are already defined for convenience
         * <br>- up to 32 flags can be defined
         * @static
         * @readonly
         * @memberof ig.Ability
         * @see ig.utils.getType
         * @see ig.utils.addType
         * @property {Bitflag} PASSIVE passive type
         * @property {Bitflag} SPAMMABLE spoammable type
         * @property {Bitflag} TOGGLEABLE toggleable type
         **/
        ig.Ability.TYPE;

        // add some base types

        _ut.getType(ig.Ability, "PASSIVE");
        _ut.getType(ig.Ability, "SPAMMABLE");
        _ut.getType(ig.Ability, "TOGGLEABLE");

        /**
         * Failure reasons for when an ability fails.
         * @readonly
         * @property {String} UNKNOWN - unknown.
         * @property {String} COST - user can't pay cost.
         * @property {String} TARGET - no target.
         * @property {String} DISTANCE - target is too far away.
         * @property {String} COOLDOWN - ability on cooldown.
         * @property {String} INTERRUPT - casting interrupted.
         */
        ig.Ability.FAIL = {
            UNKNOWN: 'unknown',
            COST: "cost",
            TARGET: "target",
            DISTANCE: "distance",
            COOLDOWN: "cooldown",
            INTERRUPT: "interrupt"
        }

    });
